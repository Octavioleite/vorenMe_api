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
    return ["O endereço do cartão precisa ter de 3 a 31 caracteres: letras minúsculas, números, '.', '_' ou '-'."];
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return [`O endereço "${slug}" é reservado. Escolha outro.`];
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
      return typeof v === "string" && SAFE_URL.test(v) ? [] : [`Um dos links não é válido (${p.replace(/^config\./, "")}). Use um endereço que comece com https://`];
    }
    return unsafeUrls(v, p);
  });
};

// Devolve a lista de erros ([] = válido).
export const validateCardConfig = (c) => {
  if (!c || typeof c !== "object" || Array.isArray(c)) return ["Dados do cartão inválidos."];
  if (Buffer.byteLength(JSON.stringify(c)) > MAX_CONFIG_BYTES) return ["O cartão ficou grande demais. Remova alguns itens."];

  const errors = [];
  const need = (ok, message) => ok || errors.push(message);

  // Sobrenome opcional: lojas, clínicas e marcas usam só o nome.
  need(isText(c.name?.first), "Informe o nome.");
  need(c.name?.last === undefined || typeof c.name.last === "string", "Sobrenome inválido.");
  need(isText(c.username), "Informe o usuário exibido (@).");
  need(isText(c.photo?.src), "Adicione uma foto.");
  need(isText(c.photo?.alt), "Preencha a descrição da foto.");
  need(isText(c.bio), "Escreva a apresentação (bio).");
  need(isText(c.niche), "Informe a especialidade.");
  need(typeof c.accent === "string" && HEX.test(c.accent), "Cor inválida. Use o formato #E8552B.");
  need(c.theme === "dark" || c.theme === "light", "Tema inválido: escolha claro ou escuro.");
  if (c.style !== undefined) need(STYLES.includes(c.style), "Estilo inválido.");

  need(Array.isArray(c.socials), "Redes sociais inválidas.");
  (Array.isArray(c.socials) ? c.socials : []).forEach((s, i) => {
    need(PLATFORMS.includes(s?.platform), `Rede social ${i + 1}: escolha a plataforma.`);
    need(isText(s?.handle) && isText(s?.url), `Rede social ${i + 1}: preencha o usuário e o link.`);
  });

  if (c.whatsapp !== undefined) {
    need(/^\d{10,15}$/.test(c.whatsapp?.number ?? ""), "WhatsApp: use só números, com DDI e DDD (ex.: 5511900000000).");
  }
  if (c.email !== undefined) {
    need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email?.address ?? ""), "E-mail inválido.");
  }
  if (c.featured !== undefined) {
    need(PLATFORMS.includes(c.featured?.platform), "Destaque: escolha a plataforma.");
    need(["video", "post", "project"].includes(c.featured?.kind), "Destaque: tipo inválido.");
    need(isText(c.featured?.title) && isText(c.featured?.url) && isText(c.featured?.image?.src), "Destaque: preencha o título, o link e a imagem.");
  }

  if (c.coupons !== undefined) {
    need(Array.isArray(c.coupons) && c.coupons.length <= 20, "Cupons: no máximo 20.");
    (Array.isArray(c.coupons) ? c.coupons : []).forEach((k, i) =>
      need(isText(k?.brand) && isText(k?.code) && k.code.length <= 40, `Cupom ${i + 1}: preencha a marca e o código (até 40 caracteres).`));
  }

  // Pix: limites do BR Code (padrão do Banco Central): nome até 25, cidade até 15, chave até 77.
  if (c.pix !== undefined) {
    need(isText(c.pix?.key) && c.pix.key.length <= 77, "Pix: informe a chave (até 77 caracteres).");
    need(isText(c.pix?.name) && c.pix.name.length <= 25, "Pix: informe o nome (até 25 caracteres).");
    need(isText(c.pix?.city) && c.pix.city.length <= 15, "Pix: informe a cidade (até 15 caracteres).");
  }
  if (c.address !== undefined) {
    need(isText(c.address?.text) && c.address.text.length <= 200, "Endereço: preencha (até 200 caracteres).");
    const hours = c.address?.hours;
    if (hours !== undefined) {
      need(Array.isArray(hours) && hours.length <= 7, "Horários: no máximo 7.");
      (Array.isArray(hours) ? hours : []).forEach((h, i) => need(isText(h?.days) && isText(h?.time), `Horário ${i + 1}: preencha os dias e o horário.`));
    }
  }
  if (c.review !== undefined) need(isText(c.review?.url), "Avaliação: informe o link.");

  need(isText(c.partnership?.title) && isText(c.partnership?.text), "Chamada principal: preencha o título e o texto.");
  need(typeof c.footer?.showVoren === "boolean", "Rodapé inválido.");
  need(isText(c.seo?.title) && isText(c.seo?.description) && isText(c.seo?.locale), "Compartilhamento: preencha o título e a descrição da página.");
  need(LABEL_KEYS.every((k) => isText(c.labels?.[k])), "Textos dos botões incompletos.");

  errors.push(...unsafeUrls(c));
  return errors;
};
