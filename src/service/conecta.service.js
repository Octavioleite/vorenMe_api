import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";
import { isActive, isOnline } from "../utils/plan.js";
import { normalizeConversion, normalizeLead, recommend } from "../utils/conecta.js";
import { findOwned } from "./card.service.js";
import { parseRange } from "./stats.service.js";
import { notify } from "./email.service.js";

const DAY = 24 * 60 * 60 * 1000;
const MAX_LEADS_PER_DAY = 100; // por cartão: freio contra robô enchendo o banco mesmo trocando de IP

/**
 * Métricas do Conecta no período. Tudo em visitantes únicos por dia (o id do visitante muda todo dia, ver
 * utils/conecta.js): "elegível" = abriu o cartão quando a ação estava nele; "clicou" = elegível que tocou nela.
 * Taxa de clique = clicou / elegível, no mesmo período.
 */
export const metrics = async (cardId, r) => {
  const range = { cardId, createAt: { gte: r.gte, lt: r.lt } };
  const [[totals], actions, services, leads, conversions] = await Promise.all([
    prisma.$queryRaw`SELECT
        count(DISTINCT visitor) FILTER (WHERE kind = 'view')::int AS visitors,
        count(DISTINCT visitor) FILTER (WHERE kind = 'section' AND target = 'conecta')::int AS "sectionViewers",
        count(DISTINCT visitor) FILTER (WHERE kind = 'click' AND action IS NOT NULL)::int AS "actionClickers",
        count(*) FILTER (WHERE kind = 'click' AND action IS NOT NULL AND target = 'whatsapp')::int AS "whatsappIntents"
      FROM "Event" WHERE "cardId" = ${cardId} AND "createAt" >= ${r.gte} AND "createAt" < ${r.lt} AND visitor IS NOT NULL`,
    prisma.$queryRaw`WITH v AS (
        SELECT DISTINCT visitor, unnest(shown) AS action FROM "Event"
        WHERE "cardId" = ${cardId} AND kind = 'view' AND visitor IS NOT NULL AND "createAt" >= ${r.gte} AND "createAt" < ${r.lt}
      ), c AS (
        SELECT visitor, action, count(*)::int AS clicks FROM "Event"
        WHERE "cardId" = ${cardId} AND kind = 'click' AND action IS NOT NULL AND visitor IS NOT NULL AND "createAt" >= ${r.gte} AND "createAt" < ${r.lt}
        GROUP BY 1, 2
      )
      SELECT v.action AS id, count(*)::int AS eligible, count(c.visitor)::int AS clickers, coalesce(sum(c.clicks), 0)::int AS clicks
      FROM v LEFT JOIN c USING (visitor, action) GROUP BY v.action`,
    prisma.$queryRaw`SELECT interest AS id, count(DISTINCT visitor)::int AS clickers, count(*)::int AS clicks FROM "Event"
      WHERE "cardId" = ${cardId} AND kind = 'click' AND interest IS NOT NULL AND visitor IS NOT NULL AND "createAt" >= ${r.gte} AND "createAt" < ${r.lt}
      GROUP BY 1`,
    prisma.lead.count({ where: range }),
    prisma.conversion.count({ where: { cardId, occurredAt: { gte: r.gte, lt: r.lt } } }),
  ]);
  return { ...totals, actions, services, leads, conversions };
};

export const summary = async (userId, cardId, query = {}) => {
  const card = await findOwned(userId, cardId);
  const r = parseRange(query);
  // Período anterior do mesmo tamanho, para "subiu/caiu X%".
  const [m, p] = await Promise.all([metrics(card.id, r), metrics(card.id, { gte: new Date(r.gte.getTime() - r.days * DAY), lt: r.gte })]);
  const previous = { visitors: p.visitors, actionClickers: p.actionClickers, leads: p.leads, conversions: p.conversions };
  return { from: r.from, to: r.to, days: r.days, ...m, previous, recommendations: recommend(m, card.config?.connect) };
};

/* Contatos (formulário público) */

export const createLead = async (slug, body) => {
  const card = await prisma.card.findUnique({
    where: { slug: String(slug).toLowerCase() },
    include: { user: { select: { id: true, name: true, email: true, createAt: true, paidUntil: true, active: true } } },
  });
  // Fora do ar ou no modo básico (sem Conecta): mesmo erro de formulário inexistente.
  if (!card || card.disabledAt || !isOnline(card.user) || !isActive(card.user)) throw httpError(404, "Este formulário não está mais disponível.");

  const { spam, errors, data } = normalizeLead(body, card.config?.connect);
  if (spam) return;
  if (errors.length) throw Object.assign(httpError(400, errors[0]), { errors });

  const recent = await prisma.lead.count({ where: { cardId: card.id, createAt: { gte: new Date(Date.now() - DAY) } } });
  if (recent >= MAX_LEADS_PER_DAY) throw httpError(429, "Recebemos muitos contatos agora. Tente pelo WhatsApp ou mais tarde.");

  await prisma.lead.create({ data: { ...data, cardId: card.id, consentAt: new Date() } });
  // O e-mail só avisa: os dados da pessoa ficam no painel, não na caixa de entrada.
  const label = card.config.connect.actions.find((a) => a.id === data.action)?.label;
  await notify(card.user, "newLead", { cardId: card.id, slug: card.slug, label });
};

export const listLeads = async (userId, cardId) => {
  await findOwned(userId, cardId);
  return prisma.lead.findMany({ where: { cardId }, orderBy: { createAt: "desc" }, take: 200 });
};

export const deleteLead = async (userId, cardId, leadId) => {
  await findOwned(userId, cardId);
  const { count } = await prisma.lead.deleteMany({ where: { id: String(leadId), cardId } });
  if (!count) throw httpError(404, "Contato não encontrado.");
};

/* Conversões registradas pelo dono */

export const listConversions = async (userId, cardId) => {
  await findOwned(userId, cardId);
  return prisma.conversion.findMany({ where: { cardId }, orderBy: [{ occurredAt: "desc" }, { createAt: "desc" }], take: 200 });
};

export const createConversion = async (userId, cardId, body) => {
  await findOwned(userId, cardId);
  const { errors, data } = normalizeConversion(body);
  if (errors.length) throw Object.assign(httpError(400, errors[0]), { errors });
  if (data.leadId && !(await prisma.lead.count({ where: { id: data.leadId, cardId } }))) throw httpError(404, "Contato não encontrado.");
  return prisma.conversion.create({ data: { ...data, cardId } });
};

export const deleteConversion = async (userId, cardId, conversionId) => {
  await findOwned(userId, cardId);
  const { count } = await prisma.conversion.deleteMany({ where: { id: String(conversionId), cardId } });
  if (!count) throw httpError(404, "Conversão não encontrada.");
};

/** Retenção: eventos vivem 13 meses (o painel mostra até 1 ano); contatos, 12 meses. Conversões ficam (sem dado pessoal). */
export const EVENT_DAYS = 400;
export const LEAD_DAYS = 365;
export const pruneOld = async (now = new Date()) => {
  const [events, leads] = await Promise.all([
    prisma.event.deleteMany({ where: { createAt: { lt: new Date(now.getTime() - EVENT_DAYS * DAY) } } }),
    prisma.lead.deleteMany({ where: { createAt: { lt: new Date(now.getTime() - LEAD_DAYS * DAY) } } }),
  ]);
  if (events.count || leads.count) console.log(`[retenção] ${events.count} evento(s) e ${leads.count} contato(s) antigos apagados`);
};
