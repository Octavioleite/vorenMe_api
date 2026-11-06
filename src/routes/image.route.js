import { Router } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { appTokenMiddleware } from "../middleware/auth.middleware.js";
import { sendError } from "../utils/sendError.js";

const router = Router();
// Sem SVG: pode carregar script. O navegador já manda reduzido (WebP/JPEG); 2mb cobre com folga.
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const UUID = /^[0-9a-f-]{36}$/i;
const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 60, message: { message: "Too many uploads, try again later" } });

router.post("/", appTokenMiddleware, uploadLimiter, express.raw({ type: TYPES, limit: "2mb" }), async (req, res) => {
  try {
    const mime = req.headers["content-type"]?.split(";")[0];
    if (!TYPES.includes(mime) || !Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ message: "Send a JPEG, PNG or WebP image" });
    }
    const { id } = await prisma.image.create({ data: { userId: req.user.id, mime, data: req.body }, select: { id: true } });
    return res.status(201).json({ message: "Image uploaded", data: { id } });
  } catch (error) {
    return sendError(res, error, "uploading image");
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(404).end();
    const img = await prisma.image.findUnique({ where: { id: req.params.id } });
    if (!img) return res.status(404).end();
    res.set({ "Content-Type": img.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" });
    return res.send(Buffer.from(img.data));
  } catch (error) {
    return sendError(res, error, "reading image");
  }
});

export default router;
