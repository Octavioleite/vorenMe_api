import { Router } from "express";
import * as publicController from "../controller/public.controller.js";

const router = Router();

// public: a página do cartão (vorenMe_app) abre sem login.
router.get("/cards/:slug", publicController.getPublicCard);

export default router;
