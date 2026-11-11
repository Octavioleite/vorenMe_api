import { timingSafeEqual } from "node:crypto";
import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";
import { activeUntil, addMonth, isActive, offlineAt, paidUntilFrom } from "../utils/plan.js";
import { notify, notifyOnce } from "./email.service.js";

// Asaas: https://docs.asaas.com — ASAAS_URL = https://api-sandbox.asaas.com/v3 (teste) ou https://api.asaas.com/v3.
export const PRICE = 9.99;

const asaas = async (path, method = "GET", body) => {
  const res = await fetch(process.env.ASAAS_URL + path, {
    method,
    headers: { "Content-Type": "application/json", access_token: process.env.ASAAS_API_KEY, "User-Agent": "VorenMe" },
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Erros de validação do Asaas (ex.: CPF inválido) vão para a pessoa; o resto vira 502.
    if (res.status === 400) throw httpError(400, json.errors?.map((e) => e.description).join(" · ") || "Dados inválidos");
    console.error("Asaas error:", res.status, json);
    throw httpError(502, "Não foi possível falar com o sistema de pagamento. Tente novamente.");
  }
  return json;
};

const ymd = (d) => new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10); // data em Brasília

const findUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, "Usuário não encontrado.");
  return user;
};

const pendingInvoiceUrl = async (subscriptionId) => {
  const { data } = await asaas(`/payments?subscription=${subscriptionId}&status=PENDING&limit=1`);
  return data?.[0]?.invoiceUrl ?? null;
};

export const status = async (userId) => {
  const user = await findUser(userId);
  return {
    activeUntil: activeUntil(user),
    offlineAt: offlineAt(user),
    active: isActive(user),
    subscribed: Boolean(user.asaasSubscriptionId),
    invoiceUrl: user.asaasSubscriptionId ? await pendingInvoiceUrl(user.asaasSubscriptionId) : null,
    referral: await referralInfo(user),
  };
};

const ensureCustomer = async (user, cpfCnpj) => {
  if (user.asaasCustomerId) return user.asaasCustomerId;
  const customer = await asaas("/customers", "POST", { name: user.name || user.email, email: user.email, cpfCnpj, externalReference: user.id });
  await prisma.user.update({ where: { id: user.id }, data: { asaasCustomerId: customer.id } });
  return customer.id;
};

// Link de pagamento avulso (gerado no admin): libera `months` meses a partir de quando for pago.
// Os meses vão no externalReference ("<userId>:link:<meses>") para o webhook saber quanto liberar.
export const createPaymentLink = async (userId, { amount, months, cpfCnpj }) => {
  const user = await findUser(userId);
  if (!user.asaasCustomerId && cpfCnpj.length !== 11 && cpfCnpj.length !== 14) throw httpError(400, "Informe o CPF ou CNPJ do cliente.");
  const customer = await ensureCustomer(user, cpfCnpj);
  const pay = await asaas("/payments", "POST", {
    customer,
    billingType: "UNDEFINED",
    value: amount,
    dueDate: ymd(new Date(Date.now() + 3 * 24 * 3600 * 1000)),
    description: `VorenMe — ${months} ${months === 1 ? "mês" : "meses"}`,
    externalReference: `${user.id}:link:${months}`,
  });
  return { id: pay.id, invoiceUrl: pay.invoiceUrl, value: pay.value, dueDate: pay.dueDate };
};

// Faturas vencidas e não pagas no Asaas, com o usuário de cada uma. Sem chave do Asaas: lista vazia.
// ponytail: só as 100 mais recentes; paginar com offset se a inadimplência passar disso.
export const overdueInvoices = async () => {
  if (!process.env.ASAAS_API_KEY || !process.env.ASAAS_URL) return { configured: false, invoices: [] };
  const { data = [] } = await asaas("/payments?status=OVERDUE&limit=100");
  const users = await prisma.user.findMany({ where: { asaasCustomerId: { in: data.map((p) => p.customer) } }, select: { id: true, name: true, email: true, asaasCustomerId: true } });
  return {
    configured: true,
    invoices: data.map((p) => ({ id: p.id, value: p.value, dueDate: p.dueDate, invoiceUrl: p.invoiceUrl, description: p.description,
      user: users.find((u) => u.asaasCustomerId === p.customer) ?? null })),
  };
};

