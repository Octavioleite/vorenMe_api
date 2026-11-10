import * as cardService from "../service/card.service.js";
import { sendError } from "../utils/sendError.js";
import { injectHead } from "../utils/ogPage.js";

// index.html do app, buscado na própria hospedagem do front e guardado por 5 min.
let shell = { html: "", at: 0 };
const appShell = async () => {
  if (shell.html && Date.now() - shell.at < 5 * 60 * 1000) return shell.html;
  const res = await fetch(`${process.env.FRONT_URL}/index.html`);
  if (!res.ok) throw new Error(`index.html ${res.status}`);
  shell = { html: await res.text(), at: Date.now() };
  return shell.html;
};

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

export const getPublicPage = async (req, res) => {
  try {
    const html = await appShell();
    const slug = String(req.params.slug).toLowerCase();
    const config = await cardService.getPublicBySlug(slug).catch((e) => (e.status === 404 || e.status === 410 ? null : Promise.reject(e)));
    res.set("Cache-Control", "public, max-age=60").type("html");
    if (!config) return res.status(404).send(html);
    return res.status(200).send(injectHead(html, config, { origin: process.env.FRONT_URL, slug }));
  } catch (error) {
    console.error("Error rendering public page:", error);
    return res.status(502).type("text").send("Não foi possível carregar o cartão.");
  }
};
