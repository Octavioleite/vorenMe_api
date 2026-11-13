// node --test src/utils/plan.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { isActive, isOnline, isPublished, basicConfig, paidUntilFrom, statusOf, untilFromYmd } from "./plan.js";

test("pagamento libera 1 mês + folga", () => {
  assert.equal(paidUntilFrom("2026-11-10").toISOString(), "2026-12-14T02:59:59.000Z");
  assert.equal(paidUntilFrom("2026-01-31").toISOString().slice(0, 10), "2026-03-04"); // fim de mês não quebra: ~1 mês + 3 dias
  assert.equal(paidUntilFrom("2026-11-10", 12).toISOString(), "2027-11-14T02:59:59.000Z"); // anual
});
import { validateCardConfig } from "../dto/card/config.js";
import templates from "../templates/index.js";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-10T12:00:00Z");
const ago = (days) => new Date(now.getTime() - days * DAY);

test("trial de 3 dias e paidUntil", () => {
  assert.equal(isActive({ createAt: ago(2) }, now), true);
  assert.equal(isActive({ createAt: ago(4) }, now), false);
  assert.equal(isActive({ createAt: ago(40), paidUntil: ago(-5) }, now), true);
  assert.equal(isActive({ createAt: ago(40), paidUntil: ago(1) }, now), false);
});

test("modo básico continua válido e sem os extras", () => {
  for (const t of templates) {
    const c = basicConfig(t.config);
    assert.deepEqual(validateCardConfig(c), [], t.id);
    assert.equal(c.coupons, undefined);
    assert.equal(c.featured, undefined);
    assert.equal(c.whatsapp, t.config.whatsapp);
  }
});

test("vencido: 5 dias no modo básico e depois sai do ar", () => {
  assert.equal(isOnline({ createAt: ago(7) }, now), true); // trial acabou há 4 dias
  assert.equal(isOnline({ createAt: ago(9) }, now), false); // acabou há 6 dias
  assert.equal(isOnline({ createAt: ago(60), paidUntil: ago(2) }, now), true);
  assert.equal(isOnline({ createAt: ago(60), paidUntil: ago(6) }, now), false);
});

test("status do admin", () => {
  assert.equal(statusOf({ createAt: ago(1) }, now), "trial");
  assert.equal(statusOf({ createAt: ago(40), paidUntil: ago(-5) }, now), "pagante");
  assert.equal(statusOf({ createAt: ago(5) }, now), "basico");
  assert.equal(statusOf({ createAt: ago(40), paidUntil: ago(10) }, now), "offline");
  assert.equal(statusOf({ createAt: ago(1), active: false }, now), "desativado");
  assert.equal(isOnline({ createAt: ago(1), active: false }, now), false);
  assert.equal(untilFromYmd("2026-12-10").toISOString(), "2026-12-11T02:59:59.000Z");
});

test("admin não vence", () => {
  process.env.ADMIN_EMAILS = "a@x.com, b@x.com";
  assert.equal(isActive({ createAt: ago(400), email: "B@x.com" }, now), true);
  assert.equal(isOnline({ createAt: ago(400), email: "b@x.com" }, now), true);
  assert.equal(isActive({ createAt: ago(400), email: "c@x.com" }, now), false);
});

test("modo básico tira o Conecta", () => {
  assert.equal(basicConfig({ name: "x", connect: { goal: "clientes", actions: [] } }).connect, undefined);
});

test("cartão só vai ao ar com e-mail confirmado, menos contas de antes da confirmação existir", () => {
  assert.equal(isPublished({ createAt: new Date("2026-11-20"), emailVerifiedAt: null }), false);
  assert.equal(isPublished({ createAt: new Date("2026-11-20"), emailVerifiedAt: new Date("2026-11-20") }), true);
  assert.equal(isPublished({ createAt: new Date("2026-10-01"), emailVerifiedAt: null }), true); // conta antiga continua no ar
});
