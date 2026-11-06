import { Router } from "express";
import * as templateController from "../controller/template.controller.js";

const router = Router();

router.get("/", templateController.getTemplates);

export default router;
