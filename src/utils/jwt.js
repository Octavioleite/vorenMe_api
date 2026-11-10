import jwt from "jsonwebtoken";

const JWT_SECRET_APP = process.env.JWT_SECRET_APP;
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "3h";

export const generateTokenAndRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    v: user.tokenVersion ?? 0,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET_APP, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, JWT_SECRET_REFRESH, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET_APP);
};

export const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, JWT_SECRET_REFRESH);
};

// Acesso do suporte: só access token (sem refresh), com `imp` = id da SupportSession.
// O middleware confere a sessão no banco a cada request, então encerrar derruba o acesso na hora.
export const SUPPORT_TTL_MS = 60 * 60 * 1000;
export const generateSupportToken = (user, sessionId) =>
  jwt.sign({ id: user.id, email: user.email, v: user.tokenVersion ?? 0, imp: sessionId }, JWT_SECRET_APP, { expiresIn: SUPPORT_TTL_MS / 1000 });
