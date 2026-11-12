// node --test src/service/conecta.test.js
// Autorização e persistência do Conecta com o Prisma trocado por dublês (os testes não conectam no banco).
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import prisma from "../lib/prisma.js";
import * as conecta from "./conecta.service.js";

const OWNER = "user-a";
const card = {
  id: "card-1", userId: OWNER, slug: "dra.ana", disabledAt: null,
  user: { id: OWNER, name: "Ana", email: "ana@x.com", createAt: new Date(), paidUntil: null, active: true },
  config: { connect: { goal: "clientes", actions: [{ id: "form", label: "Deixar contato", channel: "form" }] } },
};
let calls;
beforeEach(() => {
  calls = [];
  prisma.card.findUnique = async ({ where }) => (where.id === card.id || where.slug === card.slug ? card : null);
  prisma.lead.count = async () => 0;
  prisma.lead.create = async (args) => (calls.push(["lead.create", args]), args.data);
  prisma.lead.findMany = async (args) => (calls.push(["lead.findMany", args]), []);
  prisma.lead.deleteMany = async (args) => (calls.push(["lead.deleteMany", args]), { count: 1 });
  prisma.conversion.create = async (args) => (calls.push(["conversion.create", args]), args.data);
  prisma.conversion.findMany = async (args) => (calls.push(["conversion.findMany", args]), []);
  prisma.conversion.deleteMany = async (args) => (calls.push(["conversion.deleteMany", args]), { count: 0 });
  prisma.emailLog.create = async () => ({});
});

test("outro usuário recebe 404 em tudo do cartão alheio e nada é lido ou gravado", async () => {
  for (const run of [
    () => conecta.summary("user-b", card.id),
    () => conecta.listLeads("user-b", card.id),
    () => conecta.deleteLead("user-b", card.id, "x"),
    () => conecta.listConversions("user-b", card.id),
    () => conecta.createConversion("user-b", card.id, { date: "2026-01-01" }),
    () => conecta.deleteConversion("user-b", card.id, "x"),
  ]) await assert.rejects(run, { status: 404 });
  assert.deepEqual(calls, []);
});

test("listas e exclusões sempre filtram pelo cartão do dono", async () => {
  await conecta.listLeads(OWNER, card.id);
  await conecta.deleteLead(OWNER, card.id, "lead-9");
  await assert.rejects(conecta.deleteConversion(OWNER, card.id, "conv-de-outro-cartao"), { status: 404 });
  assert.deepEqual(calls.map(([name, a]) => [name, a.where.cardId]), [
    ["lead.findMany", card.id], ["lead.deleteMany", card.id], ["conversion.deleteMany", card.id],
  ]);
});

test("conversão ligada a contato de outro cartão é recusada", async () => {
  prisma.lead.count = async ({ where }) => (where.cardId === card.id && where.id === "11111111-1111-1111-1111-111111111111" ? 1 : 0);
  await assert.rejects(conecta.createConversion(OWNER, card.id, { date: "2026-01-01", leadId: "22222222-2222-2222-2222-222222222222" }), { status: 404 });
  const ok = await conecta.createConversion(OWNER, card.id, { date: "2026-01-01", leadId: "11111111-1111-1111-1111-111111111111", value: "120" });
  assert.equal(ok.cardId, card.id);
  assert.equal(ok.value, 120);
});

test("formulário público grava o contato com consentimento e sem IP", async () => {
  await conecta.createLead("dra.ana", { action: "form", name: "Bia", contact: "bia@x.com", consent: true });
  const [[name, args]] = calls;
  assert.equal(name, "lead.create");
  assert.deepEqual(Object.keys(args.data).sort(), ["action", "cardId", "consentAt", "contact", "interest", "message", "name"]);
  assert.equal(args.data.cardId, card.id);
});

test("formulário: inválido = 400 com a lista; isca = não grava; cartão inexistente = 404; excesso = 429", async () => {
  await assert.rejects(conecta.createLead("dra.ana", { action: "form", name: "B" }), (e) => e.status === 400 && e.errors.length === 3);
  await conecta.createLead("dra.ana", { action: "form", website: "x", name: "Bot", contact: "a@b.co", consent: true });
  await assert.rejects(conecta.createLead("nao-existe", {}), { status: 404 });
  prisma.lead.count = async () => 100;
  await assert.rejects(conecta.createLead("dra.ana", { action: "form", name: "Bia", contact: "bia@x.com", consent: true }), { status: 429 });
  assert.deepEqual(calls, []);
});

test("cartão com assinatura vencida (modo básico) não recebe contatos", async () => {
  const old = card.user.createAt;
  card.user.createAt = new Date(Date.now() - 4 * 24 * 3600 * 1000); // trial de 3 dias acabou, ainda no ar
  await assert.rejects(conecta.createLead("dra.ana", { action: "form", name: "Bia", contact: "bia@x.com", consent: true }), { status: 404 });
  card.user.createAt = old;
});
