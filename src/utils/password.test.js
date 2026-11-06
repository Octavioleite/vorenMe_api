// node --test src/utils/password.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password.js";

test("hash e verificação de senha", async () => {
  const stored = await hashPassword("senha-forte-123");
  assert.notEqual(stored, await hashPassword("senha-forte-123")); // salt diferente
  assert.equal(await verifyPassword("senha-forte-123", stored), true);
  assert.equal(await verifyPassword("senha-errada", stored), false);
  assert.equal(await verifyPassword("x", "lixo"), false);
});
