import LoginUserDto from "../dto/auth/login.dto.js";
import RegisterUserDto from "../dto/auth/register.dto.js";
import * as authService from "../service/auth.service.js";
import { sendError } from "../utils/sendError.js";

export const register = async (req, res) => {
  try {
    const dto = new RegisterUserDto(req.body);
    const errors = dto.validate();

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors });
    }

    return res.status(201).json({
      message: "User registered successfully",
      data: await authService.register(dto),
    });
  } catch (error) {
    return sendError(res, error, "registering user");
  }
};

export const login = async (req, res) => {
  try {
    const dto = new LoginUserDto(req.body);
    const errors = dto.validate();

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors });
    }

    return res.status(200).json({
      message: "User logged in successfully",
      data: await authService.login(dto),
    });
  } catch (error) {
    return sendError(res, error, "logging in user");
  }
};

export const refreshToken = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Token refreshed successfully",
      data: await authService.refreshToken(req.user.id),
    });
  } catch (error) {
    return sendError(res, error, "refreshing token");
  }
};
