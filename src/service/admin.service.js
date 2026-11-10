import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";
import { OFFLINE_AFTER_DAYS, TRIAL_DAYS, activeUntil, offlineAt, statusOf, untilFromYmd } from "../utils/plan.js";
import { PRICE, cancel, createPaymentLink, overdueInvoices } from "./billing.service.js";
import { notify } from "./email.service.js";
import { parseRange, summary } from "./stats.service.js";
import { admins } from "../middleware/auth.middleware.js";
import { Prisma } from "@prisma/client";
import { SUPPORT_TTL_MS, generateSupportToken } from "../utils/jwt.js";
import ListUserDto from "../dto/user/list.dto.js";

const DAY = 24 * 60 * 60 * 1000;
const TZ_SHIFT = 3 * 3600 * 1000; // Brasília
const ymd = (d) => new Date(d.getTime() - TZ_SHIFT).toISOString().slice(0, 10);
const money = (p) => ({ ...p, amount: Number(p.amount) }); // Decimal vira string no JSON

// Contas admin ficam fora da lista e dos números.
const notAdmin = () => Prisma.sql`lower(email) NOT IN (${Prisma.join(admins().length ? admins() : [""])})`;
// Pagante sem entrar no painel há este tempo = risco de cancelar.
export const IDLE_DAYS = 14;

// Auditoria: toda ação do admin fica na linha do tempo do usuário.
const log = (admin, action, userId, data) => prisma.activity.create({ data: { actor: admin.email, action, userId, data } });

const findUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: String(id) } });
  if (!user) throw httpError(404, "Usuário não encontrado.");
  return user;
};

// Nunca devolve senha nem hashes de token.
const safeUser = (u, now = new Date()) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  createAt: u.createAt,
  active: u.active,
  emailVerified: Boolean(u.emailVerifiedAt),
  paidUntil: u.paidUntil,
  activeUntil: activeUntil(u),
  offlineAt: offlineAt(u),
  status: statusOf(u, now),
  subscribed: Boolean(u.asaasSubscriptionId),
  lastSeenAt: u.lastSeenAt,
});

/** Últimos 12 meses (YYYY-MM, Brasília), do mais antigo ao atual. */
const lastMonths = (now) => {
  const [y, m] = ymd(now).split("-").map(Number);
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 12 + i, 1));
    return d.toISOString().slice(0, 7);
  });
};

