// node --test src/service/reminder.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { dueReminders } from "./reminder.service.js";
import { templates } from "./email.service.js";

const HOUR = 3600 * 1000;
const now = new Date("2026-11-10T15:00:00Z");
const created = (hoursAgo) => new Date(now.getTime() - hoursAgo * HOUR);
const names = (u) => dueReminders(u, now).map((r) => r.name);

test("lembretes no momento certo", () => {
  assert.deepEqual(names({ createAt: created(24) }), []); // 2 dias de teste ainda
  assert.deepEqual(names({ createAt: created(60) }), ["trialEnding"]); // acaba em 12h
  assert.deepEqual(names({ createAt: created(60), asaasSubscriptionId: "sub_1" }), []); // já assinou
  assert.deepEqual(names({ createAt: created(80) }), ["expired"]); // venceu há 8h
  assert.deepEqual(names({ createAt: created(72 + 4 * 24 + 6) }), ["goingOffline"]); // sai do ar em 18h
  assert.deepEqual(names({ createAt: created(72 + 5 * 24 + 6) }), ["offline"]); // saiu há 6h
  assert.deepEqual(names({ createAt: created(72 + 7 * 24) }), []); // já avisado antes
});

test("chave muda a cada período (pagou e venceu de novo = novo aviso)", () => {
  const a = dueReminders({ createAt: created(80) }, now)[0].key;
  const b = dueReminders({ createAt: created(900), paidUntil: created(20) }, now)[0].key; // venceu ontem
  assert.notEqual(a, b);
});

test("todos os modelos montam html e texto", () => {
  const u = { email: "a@b.com", name: "Ana Souza" };
  const data = { link: "https://x/y", verifyLink: "https://x/v", until: now, activeUntil: now, offlineAt: now, subscribed: true };
  for (const [name, fn] of Object.entries(templates)) {
    const m = fn(u, data);
    assert.ok(m.subject && m.html.includes("Oi, Ana!") && m.text.includes("Oi, Ana!"), name);
    assert.ok(!/[—–]/.test(m.html), `${name} sem travessão`);
  }
});
