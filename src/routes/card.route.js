import { Router } from "express";
import { appTokenMiddleware } from "../middleware/auth.middleware.js";
import * as cardController from "../controller/card.controller.js";

const router = Router();

router.get("/", appTokenMiddleware, cardController.getCards);
router.post("/", appTokenMiddleware, cardController.registerCard);
router.put("/:id", appTokenMiddleware, cardController.updateCardById);
router.delete("/:id", appTokenMiddleware, cardController.deleteCardById);
router.get("/:id/stats", appTokenMiddleware, cardController.getCardStats);

export default router;
