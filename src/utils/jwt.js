import jwt from "jsonwebtoken";

const JWT_SECRET_APP = process.env.JWT_SECRET_APP;
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "3h";

export const generateTokenAndRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
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
