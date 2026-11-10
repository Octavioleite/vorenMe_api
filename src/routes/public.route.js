import { Router, text } from "express";
import rateLimit from "express-rate-limit";
import * as publicController from "../controller/public.controller.js";
import * as statsService from "../service/stats.service.js";

const router = Router();

// public: a página do cartão (vorenMe_app) abre sem login.
router.get("/cards/:slug", publicController.getPublicCard);

// HTML do cartão com título/descrição/imagem já no <head>: o WhatsApp e o Google não rodam JS.
// A hospedagem do app reescreve /:slug para cá (ver README).
router.get("/page/:slug", publicController.getPublicPage);

// Estatísticas. O front manda via sendBeacon com text/plain (não dispara preflight de CORS e sobrevive à navegação).
// ponytail: sem deduplicar visitas repetidas da mesma pessoa; contar "visitantes únicos" com hash de IP+dia se pedirem.
const eventLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, message: { message: "Too many events" } });
router.post("/cards/:slug/events", eventLimiter, text({ type: "*/*", limit: "2kb" }), async (req, res) => {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
    await statsService.record(req.params.slug, body);
  } catch {
    /* evento inválido: ignora */
  }
  return res.status(204).end();
});

export default router;
