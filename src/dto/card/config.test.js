// node --test src/dto/card/config.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { validateCardConfig, validateSlug } from "./config.js";
import templates from "../../templates/index.js";

test("todos os modelos são válidos", () => {
  for (const t of templates) assert.deepEqual(validateCardConfig(t.config), [], t.id);
});

test("bloqueia URL insegura em qualquer profundidade", () => {
  const c = structuredClone(templates[0].config);
  c.socials[0].url = "javascript:alert(1)";
  c.featured.image.src = "data:text/html,x";
  const errors = validateCardConfig(c);
  assert.ok(errors.some((e) => e.includes("socials[0].url")));
  assert.ok(errors.some((e) => e.includes("featured.image.src")));
});

test("valida cor, tema, whatsapp e labels", () => {
  const c = structuredClone(templates[0].config);
  c.accent = "red";
  c.theme = "blue";
  c.whatsapp.number = "+55 11 9";
  delete c.labels.share;
  assert.equal(validateCardConfig(c).length, 4);
  assert.deepEqual(validateCardConfig(null), ["config must be an object"]);
});

test("slug", () => {
  assert.deepEqual(validateSlug("ana.psi"), []);
  assert.equal(validateSlug("painel").length, 1);
  assert.equal(validateSlug("Ana").length, 1);
  assert.equal(validateSlug("ab").length, 1);
  assert.equal(validateSlug("../x").length, 1);
});

test("cupons: aceita válidos, recusa sem código ou com link inseguro", () => {
  const c = structuredClone(templates[0].config);
  c.coupons = [{ brand: "Marca", code: "LUANA15", discount: "15% OFF", url: "https://loja.com" }];
  assert.deepEqual(validateCardConfig(c), []);
  c.coupons = [{ brand: "Marca", code: "" , url: "javascript:x" }];
  const errors = validateCardConfig(c);
  assert.ok(errors.some((e) => e.includes("coupons[0] needs")));
  assert.ok(errors.some((e) => e.includes("coupons[0].url")));
});
