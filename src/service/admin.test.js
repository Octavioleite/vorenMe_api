// node --test src/service/admin.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { parseLink, parsePayment } from "./admin.service.js";

const now = new Date("2026-11-10T12:00:00Z");
const bad = (body) => assert.throws(() => parsePayment(body, now), (e) => e.status === 400);

test("lançamento manual", () => {
  assert.deepEqual(parsePayment({ amount: "9.999", method: "pix", until: "2026-12-10", note: " ok " }, now),
    { amount: 10, method: "pix", until: new Date("2026-12-11T02:59:59.000Z"), note: "ok" });
  assert.equal(parsePayment({ amount: 0, method: "cortesia", until: "2026-11-17" }, now).amount, 0);
  bad({ amount: 5, method: "cortesia", until: "2026-11-17" });
  bad({ amount: 0, method: "pix", until: "2026-11-17" });
  bad({ amount: -1, method: "pix", until: "2026-11-17" });
  bad({ amount: 10, method: "boleto", until: "2026-11-17" });
  bad({ amount: 10, method: "pix", until: "2026-11-01" });
  bad({ amount: 10, method: "pix", until: "amanhã" });
});

test("link de pagamento", () => {
  assert.equal(parseLink({ months: 3 }).amount, 29.97); // sem valor = preço × meses
  assert.equal(parseLink({ months: 1, amount: "50", cpfCnpj: "123.456.789-09" }).cpfCnpj, "12345678909");
  for (const b of [{ months: 0 }, { months: 1.5 }, { months: 1, amount: 2 }]) assert.throws(() => parseLink(b), (e) => e.status === 400);
});

test("csv para Excel em português", async () => {
  const { toCsv } = await import("./admin.service.js");
  const out = toCsv(["a", "b"], [[9.99, 'diz "oi"; tchau'], [null, new Date("2026-01-01T00:00:00Z")]]);
  assert.equal(out, '\uFEFFa;b\r\n9,99;"diz ""oi""; tchau"\r\n;2026-01-01T00:00:00.000Z');
});

test("csv não deixa texto virar fórmula", async () => {
  const { toCsv } = await import("./admin.service.js");
  assert.equal(toCsv(["n"], [['=HYPERLINK("x")'], ["@SUM(1)"], ["-2+3"], [-5]]).split("\r\n").slice(1).join("|"),
    `"'=HYPERLINK(""x"")"|'@SUM(1)|'-2+3|-5`);
});
