import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controller/auth.controller.js";
import { appTokenMiddleware, notSupport, refreshTokenMiddleware } from "../middleware/auth.middleware.js";
import * as authService from "../service/auth.service.js";
import { handle } from "../utils/sendError.js";

const router = Router();

// Freio contra força bruta no login/cadastro: 20 tentativas por IP a cada 15 min.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { message: "Muitas tentativas. Tente de novo em alguns minutos." } });

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.post("/verify-email", authLimiter, authController.verifyEmail);
router.post("/resend-verification", appTokenMiddleware, authLimiter, authController.resendVerification);
router.post("/refresh-token", refreshTokenMiddleware, authController.refreshToken);
// Senha atual passa pelo mesmo freio do login (evita adivinhar senha com um token roubado).
// Suporte pode corrigir o nome, mas não a senha.
const noPasswordBySupport = (req, res, next) => (req.body?.newPassword !== undefined ? notSupport(req, res, next) : next());
router.put("/me", appTokenMiddleware, noPasswordBySupport, authLimiter, authController.updateMe);
router.delete("/me", appTokenMiddleware, notSupport, authLimiter, authController.deleteMe);
// Faixa "o suporte está acessando sua conta" no painel do cliente, e o botão de encerrar.
router.get("/support", appTokenMiddleware, handle("support status", (req) => authService.supportStatus(req.user)));
router.post("/support/end", appTokenMiddleware, handle("support end", (req) => authService.endSupport(req.user)));

export default router;