export const overview = async (now = new Date()) => {
  const r = parseRange(); // últimos 30 dias, Brasília
  const months = lastMonths(now);
  const since = new Date(`${months[0]}-01T00:00:00-03:00`);
  const idle = new Date(now.getTime() - IDLE_DAYS * DAY);

  const [[users], [converted], revenue, signups, cards, views30, topCards, recent, [funnel], cancels, activity] = await Promise.all([
    prisma.$queryRaw`
      WITH u AS (SELECT *, greatest("createAt" + make_interval(days => ${TRIAL_DAYS}::int), coalesce("paidUntil", 'epoch')) AS au FROM "User" WHERE ${notAdmin()})
      SELECT count(*)::int AS total,
        count(*) FILTER (WHERE "createAt" >= ${r.gte})::int AS "new30",
        count(*) FILTER (WHERE NOT active)::int AS desativado,
        count(*) FILTER (WHERE active AND "paidUntil" > ${now})::int AS pagante,
        count(*) FILTER (WHERE active AND au > ${now} AND coalesce("paidUntil" <= ${now}, true))::int AS trial,
        count(*) FILTER (WHERE active AND au <= ${now} AND au + make_interval(days => ${OFFLINE_AFTER_DAYS}::int) > ${now})::int AS basico,
        count(*) FILTER (WHERE active AND au + make_interval(days => ${OFFLINE_AFTER_DAYS}::int) <= ${now})::int AS offline,
        count(*) FILTER (WHERE "asaasSubscriptionId" IS NOT NULL)::int AS assinantes,
        count(*) FILTER (WHERE "referredById" IS NOT NULL)::int AS indicados,
        count(*) FILTER (WHERE active AND "paidUntil" > ${now} AND coalesce("lastSeenAt" <= ${idle}, true))::int AS sumido,
        count(*) FILTER (WHERE "createAt" + make_interval(days => ${TRIAL_DAYS}::int) <= ${now})::int AS "trialEnded"
      FROM u`,
    prisma.$queryRaw`SELECT count(DISTINCT "userId")::int AS n FROM "Payment" WHERE amount > 0 AND "refundedAt" IS NULL`,
    prisma.$queryRaw`SELECT to_char(("createAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') AS month,
        sum(amount)::float AS total, count(*)::int AS count
      FROM "Payment" WHERE amount > 0 AND "refundedAt" IS NULL AND "createAt" >= ${since} GROUP BY 1`,
    prisma.$queryRaw`SELECT to_char(("createAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM "User" WHERE "createAt" >= ${r.gte} AND "createAt" < ${r.lt} AND ${notAdmin()} GROUP BY 1`,
    prisma.card.count(),
    prisma.event.count({ where: { kind: "view", createAt: { gte: r.gte } } }),
    prisma.$queryRaw`SELECT c.slug, c."userId", count(*)::int AS views FROM "Event" e JOIN "Card" c ON c.id = e."cardId"
      WHERE e.kind = 'view' AND e."createAt" >= ${r.gte} GROUP BY c.id ORDER BY views DESC LIMIT 5`,
    prisma.payment.findMany({ take: 20, orderBy: { createAt: "desc" }, include: { user: { select: { id: true, name: true, email: true } } } }),
    // Funil de ativação (todos os cadastros): cada etapa conta quem chegou até ela.
    prisma.$queryRaw`SELECT count(*)::int AS signed,
        count(*) FILTER (WHERE "emailVerifiedAt" IS NOT NULL)::int AS verified,
        count(*) FILTER (WHERE EXISTS (SELECT 1 FROM "Card" c WHERE c."userId" = u.id))::int AS "withCard",
        count(*) FILTER (WHERE EXISTS (SELECT 1 FROM "Card" c JOIN "Event" e ON e."cardId" = c.id WHERE c."userId" = u.id AND e.kind = 'view'))::int AS "withViews",
        count(*) FILTER (WHERE EXISTS (SELECT 1 FROM "Payment" p WHERE p."userId" = u.id AND p.amount > 0 AND p."refundedAt" IS NULL))::int AS paid
      FROM "User" u WHERE ${notAdmin()}`,
    prisma.$queryRaw`SELECT to_char(("createAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') AS month, count(*)::int AS count
      FROM "Activity" WHERE action = 'subscription.cancel' AND "createAt" >= ${since} GROUP BY 1`,
    prisma.activity.findMany({ where: { actor: { not: "usuario" }, action: { not: "note" } }, take: 15, orderBy: { createAt: "desc" } }),
  ]);

  const byMonth = new Map(revenue.map((x) => [x.month, x]));
  const cancelsByMonth = new Map(cancels.map((x) => [x.month, x.count]));
  const byDay = new Map(signups.map((x) => [x.day, x.count]));
  return {
    users,
    conversion: users.trialEnded ? converted.n / users.trialEnded : null,
    payingUsers: converted.n,
    revenueByMonth: months.map((month) => ({ month, total: byMonth.get(month)?.total ?? 0, count: byMonth.get(month)?.count ?? 0, cancels: cancelsByMonth.get(month) ?? 0 })),
    signupsByDay: Array.from({ length: r.days }, (_, i) => {
      const day = ymd(new Date(r.gte.getTime() + i * DAY + TZ_SHIFT));
      return { day, count: byDay.get(day) ?? 0 };
    }),
    cards,
    views30,
    topCards,
    recentPayments: recent.map(money),
    funnel,
    activity,
    idleDays: IDLE_DAYS,
  };
};

// Filtros de status em `where`, equivalentes a statusOf (activeUntil = max(cadastro + trial, paidUntil)).
const statusWhere = (status, now) => {
  const ago = (days) => new Date(now.getTime() - days * DAY);
  const notPaid = (at) => ({ OR: [{ paidUntil: null }, { paidUntil: { lte: at } }] });
  return {
    desativado: { active: false },
    pagante: { active: true, paidUntil: { gt: now } },
    trial: { active: true, createAt: { gt: ago(TRIAL_DAYS) }, ...notPaid(now) },
    basico: { active: true, createAt: { lte: ago(TRIAL_DAYS) }, AND: [notPaid(now), { OR: [{ createAt: { gt: ago(TRIAL_DAYS + OFFLINE_AFTER_DAYS) } }, { paidUntil: { gt: ago(OFFLINE_AFTER_DAYS) } }] }] },
    offline: { active: true, createAt: { lte: ago(TRIAL_DAYS + OFFLINE_AFTER_DAYS) }, ...notPaid(ago(OFFLINE_AFTER_DAYS)) },
    assinante: { asaasSubscriptionId: { not: null } },
    sumido: { active: true, paidUntil: { gt: now }, OR: [{ lastSeenAt: null }, { lastSeenAt: { lte: ago(IDLE_DAYS) } }] },
  }[status];
};

