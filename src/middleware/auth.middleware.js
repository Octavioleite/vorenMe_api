import { verifyToken, verifyRefreshToken } from "../utils/jwt.js";
import prisma from "../lib/prisma.js";

export const appTokenMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Confere a conta a cada request: desativar, trocar ou redefinir a senha (tokenVersion++) derruba
  // na hora os tokens já emitidos, em vez de esperar o JWT expirar.
  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { active: true, tokenVersion: true } });
    if (!user?.active || (user.tokenVersion ?? 0) !== (decoded.v ?? 0)) return res.status(401).json({ message: "Unauthorized" });
    // Token de suporte: só vale com a sessão aberta (o cliente pode encerrar a qualquer momento)
    // e enquanto quem abriu continuar admin (removido do ADMIN_EMAILS ou desativado = acesso cai).
    if (decoded.imp) {
      const s = await prisma.supportSession.findUnique({ where: { id: decoded.imp } });
      if (!s || s.endedAt || s.expiresAt <= new Date() || s.userId !== decoded.id) return res.status(401).json({ message: "Unauthorized" });
      const admin = admins().includes(s.adminEmail.toLowerCase()) && (await prisma.user.findUnique({ where: { email: s.adminEmail }, select: { active: true } }));
      if (!admin?.active) return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Token account check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
  req.user = decoded;
  next();
};

// Durante o acesso do suporte: nada de senha, exclusão de conta ou assinatura. Isso é só do dono.
export const notSupport = (req, res, next) =>
  req.user?.imp ? res.status(403).json({ message: "Indisponível durante o acesso do suporte." }) : next();

export const refreshTokenMiddleware = (req, res, next) => {
  const refreshToken = req.headers["x-refresh-token"];

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Refresh token verification error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin = e-mail em ADMIN_EMAILS (separados por vírgula), confirmado, conta ativa e token da versão atual.
// Confere no banco a cada request: senha trocada ou conta desativada perde o acesso na hora.
export const admins = () => (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const adminMiddleware = [appTokenMiddleware, async (req, res, next) => {
  try {
    if (req.user.imp) return res.status(403).json({ message: "Forbidden" });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = user?.active && user.emailVerifiedAt && (user.tokenVersion ?? 0) === (req.user.v ?? 0) && admins().includes(user.email.toLowerCase());
    if (!ok) return res.status(403).json({ message: "Forbidden" });
    req.admin = user;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}];
