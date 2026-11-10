import { Router } from "express";
import authRoutes from "./auth.route.js";
import cardRoutes from "./card.route.js";
import templateRoutes from "./template.route.js";
import publicRoutes from "./public.route.js";
import imageRoutes from "./image.route.js";
import billingRoutes from "./billing.route.js";
import adminRoutes from "./admin.route.js";

const router = Router();
const initialRoutes = "/api/v1";

router.get(initialRoutes, (req, res) => res.status(200).json({ message: "VorenMe API v1" }));
router.use(initialRoutes + "/auth", authRoutes);
router.use(initialRoutes + "/cards", cardRoutes);
router.use(initialRoutes + "/templates", templateRoutes);
router.use(initialRoutes + "/public", publicRoutes);
router.use(initialRoutes + "/images", imageRoutes);
router.use(initialRoutes + "/billing", billingRoutes);
router.use(initialRoutes + "/admin", adminRoutes);

export default router;