const PAGE = 50;
export const listUsers = async ({ q, status, page } = {}) => {
  const now = new Date();
  const term = String(q ?? "").trim().slice(0, 100);
  const search = term && { OR: [
    { email: { contains: term, mode: "insensitive" } },
    { name: { contains: term, mode: "insensitive" } },
    { cards: { some: { slug: { contains: term.toLowerCase() } } } },
  ] };
  // Contas admin não entram na lista nem nos números.
  const where = { AND: [{ email: { notIn: admins(), mode: "insensitive" } }, statusWhere(status, now), search].filter(Boolean) };
  const p = Math.max(1, Math.floor(Number(page)) || 1);
  const [rows, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE, include: { _count: { select: { cards: true } } } }),
    prisma.user.count({ where }),
  ]);
  return { users: rows.map((u) => ({ ...safeUser(u, now), cards: u._count.cards })), total, page: p, pageSize: PAGE };
};

export const userDetail = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: String(id) },
    include: {
      cards: { select: { id: true, slug: true, template: true, createAt: true, disabledAt: true, disabledReason: true }, orderBy: { createAt: "asc" } },
      payments: { orderBy: { createAt: "desc" } },
      emails: { select: { key: true, createAt: true }, orderBy: { createAt: "desc" }, take: 10 },
    },
  });
  if (!user) throw httpError(404, "Usuário não encontrado.");
  const since = new Date(Date.now() - 30 * DAY);
  const [views, referrer, referrals, activity, notes] = await Promise.all([
    prisma.event.groupBy({ by: ["cardId"], where: { cardId: { in: user.cards.map((c) => c.id) }, kind: "view", createAt: { gte: since } }, _count: true }),
    user.referredById ? prisma.user.findUnique({ where: { id: user.referredById }, select: { id: true, name: true, email: true } }) : null,
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.activity.findMany({ where: { userId: user.id, action: { not: "note" } }, orderBy: { createAt: "desc" }, take: 30 }),
    prisma.activity.findMany({ where: { userId: user.id, action: "note" }, orderBy: { createAt: "desc" } }),
  ]);
  return {
    ...safeUser(user),
    asaasCustomerId: user.asaasCustomerId,
    asaasSubscriptionId: user.asaasSubscriptionId,
    freeMonths: user.freeMonths,
    cards: user.cards.map((c) => ({ ...c, views30: views.find((v) => v.cardId === c.id)?._count ?? 0 })),
    payments: user.payments.map(money),
    emails: user.emails,
    referrer,
    referrals,
    activity,
    notes: notes.map((n) => ({ id: n.id, text: n.data?.text ?? "", by: n.actor, createAt: n.createAt })),
  };
};

export const METHODS = ["pix", "dinheiro", "transferencia", "cartao", "cortesia"];
const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Valida o lançamento manual. Cortesia = valor 0; o resto precisa de valor. */
export const parsePayment = (body = {}, now = new Date()) => {
  const amount = Math.round(Number(body.amount) * 100) / 100;
  if (!METHODS.includes(body.method)) throw httpError(400, "Escolha a forma de pagamento.");
  if (!Number.isFinite(amount) || amount < 0 || amount > 10000) throw httpError(400, "Valor inválido.");
  if (body.method === "cortesia" ? amount !== 0 : amount <= 0) throw httpError(400, body.method === "cortesia" ? "Cortesia não tem valor." : "Informe o valor recebido.");
  if (!YMD.test(String(body.until ?? "")) || isNaN(untilFromYmd(body.until))) throw httpError(400, "Data inválida.");
  const until = untilFromYmd(body.until);
  if (until <= now) throw httpError(400, "A data precisa ser no futuro.");
  return { amount, method: body.method, until, note: String(body.note ?? "").trim().slice(0, 200) || null };
};

// Pagou direto (ou cortesia): registra no histórico e o acesso passa a valer até `until`.
export const addPayment = async (admin, userId, body) => {
  const data = parsePayment(body);
  const user = await findUser(userId);
  const [payment] = await prisma.$transaction([
    prisma.payment.create({ data: { ...data, userId: user.id, prevPaidUntil: user.paidUntil, createdBy: admin.email } }),
    prisma.user.update({ where: { id: user.id }, data: { paidUntil: data.until } }),
  ]);
  await log(admin, "payment.add", user.id, { paymentId: payment.id, amount: data.amount, method: data.method, until: data.until });
  if (data.amount > 0) notify(user, "paymentConfirmed", { until: data.until }); // sem await: e-mail lento não segura o admin
  return money(payment);
};

