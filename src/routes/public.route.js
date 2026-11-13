import { Router, text } from "express";
import rateLimit from "express-rate-limit";
import * as publicController from "../controller/public.controller.js";
import * as statsService from "../service/stats.service.js";
import * as conecta from "../service/conecta.service.js";
import { sendError } from "../utils/sendError.js";
import { normalizeSite } from "../utils/origin.js";
import prisma from "../lib/prisma.js";

const router = Router();

// public: a página do cartão (vorenMe_app) abre sem login.
router.get("/cards/:slug", publicController.getPublicCard);

// HTML do cartão com título/descrição/imagem já no <head>: o WhatsApp e o Google não rodam JS.
// A hospedagem do app reescreve /:slug para cá (ver README).
router.get("/page/:slug", publicController.getPublicPage);

// Estatísticas. O front manda via sendBeacon com text/plain (não dispara preflight de CORS e sobrevive à navegação).
// Visitante único do Conecta: hash diário de IP+navegador (utils/conecta.js, visitorId), sem cookie.
const eventLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, message: { message: "Muitas requisições." } });
router.post("/cards/:slug/events", eventLimiter, text({ type: "*/*", limit: "2kb" }), async (req, res) => {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
    await statsService.record(req.params.slug, body, { ip: req.ip, ua: req.get("user-agent") });
  } catch {
    /* evento inválido: ignora */
  }
  return res.status(204).end();
});

// Conecta: formulário de contato do cartão. Sem login do visitante; consentimento obrigatório, isca anti-robô
// (campo "website" escondido) e freio por IP e por cartão. Os dados vão só para o painel do dono.
const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: { message: "Muitos envios. Tente de novo em alguns minutos." } });
router.post("/cards/:slug/leads", leadLimiter, async (req, res) => {
  try {
    await conecta.createLead(req.params.slug, req.body ?? {});
    return res.status(201).json({ message: "Contato enviado" });
  } catch (error) {
    return sendError(res, error, "creating lead");
  }
});

// Página inicial (/): visitas e cliques no "Testar grátis", com a origem (utm/referrer). Mesmo esquema dos cartões.
router.post("/site/events", eventLimiter, text({ type: "*/*", limit: "2kb" }), async (req, res) => {
  try {
    const event = normalizeSite(typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body, req.get("user-agent"));
    if (event) await prisma.siteEvent.create({ data: event });
  } catch {
    /* evento inválido: ignora */
  }
  return res.status(204).end();
});

// Prova social da página inicial: quantos cartões já foram criados (número real, sem arredondar para cima).
// Cache de 10 min em memória: a landing chama isso em toda visita.
let created = { n: 0, at: 0 };
router.get("/site/stats", async (_req, res) => {
  try {
    if (Date.now() - created.at > 10 * 60 * 1000) created = { n: await prisma.card.count({ where: { disabledAt: null } }), at: Date.now() };
    return res.set("Cache-Control", "public, max-age=600").json({ cards: created.n });
  } catch (error) {
    return sendError(res, error, "site stats");
  }
});

export default router;