// Cria cliente + assinatura mensal. A 1ª cobrança vence quando o trial (ou o período pago) acaba.
// billingType UNDEFINED: a pessoa escolhe Pix, boleto ou cartão na fatura do Asaas.
export const subscribe = async (userId, cpfCnpj) => {
  const user = await findUser(userId);
  if (user.asaasSubscriptionId) return { invoiceUrl: await pendingInvoiceUrl(user.asaasSubscriptionId) };

  const customerId = await ensureCustomer(user, cpfCnpj);

  const due = new Date(Math.max(Date.now(), activeUntil(user).getTime()));
  const sub = await asaas("/subscriptions", "POST", {
    customer: customerId,
    billingType: "UNDEFINED",
    value: PRICE,
    nextDueDate: ymd(due),
    cycle: "MONTHLY",
    description: "VorenMe — plano mensal",
    externalReference: user.id,
    // Depois de pagar, a fatura volta para o painel. O domínio precisa estar cadastrado na conta Asaas
    // (Minha Conta → Informações → Site), senão o Asaas recusa. Sem FRONT_URL (dev) fica sem redirect.
    ...(process.env.FRONT_URL && { callback: { successUrl: `${process.env.FRONT_URL}/painel/assinatura?pago=1`, autoRedirect: true } }),
  });
  await prisma.user.update({ where: { id: userId }, data: { asaasSubscriptionId: sub.id } });
  return { invoiceUrl: await pendingInvoiceUrl(sub.id) };
};

// Cancela na hora, sem retenção. O acesso continua até o fim do período já pago.
// `actor`: "usuario" ou o e-mail do admin. Cada cancelamento vira uma Activity (taxa de cancelamento no admin).
export const cancel = async (userId, { silent = false, actor = "usuario", reason } = {}) => {
  const user = await findUser(userId);
  if (!user.asaasSubscriptionId) return;
  await asaas(`/subscriptions/${user.asaasSubscriptionId}`, "DELETE");
  await prisma.user.update({ where: { id: userId }, data: { asaasSubscriptionId: null } });
  await prisma.activity.create({ data: { userId, actor, action: "subscription.cancel", data: { subscriptionId: user.asaasSubscriptionId, ...(reason && { reason }) } } });
  if (!silent) notify(user, "canceled", { activeUntil: activeUntil(user), offlineAt: offlineAt(user) });
};

// Código de indicação = slug do primeiro cartão (o mesmo que o selo "Feito com VorenMe" já leva na UTM).
const referralInfo = async (user) => {
  const [card, total, paid] = await Promise.all([
    prisma.card.findFirst({ where: { userId: user.id }, orderBy: { createAt: "asc" }, select: { slug: true } }),
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.user.count({ where: { referredById: user.id, referralRewarded: true } }),
  ]);
  return { code: card?.slug ?? null, total, paid, freeMonths: user.freeMonths };
};

// Mês grátis de indicação. Sem assinatura: estende o acesso direto. Com assinatura: vira crédito
// que apaga a próxima fatura pendente no Asaas (o acesso daquele mês é liberado como se tivesse pago).
// ponytail: depende do Asaas gerar a fatura seguinte normalmente depois de uma apagada; conferir no sandbox.
const applyCredit = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.asaasSubscriptionId || user.freeMonths < 1) return;
  const { data } = await asaas(`/payments?subscription=${user.asaasSubscriptionId}&status=PENDING&limit=1`);
  const pending = data?.[0];
  if (!pending) return; // aplica no PAYMENT_CREATED da próxima
  // Decremento condicional primeiro: dois webhooks simultâneos não gastam o mesmo crédito duas vezes.
  const { count } = await prisma.user.updateMany({ where: { id: userId, freeMonths: { gte: 1 } }, data: { freeMonths: { decrement: 1 } } });
  if (!count) return;
  await asaas(`/payments/${pending.id}`, "DELETE");
  const until = paidUntilFrom(pending.dueDate);
  if (!user.paidUntil || until > user.paidUntil) await prisma.user.update({ where: { id: userId }, data: { paidUntil: until } });
};

