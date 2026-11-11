import * as userRepository from "../repository/user.repository.js";
import ListUserDto from "../dto/user/list.dto.js";
import { generateTokenAndRefreshToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { httpError } from "../utils/httpError.js";
import * as billingService from "./billing.service.js";
import { createHash, randomBytes } from "node:crypto";
import prisma from "../lib/prisma.js";
import { notify, templates } from "./email.service.js";
import { sendMail } from "../utils/mail.js";
import { holdSlugs } from "./card.service.js";

// Hash de mentira: login com e-mail inexistente gasta o mesmo scrypt que um de verdade.
const DUMMY_HASH = await hashPassword(randomBytes(16).toString("hex"));

const session = (user) => ({ user: new ListUserDto(user), ...generateTokenAndRefreshToken(user) });

// Verificação de e-mail: link de uso único, vale 7 dias. Guarda só o hash do token.
const VERIFY_TTL = 7 * 24 * 60 * 60 * 1000;
const newVerifyToken = () => {
  const token = randomBytes(32).toString("hex");
  return { token, data: { verifyTokenHash: createHash("sha256").update(token).digest("hex"), verifyTokenExp: new Date(Date.now() + VERIFY_TTL) } };
};
const verifyLink = (token) => `${process.env.FRONT_URL || "http://localhost:5173"}/painel?verificar=${token}`;

export const register = async (dto) => {
  if (await userRepository.findByEmail(dto.email)) {
    throw httpError(409, "Este e-mail já tem conta. Entre ou recupere a senha.");
  }

  // Indicação: `ref` é o slug do cartão de onde a pessoa veio (selo "Feito com VorenMe").
  const ref = typeof dto.ref === "string" && dto.ref ? await prisma.card.findUnique({ where: { slug: dto.ref.toLowerCase() }, select: { userId: true } }) : null;

  const verify = newVerifyToken();
  const user = await userRepository.registerUser({
    name: dto.name || null,
    email: dto.email,
    password: await hashPassword(dto.password),
    referredById: ref?.userId ?? null,
    origin: dto.origin ?? undefined,
    lastSeenAt: new Date(),
    ...verify.data,
  });

  notify(user, "welcome", { verifyLink: verifyLink(verify.token) }); // sem await: e-mail lento não segura o cadastro
  return session(user);
};

export const login = async (dto) => {
  const user = await userRepository.findByEmail(dto.email);

  // Mesma mensagem e o mesmo tempo para e-mail inexistente e senha errada: não revela quem tem conta.
  const ok = await verifyPassword(dto.password, user?.password ?? DUMMY_HASH);
  if (!user || !user.active || !ok) {
    throw httpError(401, "E-mail ou senha incorretos.");
  }

  await userRepository.updateUser(user.id, { lastSeenAt: new Date() }); // "último acesso" no admin
  return session(user);
};

// O appTokenMiddleware também confere `active` e `v` a cada request (tokens antigos caem na hora).
export const refreshToken = async (userId, version) => {
  const user = await userRepository.findById(userId);

  if (!user || !user.active || (user.tokenVersion ?? 0) !== (version ?? 0)) {
    throw httpError(401, "Usuário não encontrado.");
  }

  await userRepository.updateUser(user.id, { lastSeenAt: new Date() });
  return generateTokenAndRefreshToken(user);
};

const checkPassword = async (user, password) => {
  if (!(await verifyPassword(String(password ?? ""), user.password))) throw httpError(400, "Senha atual incorreta.");
};

// Perfil: nome e/ou senha (a senha nova exige a atual). E-mail fica fixo até existir verificação por e-mail.
export const updateMe = async (userId, { name, currentPassword, newPassword }) => {
  const user = await userRepository.findById(userId);
  if (!user) throw httpError(404, "Usuário não encontrado.");

  const data = {};
  if (typeof name === "string") data.name = name.trim().slice(0, 80) || null;
  if (newPassword !== undefined) {
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
      throw httpError(400, "A nova senha precisa ter de 8 a 128 caracteres.");
    }
    await checkPassword(user, currentPassword);
    data.password = await hashPassword(newPassword);
    data.tokenVersion = { increment: 1 }; // derruba as outras sessões
    data.resetTokenHash = null; // e um link de redefinição pendente
    data.resetTokenExp = null;
  }
  const updated = await userRepository.updateUser(userId, data);
  if (!data.password) return new ListUserDto(updated);
  notify(updated, "passwordChanged");
  return { ...new ListUserDto(updated), ...generateTokenAndRefreshToken(updated) }; // esta sessão segue com tokens novos
};

