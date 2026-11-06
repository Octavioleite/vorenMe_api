import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controller/auth.controller.js";
import { refreshTokenMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Freio contra força bruta no login/cadastro: 20 tentativas por IP a cada 15 min.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { message: "Too many attempts, try again later" } });

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh-token", refreshTokenMiddleware, authController.refreshToken);

export default router;
