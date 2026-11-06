import * as userRepository from "../repository/user.repository.js";
import ListUserDto from "../dto/user/list.dto.js";
import { generateTokenAndRefreshToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { httpError } from "../utils/httpError.js";

const session = (user) => ({ user: new ListUserDto(user), ...generateTokenAndRefreshToken(user) });

export const register = async (dto) => {
  if (await userRepository.findByEmail(dto.email)) {
    throw httpError(409, "Email already registered");
  }

  const user = await userRepository.registerUser({
    name: dto.name || null,
    email: dto.email,
    password: await hashPassword(dto.password),
  });

  return session(user);
};

export const login = async (dto) => {
  const user = await userRepository.findByEmail(dto.email);

  // Mesma mensagem para e-mail inexistente e senha errada: não revela quem tem conta.
  if (!user || !user.active || !(await verifyPassword(dto.password, user.password))) {
    throw httpError(401, "Email or password is incorrect");
  }

  return session(user);
};

export const refreshToken = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user || !user.active) {
    throw httpError(401, "User not found");
  }

  return generateTokenAndRefreshToken(user);
};
