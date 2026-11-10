import { Router } from "express";
import { appTokenMiddleware, notSupport } from "../middleware/auth.middleware.js";
import * as billingService from "../service/billing.service.js";
import { handle, sendError } from "../utils/sendError.js";

const router = Router();

router.get("/", appTokenMiddleware, handle("billing status", (req) => billingService.status(req.user.id)));

router.post("/subscribe", appTokenMiddleware, notSupport, handle("subscribing", (req) => {
  const cpfCnpj = String(req.body?.cpfCnpj ?? "").replace(/\D/g, "");
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) throw Object.assign(new Error("Informe um CPF ou CNPJ válido."), { status: 400 });
  return billingService.subscribe(req.user.id, cpfCnpj);
}));

router.post("/cancel", appTokenMiddleware, notSupport, handle("canceling", (req) => billingService.cancel(req.user.id)));

// Webhook do Asaas (Configurações → Integrações → Webhooks), com o token em ASAAS_WEBHOOK_TOKEN.
router.post("/webhook", async (req, res) => {
  if (!billingService.validWebhookToken(req.headers["asaas-access-token"])) return res.status(401).json({ message: "Unauthorized" });
  try {
    await billingService.handleWebhook(req.body ?? {});
    return res.status(200).json({ received: true });
  } catch (error) {
    return sendError(res, error, "asaas webhook"); // 500 faz o Asaas reenviar
  }
});

export default router;
