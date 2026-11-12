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
  c.style = "neon";
  c.whatsapp.number = "+55 11 9";
  delete c.labels.share;
  assert.equal(validateCardConfig(c).length, 5);
  assert.deepEqual(validateCardConfig(null), ["Dados do cartão inválidos."]);
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
  assert.ok(errors.some((e) => e.includes("Cupom 1")));
  assert.ok(errors.some((e) => e.includes("coupons[0].url")));
});

test("ordem dos blocos: aceita ids conhecidos, recusa desconhecido e repetido", () => {
  const c = structuredClone(templates[0].config);
  c.order = ["cupons", "destaque", "redes"];
  assert.deepEqual(validateCardConfig(c), []);
  for (const bad of [["cupons", "x}body{display:none"], ["cupons", "cupons"], "cupons"]) {
    c.order = bad;
    assert.deepEqual(validateCardConfig(c), ["Ordem dos blocos inválida."]);
  }
});

test("pix, endereço e avaliação", () => {
  const c = structuredClone(templates[0].config);
  c.pix = { key: "a@b.com", name: "Ana", city: "São Paulo" };
  c.address = { text: "Rua A, 1", hours: [{ days: "Seg–Sex", time: "9h–18h" }] };
  c.review = { url: "https://g.page/r/abc/review" };
  assert.deepEqual(validateCardConfig(c), []);
  c.pix.city = "Cidade com nome grande demais";
  c.review.url = "javascript:alert(1)";
  c.address.hours = [{ days: "" }];
  assert.equal(validateCardConfig(c).length, 3);
});

test("sobrenome é opcional; nome não", () => {
  const c = structuredClone(templates[0].config);
  c.name.last = "";
  assert.deepEqual(validateCardConfig(c), []);
  c.name.first = " ";
  assert.deepEqual(validateCardConfig(c), ["Informe o nome."]);
});

test("conecta: aceita configuração completa", () => {
  const c = structuredClone(templates[0].config);
  c.connect = {
    goal: "agendamento", title: "Como posso ajudar?", audience: "Pacientes adultos",
    actions: [
      { id: "aval", label: "Solicitar avaliação", channel: "whatsapp", message: "Olá! Encontrei seu cartão no VorenMe." },
      { id: "form1", label: "Deixar contato", channel: "form" },
      { id: "tel", label: "Ligar", channel: "phone", phone: "1133334444" },
      { id: "site", label: "Ver tratamentos", channel: "link", url: "https://clinica.com/tratamentos" },
    ],
    services: [{ id: "clar", name: "Clareamento", description: "Em 2 sessões", action: "aval" }],
  };
  assert.deepEqual(validateCardConfig(c), []);
});

test("conecta: recusa objetivo, canal, destino e ligação inválidos", () => {
  const c = structuredClone(templates[0].config);
  delete c.email;
  c.connect = {
    goal: "ficar-rico",
    actions: [
      { id: "a", label: "", channel: "sms" },
      { id: "b", label: "Site", channel: "link", url: "javascript:alert(1)" },
      { id: "c", label: "Ligar", channel: "phone", phone: "abc" },
      { id: "d", label: "E-mail", channel: "email" },
      { id: "d", label: "Repetida", channel: "form" },
    ],
    services: [{ id: "s", name: "Clareamento", action: "nao-existe" }],
  };
  const errors = validateCardConfig(c);
  for (const part of ["objetivo", "repetidas", "ação 1: escreva", "ação 1: escolha", "connect.actions[1].url", "ação 3: informe o telefone", "ação 4: cadastre o e-mail", "serviço 1: escolha"]) {
    assert.ok(errors.some((e) => e.includes(part)), part);
  }
  c.connect = { goal: "clientes", actions: Array.from({ length: 7 }, (_, i) => ({ id: `a${i}`, label: "x", channel: "form" })) };
  assert.ok(validateCardConfig(c).some((e) => e.includes("no máximo 6")));
});