const rewardReferrer = async (user) => {
  if (!user.referredById || user.referralRewarded) return;
  const { count } = await prisma.user.updateMany({ where: { id: user.id, referralRewarded: false }, data: { referralRewarded: true } });
  if (!count) return; // webhook repetido
  const referrer = await prisma.user.findUnique({ where: { id: user.referredById } });
  if (!referrer) return;
  notify(referrer, "referralReward");
  if (referrer.asaasSubscriptionId) {
    await prisma.user.update({ where: { id: referrer.id }, data: { freeMonths: { increment: 1 } } });
    await applyCredit(referrer.id);
  } else {
    await prisma.user.update({ where: { id: referrer.id }, data: { paidUntil: addMonth(new Date(Math.max(Date.now(), activeUntil(referrer).getTime()))) } });
  }
};

const PAID = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
// PAYMENT_DELETED fica de fora: fatura apagada nunca foi paga (e é o que o crédito de indicação faz).
const REVERSED = ["PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED"];

export const validWebhookToken = (token) => {
  const expected = Buffer.from(process.env.ASAAS_WEBHOOK_TOKEN || "");
  const got = Buffer.from(String(token || ""));
  return expected.length > 0 && got.length === expected.length && timingSafeEqual(got, expected);
};

export const handleWebhook = async ({ event, payment }) => {
  if (!payment?.customer || !payment.dueDate) return;
  const user = await prisma.user.findUnique({ where: { asaasCustomerId: payment.customer } });
  if (!user) return;

  // Linha já gravada (CONFIRMED antes do RECEIVED, ou estorno): usa a data que ela liberou.
  const row = await prisma.payment.findUnique({ where: { asaasId: String(payment.id) } });
  const linkMonths = Number(/:link:(\d+)$/.exec(payment.externalReference ?? "")?.[1]);

  if (PAID.includes(event)) {
    let until = row?.until ?? paidUntilFrom(payment.dueDate);
    if (!row && linkMonths) { // link avulso: N meses a partir de hoje ou do fim do período atual
      until = new Date(Math.max(Date.now(), activeUntil(user).getTime()));
      for (let i = 0; i < linkMonths; i++) until = addMonth(until);
    }
    if (!user.paidUntil || until > user.paidUntil) await prisma.user.update({ where: { id: user.id }, data: { paidUntil: until } });
    // Histórico/receita do admin. Upsert: CONFIRMED e RECEIVED do mesmo pagamento viram uma linha só.
    await prisma.payment.upsert({
      where: { asaasId: payment.id },
      create: { userId: user.id, asaasId: payment.id, amount: payment.value ?? 0, method: "asaas", until, prevPaidUntil: user.paidUntil },
      update: {}, // corrida entre os dois: o 2º dá P2002 → 500 → o Asaas reenvia e cai aqui
    });
    // Um e-mail por pagamento (o Asaas manda CONFIRMED e depois RECEIVED para o mesmo pagamento).
    await notifyOnce(user, `paid:${payment.id}`, "paymentConfirmed", { until: user.paidUntil && user.paidUntil > until ? user.paidUntil : until });
    await rewardReferrer(user);
  } else if (event === "PAYMENT_CREATED") {
    await applyCredit(user.id);
  } else if (REVERSED.includes(event)) {
    await prisma.payment.updateMany({ where: { asaasId: payment.id, refundedAt: null }, data: { refundedAt: new Date() } });
    if (user.paidUntil?.getTime() !== (row?.until ?? paidUntilFrom(payment.dueDate)).getTime()) return;
    // ponytail: estorno só desfaz o último pagamento; recalcular pelo histórico se houver estorno de meses antigos.
    await prisma.user.update({ where: { id: user.id }, data: { paidUntil: row?.prevPaidUntil ?? null } });
  }
};
