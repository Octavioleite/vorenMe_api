import { verifyToken, verifyRefreshToken } from "../utils/jwt.js";

export const appTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

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
