import prisma from "../lib/prisma.js";
import { activeUntil, offlineAt } from "../utils/plan.js";
import { notifyOnce } from "./email.service.js";
import { pruneOld } from "./conecta.service.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ymd = (d) => new Date(d).toISOString().slice(0, 10);

/**
 * Quais lembretes esta pessoa deve receber agora. A chave leva a data do período,
 * então cada lembrete sai uma vez por período (e volta a valer se a pessoa pagar e vencer de novo).
 */
export const dueReminders = (user, now = new Date()) => {
  const until = activeUntil(user);
  const off = offlineAt(user);
  const t = now.getTime();
  const out = [];
  const within = (date, from, to) => date.getTime() - t > from && date.getTime() - t <= to;

  // Só no teste (nunca pagou e não assinou): na assinatura quem avisa a fatura é o Asaas.
  if (!user.paidUntil && !user.asaasSubscriptionId && within(until, 0, DAY)) out.push({ name: "trialEnding", key: `trial-ending:${ymd(until)}` });
  if (within(until, -DAY, 0)) out.push({ name: "expired", key: `expired:${ymd(until)}` });
  if (within(off, 0, DAY)) out.push({ name: "goingOffline", key: `going-offline:${ymd(off)}` });
  if (within(off, -DAY, 0)) out.push({ name: "offline", key: `offline:${ymd(off)}` });
  return out;
};

/** Uma rodada: só olha quem está perto de algum marco (vencimento até 1 dia à frente, ou saindo do ar). */
export const runReminders = async (now = new Date()) => {
  const users = await prisma.$queryRaw`
    SELECT id, email, name, "createAt", "paidUntil", "asaasSubscriptionId" FROM "User"
    WHERE active AND greatest("createAt" + interval '3 days', coalesce("paidUntil", 'epoch'))
      BETWEEN ${new Date(now.getTime() - 7 * DAY)} AND ${new Date(now.getTime() + 2 * DAY)}`;
  let sent = 0;
  for (const user of users) {
    for (const r of dueReminders(user, now)) {
      const data = { activeUntil: activeUntil(user), offlineAt: offlineAt(user), subscribed: Boolean(user.asaasSubscriptionId) };
      if (await notifyOnce(user, r.key, r.name, data)) sent++;
    }
  }
  if (sent) console.log(`[reminders] ${sent} e-mail(s) enviados`);
};

// ponytail: setInterval no próprio processo da API; trocar por cron externo se a API rodar em serverless.
// Mais de uma instância rodando ao mesmo tempo não duplica: a chave única do EmailLog segura.
export const startReminders = () => {
  const tick = () => {
    runReminders().catch((e) => console.error("Error running reminders:", e));
    pruneOld().catch((e) => console.error("Error pruning old events:", e));
  };
  setTimeout(tick, 30 * 1000);
  setInterval(tick, HOUR);
};