// Exclui conta, cartões e fotos (cascade). Cancela a assinatura no Asaas antes, para não seguir cobrando.
export const deleteMe = async (userId, password) => {
  const user = await userRepository.findById(userId);
  if (!user) throw httpError(404, "Usuário não encontrado.");
  await checkPassword(user, password);
  await billingService.cancel(userId, { silent: true, reason: "conta excluída" });
  const cards = await prisma.card.findMany({ where: { userId }, select: { slug: true } });
  await userRepository.deleteUser(userId);
  await holdSlugs(userId, cards.map((c) => c.slug)); // a conta some, mas os slugs não voltam na hora
  notify(user, "accountDeleted");
};

const sha = (t) => createHash("sha256").update(t).digest("hex");
const RESET_TTL = 60 * 60 * 1000; // 1h

// Sempre responde igual (existindo ou não o e-mail): não revela quem tem conta.
export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(String(email ?? "").trim().toLowerCase());
  if (!user || !user.active) return;

  const token = randomBytes(32).toString("hex");
  await userRepository.updateUser(user.id, { resetTokenHash: sha(token), resetTokenExp: new Date(Date.now() + RESET_TTL) });

  const link = `${process.env.FRONT_URL || "http://localhost:5173"}/painel?redefinir=${token}`;
  // Sem await: esperar o SMTP deixaria a resposta mais lenta só para e-mails que existem.
  sendMail({ to: user.email, ...templates.passwordReset(user, { link }) }).catch((e) => console.error("Error sending reset email:", e));
};

export const resetPassword = async (token, password) => {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw httpError(400, "A nova senha precisa ter de 8 a 128 caracteres.");
  }
  const user = typeof token === "string" && token ? await prisma.user.findUnique({ where: { resetTokenHash: sha(token) } }) : null;
  if (!user || !user.active || !user.resetTokenExp || user.resetTokenExp < new Date()) {
    throw httpError(400, "Link inválido ou expirado. Peça um novo.");
  }
  const updated = await userRepository.updateUser(user.id, { password: await hashPassword(password), resetTokenHash: null, resetTokenExp: null, tokenVersion: { increment: 1 } });
  notify(updated, "passwordChanged");
  return session(updated);
};

export const verifyEmail = async (token) => {
  const user = typeof token === "string" && token ? await prisma.user.findUnique({ where: { verifyTokenHash: sha(token) } }) : null;
  if (!user || !user.verifyTokenExp || user.verifyTokenExp < new Date()) {
    throw httpError(400, "Link de confirmação inválido ou expirado. Peça um novo no painel.");
  }
  const updated = await userRepository.updateUser(user.id, { emailVerifiedAt: new Date(), verifyTokenHash: null, verifyTokenExp: null });
  return new ListUserDto(updated);
};

export const resendVerification = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw httpError(404, "Usuário não encontrado.");
  if (user.emailVerifiedAt) return;
  const verify = newVerifyToken();
  await userRepository.updateUser(user.id, verify.data);
  await notify(user, "verifyEmail", { verifyLink: verifyLink(verify.token) });
};

// Sessão de suporte aberta agora nesta conta (a mais recente), para a faixa do painel.
export const supportStatus = async ({ id, imp }) => {
  const s = await prisma.supportSession.findFirst({ where: { userId: id, endedAt: null, expiresAt: { gt: new Date() } }, orderBy: { startedAt: "desc" } });
  return { active: Boolean(s), viewer: imp ? "support" : "owner", ...(s && { by: s.adminName || "Suporte VorenMe", startedAt: s.startedAt, expiresAt: s.expiresAt }) };
};

// Cliente encerra todas as sessões de suporte da conta; o admin (token de suporte) encerra a dele.
export const endSupport = async ({ id, imp }) => {
  const where = imp ? { id: imp } : { userId: id, endedAt: null };
  const open = await prisma.supportSession.findMany({ where: { ...where, endedAt: null } });
  if (!open.length) return;
  await prisma.supportSession.updateMany({ where: { id: { in: open.map((s) => s.id) } }, data: { endedAt: new Date(), endedBy: imp ? open[0].adminEmail : "usuario" } });
  await prisma.activity.createMany({ data: open.map((s) => ({ userId: id, actor: imp ? s.adminEmail : "usuario", action: "support.end", data: { sessionId: s.id } })) });
};
