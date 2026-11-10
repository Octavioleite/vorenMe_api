// Plano único (R$ 9,99/mês): 3 dias grátis a partir do cadastro, depois vale até `paidUntil`.
// ponytail: `paidUntil` no User em vez de tabela Subscription; o webhook do gateway só avança essa data.
// Criar a tabela quando precisar de histórico de cobranças ou mais de um plano.
export const TRIAL_DAYS = 3;
export const MAX_CARDS = 3;

const DAY = 24 * 60 * 60 * 1000;

export const activeUntil = (user) => {
  const trialEnd = new Date(new Date(user.createAt).getTime() + TRIAL_DAYS * DAY);
  return user.paidUntil && new Date(user.paidUntil) > trialEnd ? new Date(user.paidUntil) : trialEnd;
};

// Pagamento da mensalidade com vencimento `dueDate` (YYYY-MM-DD) libera 1 mês + 3 dias de folga
// (boleto compensa em até 3 dias úteis). Idempotente: o mesmo webhook repetido dá a mesma data.
export const GRACE_DAYS = 3;
export const addMonth = (date) => {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
};
export const paidUntilFrom = (dueDate) => new Date(addMonth(`${dueDate}T23:59:59-03:00`).getTime() + GRACE_DAYS * DAY);

export const isActive = (user, now = new Date()) => activeUntil(user) > now;

// Assinatura vencida: o cartão fica OFFLINE_AFTER_DAYS dias no modo básico (dá tempo de pagar
// sem o QR impresso quebrar) e depois sai do ar até a pessoa assinar de novo.
export const OFFLINE_AFTER_DAYS = 5;
export const offlineAt = (user) => new Date(activeUntil(user).getTime() + OFFLINE_AFTER_DAYS * DAY);
// Conta desativada no admin tira os cartões do ar na hora.
export const isOnline = (user, now = new Date()) => user.active !== false && offlineAt(user) > now;

// Uma palavra para o admin: desativado | pagante | trial | basico (vencido, ainda no ar) | offline.
export const statusOf = (user, now = new Date()) => {
  if (user.active === false) return "desativado";
  if (isActive(user, now)) return user.paidUntil && new Date(user.paidUntil) > now ? "pagante" : "trial";
  return isOnline(user, now) ? "basico" : "offline";
};

// "Válido até" escolhido no admin (YYYY-MM-DD) = fim daquele dia em Brasília.
export const untilFromYmd = (ymd) => new Date(`${ymd}T23:59:59-03:00`);

// Fica no layout "simples" (contatos + redes) e perde cupons, destaque, marcas e "agora".
export const basicConfig = ({ featured, coupons, brands, now, ...config }) => ({ ...config, style: "simples" });
