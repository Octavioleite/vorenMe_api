// node --test src/utils/origin.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { cleanOrigin, normalizeSite, tag } from "./origin.js";

test("tag: minúsculo, só caracteres seguros, curto", () => {
  assert.equal(tag("Black-Friday_2026"), "black-friday_2026");
  assert.equal(tag("<script>alert(1)</script>"), "scriptalert1script");
  assert.equal(tag("x".repeat(80)).length, 40);
  assert.equal(tag("!!!"), null);
  assert.equal(tag(42), null);
});

test("cleanOrigin: só campos conhecidos e exige source", () => {
  assert.deepEqual(cleanOrigin({ source: "Instagram", medium: "ads", campaign: "bf", evil: "x", page: "/admin" }),
    { source: "instagram", medium: "ads", campaign: "bf", page: "/" });
  assert.deepEqual(cleanOrigin({ source: "cartao", page: "/painel" }), { source: "cartao", page: "/painel" });
  assert.equal(cleanOrigin({ medium: "ads" }), null);
  assert.equal(cleanOrigin("instagram"), null);
  assert.equal(cleanOrigin(undefined), null);
});

test("normalizeSite: tipo, aparelho e visitante novo", () => {
  assert.deepEqual(normalizeSite({ kind: "view", source: "google", medium: "cpc", new: true }, "Mozilla/5.0 (iPhone)"),
    { kind: "view", source: "google", medium: "cpc", campaign: null, device: "mobile", new: true });
  assert.equal(normalizeSite({ kind: "cta", new: true }, "Windows").new, false);
  assert.equal(normalizeSite({ kind: "cta" }, "Windows").source, "direto");
  assert.equal(normalizeSite({ kind: "drop" }), null);
  assert.equal(normalizeSite(null), null);
});
