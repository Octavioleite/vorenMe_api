// Injeta título, descrição e imagem do cartão no index.html do app (preview no WhatsApp, Google, Instagram).
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const absolute = (url, origin) => (!url ? "" : /^https?:\/\//i.test(url) ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`);

export const injectHead = (html, config, { origin, slug }) => {
  const title = config.seo?.title || `${config.name?.first ?? ""} ${config.name?.last ?? ""}`.trim();
  const description = config.seo?.description || config.bio || "";
  const image = absolute(config.seo?.ogImage || config.photo?.src, origin);
  const url = config.seo?.siteUrl || `${origin}/${slug}`;
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="VorenMe" />`,
    `<meta property="og:locale" content="${esc(config.seo?.locale || "pt_BR")}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
  ].filter(Boolean).join("\n    ");

  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta name="description"[^>]*>\s*/i, "")
    // Função como substituição: texto do usuário com $` $' $& não vira padrão especial do replace.
    .replace(/<\/head>/i, () => `    ${tags}\n  </head>`);
};
