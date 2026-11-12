import { Router } from "express";
import { appTokenMiddleware } from "../middleware/auth.middleware.js";
import * as cardController from "../controller/card.controller.js";
import * as conecta from "../service/conecta.service.js";
import { handle } from "../utils/sendError.js";

const router = Router();

router.get("/", appTokenMiddleware, cardController.getCards);
router.post("/", appTokenMiddleware, cardController.registerCard);
router.put("/:id", appTokenMiddleware, cardController.updateCardById);
router.delete("/:id", appTokenMiddleware, cardController.deleteCardById);
router.get("/:id/stats", appTokenMiddleware, cardController.getCardStats);

// Conecta: métricas, contatos e conversões. Todas checam se o cartão é de quem chama (404 se não for).
router.get("/:id/conecta", appTokenMiddleware, handle("conecta summary", (req) => conecta.summary(req.user.id, req.params.id, req.query)));
router.get("/:id/leads", appTokenMiddleware, handle("list leads", (req) => conecta.listLeads(req.user.id, req.params.id)));
router.delete("/:id/leads/:leadId", appTokenMiddleware, handle("delete lead", (req) => conecta.deleteLead(req.user.id, req.params.id, req.params.leadId)));
router.get("/:id/conversions", appTokenMiddleware, handle("list conversions", (req) => conecta.listConversions(req.user.id, req.params.id)));
router.post("/:id/conversions", appTokenMiddleware, handle("create conversion", (req) => conecta.createConversion(req.user.id, req.params.id, req.body)));
router.delete("/:id/conversions/:conversionId", appTokenMiddleware, handle("delete conversion", (req) => conecta.deleteConversion(req.user.id, req.params.id, req.params.conversionId)));

export default router;
