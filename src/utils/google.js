import jwt from "jsonwebtoken";
import { httpError } from "./httpError.js";

// Entrar com Google (Google Identity Services): o botão no front devolve um ID token (JWT RS256) e a API confere
// a assinatura com as chaves públicas do Google. Sem SDK: o jsonwebtoken já verifica RS256 com as chaves em PEM.
const CERTS_URL = "https://www.googleapis.com/oauth2/v1/certs";
const ISSUERS = ["accounts.google.com", "https://accounts.google.com"];
const INVALID = "Não foi possível entrar com o Google. Tente de novo.";

let cache = { keys: {}, until: 0, at: 0 };
const fetchKeys = async () => {
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw httpError(502, INVALID);
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "")?.[1] ?? 3600);
  cache = { keys: await res.json(), until: Date.now() + maxAge * 1000, at: Date.now() };
  return cache.keys;
};
const keyFor = async (kid) => {
  let keys = Date.now() < cache.until ? cache.keys : await fetchKeys();
  // O Google gira as chaves: kid desconhecido busca de novo, no máximo 1 vez por minuto (kid inventado não vira enxurrada).
  if (!keys[kid] && Date.now() - cache.at > 60 * 1000) keys = await fetchKeys();
  return keys[kid];
};

/** Confere assinatura, emissor, público (nosso Client ID), validade e e-mail confirmado. Separado para teste. */
export const checkGoogleToken = (credential, key, audience) => {
  try {
    const p = jwt.verify(credential, key, { algorithms: ["RS256"], audience, issuer: ISSUERS });
    if (typeof p.email !== "string" || p.email_verified !== true) throw new Error("e-mail não confirmado no Google");
    return { email: p.email.trim().toLowerCase(), name: (p.name || p.given_name || "").trim() || null };
  } catch {
    throw httpError(401, INVALID);
  }
};

/** ID token do botão do Google -> { email, name }. */
export const verifyGoogleToken = async (credential) => {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) throw httpError(503, "Entrar com Google não está ativo.");
  const kid = typeof credential === "string" ? jwt.decode(credential, { complete: true })?.header?.kid : null;
  const key = kid && (await keyFor(kid));
  if (!key) throw httpError(401, INVALID);
  return checkGoogleToken(credential, key, audience);
};
