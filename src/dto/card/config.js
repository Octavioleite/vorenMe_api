// Validação do CreatorConfig (vorenMe_app/src/config/types.ts).
// ponytail: espelha o tipo TS à mão — se os dois começarem a divergir, extrair um schema compartilhado.

const STYLES = ["criador", "forte", "tinta", "atelie", "sereno", "glam", "clinica", "leve", "simples"];
const PLATFORMS = ["instagram", "tiktok", "youtube", "pinterest", "spotify", "x", "website"];
const LABEL_KEYS = [
  "socials", "featured", "now", "brands", "whatsapp", "email", "saveContact", "share", "linkCopied",
  "showQr", "close", "qrTitle", "qrText", "watchOn", "openOn", "themeToLight", "themeToDark",
  "followers", "copyEmail", "copied",
];
// Campos que viram href/src no front: só http(s) ou caminho local (bloqueia javascript:, data: etc.).
const URL_KEYS = new Set(["url", "src", "logo", "ogImage", "siteUrl", "vorenUrl"]);
const SAFE_URL = /^(https?:\/\/|\/(?!\/))/i;
const HEX = /^#[0-9a-f]{6}$/i;
const SLUG = /^[a-z0-9][a-z0-9._-]{2,30}$/;
const RESERVED_SLUGS = ["painel", "api", "assets", "admin", "login", "cadastro", "www"];
const MAX_CONFIG_BYTES = 50 * 1024;

export const validateSlug = (slug) => {
  if (typeof slug !== "string" || !SLUG.test(slug)) {
    return ["Slug must have 3-31 characters: lowercase letters, numbers, '.', '_' or '-'"];
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return [`Slug "${slug}" is reserved`];
  }
  return [];
};

const isText = (v) => typeof v === "string" && v.trim().length > 0;

// Varre o objeto inteiro atrás de URLs inseguras, em qualquer profundidade.
const unsafeUrls = (value, path = "config") => {
  if (Array.isArray(value)) return value.flatMap((v, i) => unsafeUrls(v, `${path}[${i}]`));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, v]) => {
    const p = `${path}.${key}`;
    if (URL_KEYS.has(key) && v !== undefined && v !== null) {
      return typeof v === "string" && SAFE_URL.test(v) ? [] : [`${p} must be an http(s) URL`];
    }
    return unsafeUrls(v, p);
  });
};

// Devolve a lista de erros ([] = válido).
export const validateCardConfig = (c) => {
  if (!c || typeof c !== "object" || Array.isArray(c)) return ["config must be an object"];
  if (Buffer.byteLength(JSON.stringify(c)) > MAX_CONFIG_BYTES) return ["config is too large"];

  const errors = [];
  const need = (ok, message) => ok || errors.push(message);

  need(isText(c.name?.first) && isText(c.name?.last), "name.first and name.last are required");
  need(isText(c.username), "username is required");
  need(isText(c.photo?.src) && isText(c.photo?.alt), "photo.src and photo.alt are required");
  need(isText(c.bio), "bio is required");
  need(isText(c.niche), "niche is required");
  need(typeof c.accent === "string" && HEX.test(c.accent), "accent must be a hex color like #E8552B");
  need(c.theme === "dark" || c.theme === "light", "theme must be 'dark' or 'light'");
  if (c.style !== undefined) need(STYLES.includes(c.style), `style must be one of: ${STYLES.join(", ")}`);

  need(Array.isArray(c.socials), "socials must be a list");
  (Array.isArray(c.socials) ? c.socials : []).forEach((s, i) => {
    need(PLATFORMS.includes(s?.platform), `socials[${i}].platform is invalid`);
    need(isText(s?.handle) && isText(s?.url), `socials[${i}] needs handle and url`);
  });

  if (c.whatsapp !== undefined) {
    need(/^\d{10,15}$/.test(c.whatsapp?.number ?? ""), "whatsapp.number must be digits only, with country code");
  }
  if (c.email !== undefined) {
    need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email?.address ?? ""), "email.address is invalid");
  }
  if (c.featured !== undefined) {
    need(PLATFORMS.includes(c.featured?.platform), "featured.platform is invalid");
    need(["video", "post", "project"].includes(c.featured?.kind), "featured.kind is invalid");
    need(isText(c.featured?.title) && isText(c.featured?.url) && isText(c.featured?.image?.src), "featured needs title, url and image.src");
  }

  if (c.coupons !== undefined) {
    need(Array.isArray(c.coupons) && c.coupons.length <= 20, "coupons must be a list (max 20)");
    (Array.isArray(c.coupons) ? c.coupons : []).forEach((k, i) =>
      need(isText(k?.brand) && isText(k?.code) && k.code.length <= 40, `coupons[${i}] needs brand and code (max 40 chars)`));
  }

  // Pix: limites do BR Code (padrão do Banco Central): nome até 25, cidade até 15, chave até 77.
  if (c.pix !== undefined) {
    need(isText(c.pix?.key) && c.pix.key.length <= 77, "pix.key is required (max 77 chars)");
    need(isText(c.pix?.name) && c.pix.name.length <= 25, "pix.name is required (max 25 chars)");
    need(isText(c.pix?.city) && c.pix.city.length <= 15, "pix.city is required (max 15 chars)");
  }
  if (c.address !== undefined) {
    need(isText(c.address?.text) && c.address.text.length <= 200, "address.text is required (max 200 chars)");
    const hours = c.address?.hours;
    if (hours !== undefined) {
      need(Array.isArray(hours) && hours.length <= 7, "address.hours must be a list (max 7)");
      (Array.isArray(hours) ? hours : []).forEach((h, i) => need(isText(h?.days) && isText(h?.time), `address.hours[${i}] needs days and time`));
    }
  }
  if (c.review !== undefined) need(isText(c.review?.url), "review.url is required");

  need(isText(c.partnership?.title) && isText(c.partnership?.text), "partnership.title and partnership.text are required");
  need(typeof c.footer?.showVoren === "boolean", "footer.showVoren is required");
  need(isText(c.seo?.title) && isText(c.seo?.description) && isText(c.seo?.locale), "seo.title, seo.description and seo.locale are required");
  need(LABEL_KEYS.every((k) => isText(c.labels?.[k])), `labels needs: ${LABEL_KEYS.join(", ")}`);

  errors.push(...unsafeUrls(c));
  return errors;
};