// Desfaz um lançamento manual. Só volta o acesso se ele ainda for o que define o paidUntil
// (mesma regra do estorno no webhook); senão fica só marcado como desfeito no histórico.
export const undoPayment = async (admin, paymentId) => {
  const p = await prisma.payment.findUnique({ where: { id: String(paymentId) }, include: { user: true } });
  if (!p) throw httpError(404, "Pagamento não encontrado.");
  if (p.asaasId) throw httpError(400, "Pagamento do Asaas: estorne pelo painel do Asaas.");
  if (p.refundedAt) throw httpError(400, "Este lançamento já foi desfeito.");
  const restore = p.user.paidUntil?.getTime() === p.until.getTime();
  await prisma.$transaction([
    prisma.payment.update({ where: { id: p.id }, data: { refundedAt: new Date() } }),
    ...(restore ? [prisma.user.update({ where: { id: p.userId }, data: { paidUntil: p.prevPaidUntil } })] : []),
  ]);
  await log(admin, "payment.undo", p.userId, { paymentId: p.id, amount: Number(p.amount), restored: restore });
  return { restored: restore };
};

// Desativar: bloqueia login, derruba o refresh token e tira os cartões do ar (isOnline).
export const setActive = async (admin, userId, active) => {
  if (typeof active !== "boolean") throw httpError(400, "active precisa ser true ou false.");
  const user = await findUser(userId);
  if (user.id === admin.id) throw httpError(400, "Você não pode desativar a própria conta.");
  await prisma.user.update({ where: { id: user.id }, data: { active, ...(!active && { tokenVersion: { increment: 1 } }) } });
  await log(admin, "user.active", user.id, { active });
};

export const cancelSubscription = async (admin, userId) => {
  const user = await findUser(userId);
  await cancel(user.id, { silent: true, actor: admin.email });
};

/** Link avulso do Asaas. Valor opcional: sem valor = PRICE × meses. */
export const parseLink = (body = {}) => {
  const months = Number(body.months);
  if (!Number.isInteger(months) || months < 1 || months > 24) throw httpError(400, "Escolha de 1 a 24 meses.");
  const raw = body.amount === undefined || body.amount === null || body.amount === "" ? PRICE * months : Number(body.amount);
  const amount = Math.round(raw * 100) / 100;
  if (!Number.isFinite(amount) || amount < 5 || amount > 10000) throw httpError(400, "O Asaas aceita cobranças a partir de R$ 5,00.");
  return { months, amount, cpfCnpj: String(body.cpfCnpj ?? "").replace(/\D/g, "") };
};
export const paymentLink = async (admin, userId, body) => {
  const data = parseLink(body);
  const link = await createPaymentLink(String(userId), data);
  await log(admin, "payment.link", String(userId), { months: data.months, amount: data.amount, asaasId: link.id });
  return link;
};

// E-mail confirmado na mão (ex.: cliente sem acesso ao e-mail). Desmarcar volta a pedir confirmação.
export const setEmailVerified = async (admin, userId, verified) => {
  if (typeof verified !== "boolean") throw httpError(400, "verified precisa ser true ou false.");
  const user = await findUser(userId);
  await prisma.user.update({ where: { id: user.id }, data: verified
    ? { emailVerifiedAt: new Date(), verifyTokenHash: null, verifyTokenExp: null }
    : { emailVerifiedAt: null } });
  await log(admin, "user.verify", user.id, { verified });
};

// Estatísticas de qualquer cartão: o mesmo resumo que o dono vê no painel.
const findCard = async (cardId) => {
  const card = await prisma.card.findUnique({ where: { id: String(cardId) } });
  if (!card) throw httpError(404, "Card not found");
  return card;
};
export const card = findCard;
export const cardStats = async (cardId, query) => summary((await findCard(cardId)).userId, String(cardId), query);

export const overdue = () => overdueInvoices();

