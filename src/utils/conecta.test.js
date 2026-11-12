// node --test src/utils/conecta.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { MIN_CLICKS, MIN_VISITORS, normalizeConversion, normalizeLead, recommend, earlySignals, visitorId } from "./conecta.js";
import { normalizeEvent } from "../service/stats.service.js";

const connect = {
  goal: "agendamento",
  actions: [
    { id: "aval", label: "Solicitar avaliação", channel: "whatsapp", message: "Olá!" },
    { id: "form", label: "Deixar contato", channel: "form" },
  ],
  services: [
    { id: "clar", name: "Clareamento", action: "aval" },
    { id: "impl", name: "Implantes", action: "form" },
  ],
};

test("visitante: mesmo navegador e dia = mesmo id; outro dia, cartão ou IP = outro id; sem IP = sem id", () => {
  const d1 = new Date("2026-11-11T15:00:00Z");
  const a = visitorId("card1", "1.2.3.4", "UA", d1);
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.equal(visitorId("card1", "1.2.3.4", "UA", new Date("2026-11-11T20:00:00Z")), a);
  assert.notEqual(visitorId("card1", "1.2.3.4", "UA", new Date("2026-11-12T15:00:00Z")), a);
  assert.notEqual(visitorId("card2", "1.2.3.4", "UA", d1), a);
  assert.notEqual(visitorId("card1", "1.2.3.5", "UA", d1), a);
  assert.equal(visitorId("card1", undefined, "UA", d1), null);
  // O dia é o de Brasília: 01h UTC ainda é o dia anterior lá.
  assert.equal(visitorId("c", "ip", "", new Date("2026-11-12T01:00:00Z")), visitorId("c", "ip", "", new Date("2026-11-11T12:00:00Z")));
});

test("evento: aceita só ids e seções conhecidos; shown sem repetição e com teto", () => {
  assert.deepEqual(normalizeEvent({ kind: "click", target: "whatsapp", action: "aval", interest: "clar", source: "qr" }),
    { kind: "click", source: "qr", target: "whatsapp", action: "aval", interest: "clar" });
  assert.equal(normalizeEvent({ kind: "click", target: "whatsapp", action: "<script>" }).action, undefined);
  assert.deepEqual(normalizeEvent({ kind: "view", shown: ["a", "a", "B!", "b", "c", "d", "e", "f", "g"] }).shown, ["a", "b", "c", "d", "e", "f"]);
  assert.equal(normalizeEvent({ kind: "section", target: "rodape" }), null);
  assert.equal(normalizeEvent({ kind: "section", target: "conecta" }).target, "conecta");
  assert.equal(normalizeEvent({ kind: "lead" }), null);
});

test("lead: valida, limpa e aceita só ação de formulário", () => {
  const ok = normalizeLead({ action: "form", interest: "impl", name: "  Ana  ", contact: "(11) 98765-4321", message: "Oi\nquero saber", consent: true }, connect);
  assert.deepEqual(ok.errors, []);
  assert.deepEqual(ok.data, { action: "form", interest: "impl", name: "Ana", contact: "11987654321", message: "Oi\nquero saber" });
  assert.equal(normalizeLead({ action: "form", name: "Ana", contact: "ANA@X.COM", consent: true }, connect).data.contact, "ana@x.com");
  // Serviço de outra ação não entra.
  assert.equal(normalizeLead({ action: "form", interest: "clar", name: "Ana", contact: "a@x.com", consent: true }, connect).data.interest, null);
  assert.deepEqual(normalizeLead({ action: "aval", name: "Ana", contact: "a@x.com", consent: true }, connect).errors, ["Este formulário não está mais disponível."]);
  assert.equal(normalizeLead({ action: "form", name: "A", contact: "123", consent: false }, connect).errors.length, 3);
  assert.equal(normalizeLead({ action: "form", name: "Ana", contact: "a@x.com", consent: true, message: "x".repeat(501) }, connect).errors.length, 1);
  assert.deepEqual(normalizeLead({ action: "form", website: "http://spam" }, connect), { spam: true, errors: [] });
  assert.equal(normalizeLead({ action: "form" }, undefined).errors.length, 1);
});

