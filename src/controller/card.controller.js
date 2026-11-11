import RegisterCardDto from "../dto/card/register.dto.js";
import UpdateCardDto from "../dto/card/update.dto.js";
import * as cardService from "../service/card.service.js";
import { sendError } from "../utils/sendError.js";
import * as statsService from "../service/stats.service.js";

export const getCards = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Cards retrieved successfully",
      data: await cardService.list(req.user.id),
    });
  } catch (error) {
    return sendError(res, error, "listing cards");
  }
};

export const registerCard = async (req, res) => {
  try {
    const dto = new RegisterCardDto(req.body);
    const errors = dto.validate();

    if (errors.length > 0) {
      return res.status(400).json({ message: "Confira os campos.", errors });
    }

    return res.status(201).json({
      message: "Card registered successfully",
      data: await cardService.register(req.user.id, dto),
    });
  } catch (error) {
    return sendError(res, error, "registering card");
  }
};

export const updateCardById = async (req, res) => {
  try {
    const dto = new UpdateCardDto(req.body);
    const errors = dto.validate();

    if (errors.length > 0) {
      return res.status(400).json({ message: "Confira os campos.", errors });
    }

    return res.status(200).json({
      message: "Card updated successfully",
      data: await cardService.update(req.user.id, req.params.id, dto),
    });
  } catch (error) {
    return sendError(res, error, "updating card");
  }
};

export const deleteCardById = async (req, res) => {
  try {
    await cardService.remove(req.user.id, req.params.id);
    return res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    return sendError(res, error, "deleting card");
  }
};

export const getCardStats = async (req, res) => {
  try {
    return res.status(200).json({ message: "Stats retrieved", data: await statsService.summary(req.user.id, req.params.id, req.query) });
  } catch (error) {
    return sendError(res, error, "card stats");
  }
};
