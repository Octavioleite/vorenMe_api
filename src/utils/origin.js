// Origem do lead (utm/referrer) vinda do navegador: qualquer um chama as rotas, então só texto curto e simples.
export const tag = (v) => (typeof v === "string" && v.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40)) || null;

const FIELDS = ["source", "medium", "campaign", "content", "term", "ref"];

/** Origem gravada no cadastro. null se não veio nada. */
export const cleanOrigin = (o) => {
  if (!o || typeof o !== "object") return null;
  const out = Object.fromEntries(FIELDS.map((k) => [k, tag(o[k])]).filter(([, v]) => v));
  if (!out.source) return null;
  out.page = o.page === "/painel" ? "/painel" : "/";
  return out;
};

/** Evento da página inicial: view (abriu) ou cta (clicou em "Testar grátis"). Device sai do user-agent do servidor. */
export const normalizeSite = (body, ua = "") => {
  const kind = body?.kind === "view" || body?.kind === "cta" ? body.kind : null;
  if (!kind) return null;
  return {
    kind,
    source: tag(body.source) ?? "direto",
    medium: tag(body.medium),
    campaign: tag(body.campaign),
    device: /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop",
    new: kind === "view" && body.new === true,
  };
};
