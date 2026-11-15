// node --test src/utils/google.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import jwt from "jsonwebtoken";
import { checkGoogleToken } from "./google.js";

const pair = () => generateKeyPairSync("rsa", { modulusLength: 2048, publicKeyEncoding: { type: "spki", format: "pem" }, privateKeyEncoding: { type: "pkcs8", format: "pem" } });
const google = pair();
const other = pair();
const AUD = "123-abc.apps.googleusercontent.com";
const sign = (claims, key = google.privateKey, opts = {}) =>
  jwt.sign({ email: "Ana@Gmail.com", email_verified: true, name: "Ana Souza", ...claims }, key, { algorithm: "RS256", audience: AUD, issuer: "https://accounts.google.com", expiresIn: "1h", ...opts });

test("token do Google válido vira e-mail em minúsculas e nome", () => {
  assert.deepEqual(checkGoogleToken(sign({}), google.publicKey, AUD), { email: "ana@gmail.com", name: "Ana Souza" });
});

test("recusa token de outro app, de outra chave, vencido ou com e-mail não confirmado", () => {
  const bad = (token) => assert.throws(() => checkGoogleToken(token, google.publicKey, AUD), (e) => e.status === 401);
  bad(sign({}, google.privateKey, { audience: "outro-app.apps.googleusercontent.com" }));
  bad(sign({}, other.privateKey));
  bad(sign({}, google.privateKey, { issuer: "https://evil.example" }));
  bad(sign({ email_verified: false }));
  bad(sign({}, google.privateKey, { expiresIn: -60 })); // vencido
  bad("nao-e-um-jwt");
});
