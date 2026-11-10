import { Router } from "express";
import { adminMiddleware } from "../middleware/auth.middleware.js";
import * as admin from "../service/admin.service.js";
import { handle } from "../utils/sendError.js";

const router = Router();
router.use(adminMiddleware);

router.get("/overview", handle("admin overview", () => admin.overview()));
router.get("/users", handle("admin users", (req) => admin.listUsers(req.query)));
router.get("/users/:id", handle("admin user", (req) => admin.userDetail(req.params.id)));
router.post("/users/:id/payments", handle("admin payment", (req) => admin.addPayment(req.admin, req.params.id, req.body)));
router.post("/users/:id/payment-link", handle("admin payment link", (req) => admin.paymentLink(req.admin, req.params.id, req.body)));
router.put("/users/:id/email-verified", handle("admin verify email", (req) => admin.setEmailVerified(req.admin, req.params.id, req.body?.verified)));
router.get("/site", handle("admin site", (req) => admin.siteStats(req.query)));
router.get("/overdue", handle("admin overdue", () => admin.overdue()));
router.get("/export/:kind", handle("admin export", (req) => admin.exportCsv(req.params.kind)));
router.get("/cards", handle("admin cards", (req) => admin.listCards(req.query)));
router.put("/cards/:id/disabled", handle("admin card disable", (req) => admin.setCardDisabled(req.admin, req.params.id, req.body)));
router.get("/cards/:id", handle("admin card", (req) => admin.card(req.params.id)));
router.get("/cards/:id/stats", handle("admin card stats", (req) => admin.cardStats(req.params.id, req.query)));
router.post("/users/:id/support", handle("admin support", (req) => admin.startSupport(req.admin, req.params.id)));
router.post("/users/:id/notes", handle("admin note", (req) => admin.addNote(req.admin, req.params.id, req.body?.text)));
router.delete("/notes/:id", handle("admin delete note", (req) => admin.deleteNote(req.params.id)));
router.put("/users/:id/active", handle("admin active", (req) => admin.setActive(req.admin, req.params.id, req.body?.active)));
router.post("/users/:id/cancel-subscription", handle("admin cancel", (req) => admin.cancelSubscription(req.admin, req.params.id)));
router.delete("/payments/:id", handle("admin undo payment", (req) => admin.undoPayment(req.admin, req.params.id)));

export default router;
