import LoginUserDto from "../dto/auth/login.dto.js";
import RegisterUserDto from "../dto/auth/register.dto.js";
import * as authService from "../service/auth.service.js";
import { sendError } from "../utils/sendError.js";

export const register = async (req, res) => {
  try {
    const dto = new RegisterUserDto(req.body);
    const errors = dto.validate();

    if (errors.length > 0) {
      return res.status(400).json({ message: "Confira os campos.", errors });
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
      return res.status(400).json({ message: "Confira os campos.", errors });
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
      data: await authService.refreshToken(req.user.id, req.user.v),
    });
  } catch (error) {
    return sendError(res, error, "refreshing token");
  }
};

export const updateMe = async (req, res) => {
  try {
    return res.status(200).json({ message: "Profile updated", data: await authService.updateMe(req.user.id, req.body ?? {}) });
  } catch (error) {
    return sendError(res, error, "updating profile");
  }
};

export const deleteMe = async (req, res) => {
  try {
    await authService.deleteMe(req.user.id, req.body?.password);
    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    return sendError(res, error, "deleting account");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body?.email);
  } catch (error) {
    console.error("Error sending reset email:", error); // não muda a resposta: não revela se o e-mail existe
  }
  return res.status(200).json({ message: "Se o e-mail tiver conta, enviamos o link." });
};

export const resetPassword = async (req, res) => {
  try {
    return res.status(200).json({ message: "Password reset", data: await authService.resetPassword(req.body?.token, req.body?.password) });
  } catch (error) {
    return sendError(res, error, "resetting password");
  }
};

export const verifyEmail = async (req, res) => {
  try {
    return res.status(200).json({ message: "Email verified", data: await authService.verifyEmail(req.body?.token) });
  } catch (error) {
    return sendError(res, error, "verifying email");
  }
};

export const resendVerification = async (req, res) => {
  try {
    await authService.resendVerification(req.user.id);
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    return sendError(res, error, "resending verification");
  }
};
