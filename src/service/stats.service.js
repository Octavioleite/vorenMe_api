import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";

// Valores aceitos: o front manda, mas qualquer um pode chamar a rota pública, então só gravamos o que conhecemos.
export const TARGETS = ["whatsapp", "email", "site", "instagram", "tiktok", "youtube", "pinterest", "spotify", "x", "website",
  "cupom", "pix", "maps", "waze", "uber", "avaliar", "contato", "compartilhar", "destaque", "chamada", "marca", "link"];
export const SOURCES = ["instagram", "tiktok", "facebook", "whatsapp", "qr", "google", "youtube", "x", "linkedin", "compartilhado", "contato", "direto", "outro"];

export const normalizeEvent = (body) => {
  const kind = body?.kind === "click" ? "click" : body?.kind === "view" ? "view" : null;
  if (!kind) return null;
  const source = SOURCES.includes(body.source) ? body.source : "outro";
  const target = kind === "click" ? (TARGETS.includes(body.target) ? body.target : "link") : null;
  return { kind, source, target };
};

export const record = async (slug, body) => {
  const event = normalizeEvent(body);
  if (!event) return;
  const card = await prisma.card.findUnique({ where: { slug: String(slug).toLowerCase() }, select: { id: true } });
  if (card) await prisma.event.create({ data: { ...event, cardId: card.id } });
};

const DAY = 24 * 60 * 60 * 1000;
// "createAt" é timestamp sem fuso gravado em UTC: marcar como UTC antes de converter para Brasília,
// senão o Postgres trata o valor como horário de Brasília e soma 3h em vez de subtrair.
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const startOf = (ymd) => new Date(`${ymd}T00:00:00-03:00`); // datas no fuso de Brasília
const today = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
const shift = (ymd, days) => new Date(startOf(ymd).getTime() + days * DAY + 3 * 3600 * 1000).toISOString().slice(0, 10);

/** Período pedido: from/to (YYYY-MM-DD, inclusivos) ou os últimos 30 dias. Máximo 1 ano. */
export const parseRange = ({ from, to } = {}) => {
  const end = YMD.test(to ?? "") ? to : today();
  const begin = YMD.test(from ?? "") ? from : shift(end, -29);
  if (begin > end) throw httpError(400, "A data inicial precisa ser antes da final.");
  const days = Math.round((startOf(end) - startOf(begin)) / DAY) + 1;
  if (days > 366) throw httpError(400, "Escolha um período de até 1 ano.");
  return { from: begin, to: end, days, gte: startOf(begin), lt: startOf(shift(end, 1)) };
};

// Resumo de um cartão do usuário no período, com filtro opcional de origem e comparação com o período anterior.
export const summary = async (userId, cardId, query = {}) => {
  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { userId: true } });
  if (!card || card.userId !== userId) throw httpError(404, "Cartão não encontrado.");

  const r = parseRange(query);
  const source = SOURCES.includes(query.source) ? query.source : null;
  const where = { cardId, createAt: { gte: r.gte, lt: r.lt }, ...(source && { source }) };
  const prev = { ...where, createAt: { gte: new Date(r.gte.getTime() - r.days * DAY), lt: r.gte } };
  const src = source ? Prisma.sql`AND source = ${source}` : Prisma.empty;

  const [byKind, prevKind, bySource, byTarget, byDay, byHour] = await Promise.all([
    prisma.event.groupBy({ by: ["kind"], where, _count: true }),
    prisma.event.groupBy({ by: ["kind"], where: prev, _count: true }),
    // Origem ignora o filtro de origem: mostra sempre a divisão completa (o filtro só destaca uma).
    prisma.event.groupBy({ by: ["source"], where: { cardId, createAt: where.createAt, kind: "view" }, _count: true }),
    prisma.event.groupBy({ by: ["target"], where: { ...where, kind: "click" }, _count: true }),
    prisma.$queryRaw`SELECT to_char(("createAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS day,
        count(*) FILTER (WHERE kind = 'view')::int AS views, count(*) FILTER (WHERE kind = 'click')::int AS clicks
      FROM "Event" WHERE "cardId" = ${cardId} AND "createAt" >= ${r.gte} AND "createAt" < ${r.lt} ${src}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw`SELECT extract(hour FROM ("createAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo')::int AS hour, count(*)::int AS views
      FROM "Event" WHERE "cardId" = ${cardId} AND kind = 'view' AND "createAt" >= ${r.gte} AND "createAt" < ${r.lt} ${src}
      GROUP BY 1 ORDER BY 1`,
  ]);

  const count = (rows, k) => rows.find((x) => x.kind === k)?._count ?? 0;
  const ranked = (rows, key) => rows.map((x) => ({ [key]: x[key], count: x._count })).sort((a, b) => b.count - a.count);
  return {
    from: r.from,
    to: r.to,
    days: r.days,
    source,
    views: count(byKind, "view"),
    clicks: count(byKind, "click"),
    previous: { views: count(prevKind, "view"), clicks: count(prevKind, "click") },
    byDay,
    byHour,
    bySource: ranked(bySource, "source"),
    byTarget: ranked(byTarget, "target"),
  };
};
