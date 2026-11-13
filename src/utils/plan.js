// Plano mensal (R$ 9,99) ou anual (R$ 99,90 = paga 10 meses, usa 12): 3 dias grátis a partir do cadastro, depois vale até `paidUntil`.
// ponytail: `paidUntil` no User em vez de tabela Subscription; o webhook do gateway só avança essa data.
// Criar a tabela quando precisar de histórico de cobranças ou mais de um plano.
export const TRIAL_DAYS = 3;
export const MAX_CARDS = 3;

const DAY = 24 * 60 * 60 * 1000;

// Admin = e-mail em ADMIN_EMAILS (separados por vírgula). Não paga e não tem limite de cartões.
export const admins = () => (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdmin = (user) => !!user?.email && admins().includes(user.email.toLowerCase());
const FOREVER = new Date("9999-12-31T23:59:59Z");

export const activeUntil = (user) => {
  if (isAdmin(user)) return FOREVER;
  const trialEnd = new Date(new Date(user.createAt).getTime() + TRIAL_DAYS * DAY);
  return user.paidUntil && new Date(user.paidUntil) > trialEnd ? new Date(user.paidUntil) : trialEnd;
};

// Pagamento com vencimento `dueDate` (YYYY-MM-DD) libera `months` meses (1 mensal, 12 anual) + 3 dias de folga
// (boleto compensa em até 3 dias úteis). Idempotente: o mesmo webhook repetido dá a mesma data.
export const GRACE_DAYS = 3;
export const addMonth = (date) => {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
};
export const paidUntilFrom = (dueDate, months = 1) => {
  const d = new Date(`${dueDate}T23:59:59-03:00`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return new Date(d.getTime() + GRACE_DAYS * DAY);
};

export const isActive = (user, now = new Date()) => activeUntil(user) > now;

// Assinatura vencida: o cartão fica OFFLINE_AFTER_DAYS dias no modo básico (dá tempo de pagar
// sem o QR impresso quebrar) e depois sai do ar até a pessoa assinar de novo.
export const OFFLINE_AFTER_DAYS = 5;
export const offlineAt = (user) => new Date(activeUntil(user).getTime() + OFFLINE_AFTER_DAYS * DAY);
// Conta desativada no admin tira os cartões do ar na hora.
export const isOnline = (user, now = new Date()) => user.active !== false && offlineAt(user) > now;

// Contas de antes da confirmação de e-mail (migração 20261112120000_email_verify) têm emailVerifiedAt vazio e cartões
// no ar: continuam publicadas. Daí em diante, o cartão só abre para o público depois de confirmar o e-mail.
const VERIFY_SINCE = new Date("2026-11-12T12:00:00Z");
export const isPublished = (user) => !!user.emailVerifiedAt || new Date(user.createAt) < VERIFY_SINCE;

// Uma palavra para o admin: desativado | pagante | trial | basico (vencido, ainda no ar) | offline.
export const statusOf = (user, now = new Date()) => {
  if (user.active === false) return "desativado";
  if (isActive(user, now)) return user.paidUntil && new Date(user.paidUntil) > now ? "pagante" : "trial";
  return isOnline(user, now) ? "basico" : "offline";
};

// "Válido até" escolhido no admin (YYYY-MM-DD) = fim daquele dia em Brasília.
export const untilFromYmd = (ymd) => new Date(`${ymd}T23:59:59-03:00`);

// Fica no layout "simples" (contatos + redes) e perde cupons, destaque, marcas, "agora" e o Conecta.
export const basicConfig = ({ featured, coupons, brands, now, connect, ...config }) => ({ ...config, style: "simples" });