// Moderação: cartões mais recentes (criados ou editados), com filtro "só fora do ar".
export const listCards = async ({ q, disabled, page } = {}) => {
  const term = String(q ?? "").trim().toLowerCase().slice(0, 100);
  const where = { ...(term && { slug: { contains: term } }), ...(disabled === "1" && { disabledAt: { not: null } }) };
  const p = Math.max(1, Math.floor(Number(page)) || 1);
  const [rows, total] = await Promise.all([
    prisma.card.findMany({ where, orderBy: { updateAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE,
      select: { id: true, slug: true, template: true, config: true, createAt: true, updateAt: true, disabledAt: true, disabledReason: true,
        user: { select: { id: true, name: true, email: true } } } }),
    prisma.card.count({ where }),
  ]);
  return {
    cards: rows.map(({ config, ...c }) => ({ ...c, name: `${config?.name?.first ?? ""} ${config?.name?.last ?? ""}`.trim(), photo: config?.photo?.src ?? null, bio: config?.bio ?? null })),
    total, page: p, pageSize: PAGE,
  };
};

export const setCardDisabled = async (admin, cardId, { disabled, reason } = {}) => {
  if (typeof disabled !== "boolean") throw httpError(400, "disabled precisa ser true ou false.");
  const card = await findCard(cardId);
  const why = disabled ? String(reason ?? "").trim().slice(0, 200) || null : null;
  await prisma.card.update({ where: { id: card.id }, data: { disabledAt: disabled ? new Date() : null, disabledReason: why } });
  await log(admin, "card.disable", card.userId, { cardId: card.id, slug: card.slug, disabled, ...(why && { reason: why }) });
};

// CSV para planilha/contabilidade: ";" e vírgula decimal (Excel em português), BOM para os acentos.
export const toCsv = (header, rows) => {
  const cell = (v) => {
    let s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "number" ? String(v).replace(".", ",") : String(v);
    // Texto do usuário começando com = + - @ vira fórmula no Excel: o apóstrofo força texto.
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
};

export const exportCsv = async (kind) => {
  const now = new Date();
  if (kind === "usuarios") {
    const users = await prisma.user.findMany({ where: { email: { notIn: admins(), mode: "insensitive" } }, orderBy: { createAt: "asc" }, include: { _count: { select: { cards: true } } } });
    return { filename: `usuarios-${ymd(now)}.csv`, csv: toCsv(
      ["id", "nome", "email", "cadastro", "status", "valido_ate", "email_confirmado", "assinatura_asaas", "ultimo_acesso", "cartoes"],
      users.map((u) => [u.id, u.name, u.email, u.createAt, statusOf(u, now), activeUntil(u), u.emailVerifiedAt ? "sim" : "nao", u.asaasSubscriptionId ? "sim" : "nao", u.lastSeenAt, u._count.cards])) };
  }
  if (kind === "pagamentos") {
    const payments = await prisma.payment.findMany({ orderBy: { createAt: "asc" }, include: { user: { select: { name: true, email: true } } } });
    return { filename: `pagamentos-${ymd(now)}.csv`, csv: toCsv(
      ["id", "data", "nome", "email", "valor", "forma", "libera_ate", "asaas_id", "lancado_por", "estornado_em", "obs"],
      payments.map((p) => [p.id, p.createAt, p.user.name, p.user.email, Number(p.amount), p.method, p.until, p.asaasId, p.createdBy, p.refundedAt, p.note])) };
  }
  throw httpError(404, "Exportação desconhecida.");
};

// Abre o acesso de suporte: devolve uma sessão do painel na conta do cliente (aba separada no navegador do admin).
// O cliente vê a faixa enquanto a sessão estiver aberta e pode encerrar.
export const startSupport = async (admin, userId) => {
  const user = await findUser(userId);
  if (admins().includes(user.email.toLowerCase())) throw httpError(400, "Não dá para acessar outra conta de admin.");
  if (!user.active) throw httpError(400, "Conta desativada: reative antes de acessar.");
  const s = await prisma.supportSession.create({ data: { userId: user.id, adminEmail: admin.email, adminName: admin.name, expiresAt: new Date(Date.now() + SUPPORT_TTL_MS) } });
  await log(admin, "support.start", user.id, { sessionId: s.id });
  return { user: { ...new ListUserDto(user) }, accessToken: generateSupportToken(user, s.id), refreshToken: "", support: { by: admin.name || admin.email, expiresAt: s.expiresAt } };
};

// Anotações internas sobre o cliente (só o admin vê). Moram na Activity com action "note".
export const addNote = async (admin, userId, text) => {
  const t = String(text ?? "").trim();
  if (!t || t.length > 2000) throw httpError(400, "Escreva a anotação (até 2000 caracteres).");
  const user = await findUser(userId);
  const n = await log(admin, "note", user.id, { text: t });
  return { id: n.id, text: t, by: n.actor, createAt: n.createAt };
};

export const deleteNote = async (noteId) => {
  const { count } = await prisma.activity.deleteMany({ where: { id: Number(noteId) || 0, action: "note" } });
  if (!count) throw httpError(404, "Anotação não encontrada.");
};