test("conversão: data obrigatória e não futura, valor opcional", () => {
  const now = new Date("2026-11-11T15:00:00Z");
  const ok = normalizeConversion({ date: "2026-11-10", value: "350.555", note: " Implante ", action: "aval" }, now);
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.data.value, 350.56);
  assert.equal(ok.data.note, "Implante");
  assert.equal(ok.data.occurredAt.toISOString(), "2026-11-11T02:59:59.000Z");
  assert.deepEqual(normalizeConversion({ date: "2026-11-12" }, now).errors, ["A data não pode ser no futuro."]);
  assert.deepEqual(normalizeConversion({}, now).errors, ["Informe a data."]);
  assert.deepEqual(normalizeConversion({ date: "2026-11-10", value: -1 }, now).errors, ["Valor inválido."]);
  assert.equal(normalizeConversion({ date: "2026-11-10", leadId: "x" }, now).data.leadId, null);
});

const m = (over = {}) => ({
  visitors: 100, sectionViewers: 90, actionClickers: 20, whatsappIntents: 10, leads: 0, conversions: 0,
  actions: [{ id: "aval", eligible: 100, clickers: 15, clicks: 18 }, { id: "form", eligible: 100, clickers: 5, clicks: 5 }],
  services: [{ id: "clar", clickers: 4, clicks: 4 }, { id: "impl", clickers: 3, clicks: 3 }],
  ...over,
});
const ids = (r) => r.items.map((x) => x.id);

test("recomendações: sem volume mínimo não conclui nada, só orienta", () => {
  const r = recommend(m({ visitors: MIN_VISITORS - 1, actionClickers: 0 }), connect);
  assert.equal(r.ready, false);
  assert.deepEqual(r.items, []);
  assert.ok(r.tips.length > 0);
  assert.equal(recommend(m(), undefined).ready, false);
  assert.match(recommend(m(), undefined).tips[0], /Ative o Conecta/);
});

test("recomendações: cartão saudável não gera alerta", () => {
  assert.deepEqual(recommend(m(), connect).items, []);
});

test("recomendações: cada regra dispara com a evidência", () => {
  assert.deepEqual(ids(recommend(m({ actionClickers: 2 }), connect)), ["poucos-cliques"]);
  const swap = recommend(m({ actions: [{ id: "aval", eligible: 100, clickers: 4, clicks: 4 }, { id: "form", eligible: 100, clickers: MIN_CLICKS, clicks: 12 }] }), connect);
  assert.deepEqual(ids(swap), ["acao-destaque"]);
  assert.match(swap.items[0].evidence, /10 visitantes clicaram em "Deixar contato", contra 4/);
  assert.deepEqual(ids(recommend(m({ actions: [{ id: "aval", eligible: 100, clickers: 20, clicks: 20 }, { id: "form", eligible: 100, clickers: 0, clicks: 0 }] }), connect)), ["acao-sem-uso"]);
  assert.deepEqual(ids(recommend(m({ sectionViewers: 30 }), connect)), ["secao-pouco-vista"]);
  assert.deepEqual(ids(recommend(m({ services: [{ id: "clar", clickers: 12, clicks: 15 }, { id: "impl", clickers: 3, clicks: 3 }] }), connect)), ["servico-destaque"]);
  // Ação removida do cartão não vira recomendação.
  assert.deepEqual(ids(recommend(m({ actions: [...m().actions, { id: "velha", eligible: 100, clickers: 0, clicks: 0 }] }), connect)), []);
  // Nenhum texto promete resultado.
  for (const it of recommend(m({ actionClickers: 1, sectionViewers: 1 }), connect).items) assert.doesNotMatch(it.text, /vai aumentar|garant/i);
});

test("recomendações: botão de ação e primeiros sinais com pouco tráfego", () => {
  const swap = recommend(m({ actions: [{ id: "aval", eligible: 100, clickers: 4, clicks: 4 }, { id: "form", eligible: 100, clickers: MIN_CLICKS, clicks: 12 }] }), connect);
  assert.deepEqual(swap.items[0].fix, { kind: "primary", id: "form", label: swap.items[0].fix.label });
  assert.equal(recommend(m({ actionClickers: 2 }), connect).items[0].fix.kind, "edit");
  const few = recommend(m({ visitors: 12, sectionViewers: 3, actionClickers: 2, leads: 1, actions: [{ id: "form", eligible: 12, clickers: 2, clicks: 2 }] }), connect);
  assert.equal(few.ready, false);
  assert.equal(few.early.length, 4);
  assert.deepEqual(earlySignals(m({ visitors: 0 }), connect), []);
  assert.deepEqual(earlySignals(m(), undefined), []);
});
