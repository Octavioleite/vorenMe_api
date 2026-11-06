import * as cardService from "../service/card.service.js";
import { sendError } from "../utils/sendError.js";

export const getPublicCard = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Card retrieved successfully",
      data: await cardService.getPublicBySlug(req.params.slug),
    });
  } catch (error) {
    return sendError(res, error, "retrieving public card");
  }
};
