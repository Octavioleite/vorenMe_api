// node --test src/utils/ogPage.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { injectHead } from "./ogPage.js";

const html = `<html><head><title>VorenMe</title>\n<meta name="description" content="x" />\n</head><body></body></html>`;

test("troca título e adiciona OG com escape", () => {
  const out = injectHead(html, { name: { first: "Ana", last: "B" }, bio: 'Bio "boa" <b>', photo: { src: "/api/v1/images/1" }, seo: { title: "Ana <Studio>" } }, { origin: "https://vorenme.com", slug: "ana" });
  assert.equal((out.match(/<title>/g) || []).length, 1);
  assert.ok(out.includes("<title>Ana &lt;Studio&gt;</title>"));
  assert.ok(out.includes('og:description" content="Bio &quot;boa&quot; &lt;b&gt;"'));
  assert.ok(out.includes('og:image" content="https://vorenme.com/api/v1/images/1"'));
  assert.ok(out.includes('og:url" content="https://vorenme.com/ana"'));
  assert.ok(!out.includes('content="x"'));
});

test("$ no título não vira padrão do replace", () => {
  const html = "<html><head><title>x</title></head><body>APP</body></html>";
  const out = injectHead(html, { name: { first: "a" }, seo: { title: "x $` $' $&" } }, { origin: "https://v.me", slug: "a" });
  assert.equal(out.split("APP").length, 2); // o corpo não foi copiado para dentro do <head>
  assert.ok(out.includes("<title>x $` $&#39; $&amp;</title>"));
});
