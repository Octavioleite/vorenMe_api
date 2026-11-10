// node --test src/service/stats.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeEvent, parseRange } from "./stats.service.js";

test("só grava valores conhecidos", () => {
  assert.deepEqual(normalizeEvent({ kind: "view", source: "instagram" }), { kind: "view", source: "instagram", target: null });
  assert.deepEqual(normalizeEvent({ kind: "click", source: "<script>", target: "pix" }), { kind: "click", source: "outro", target: "pix" });
  assert.deepEqual(normalizeEvent({ kind: "click", target: "drop table" }), { kind: "click", source: "outro", target: "link" });
  assert.equal(normalizeEvent({ kind: "hack" }), null);
  assert.equal(normalizeEvent(null), null);
});

test("período: padrão 30 dias, datas inclusivas, limites", () => {
  const r = parseRange({ from: "2026-11-01", to: "2026-11-07" });
  assert.equal(r.days, 7);
  assert.equal(r.gte.toISOString(), "2026-11-01T03:00:00.000Z");
  assert.equal(r.lt.toISOString(), "2026-11-08T03:00:00.000Z");
  assert.equal(parseRange({ to: "2026-11-30" }).from, "2026-11-01");
  assert.equal(parseRange({ from: "2026-11-05", to: "2026-11-05" }).days, 1);
  assert.throws(() => parseRange({ from: "2026-11-08", to: "2026-11-01" }), /antes/);
  assert.throws(() => parseRange({ from: "2024-01-01", to: "2026-01-01" }), /1 ano/);
});
