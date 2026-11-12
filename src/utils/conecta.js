// Regras do Conecta sem banco: visitante anônimo, validação de contato/conversão e recomendações.
import { createHash } from "node:crypto";
import { CONNECT_ID } from "../dto/card/config.js";

const brDay = (now = new Date()) => new Date(now.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);

/** Mesmo valor para o mesmo navegador no mesmo cartão e dia (Brasília); muda todo dia. Sem cookie e sem guardar IP.
 *  O segredo impede refazer o hash a partir de um IP conhecido. */
export const visitorId = (cardId, ip, ua, now = new Date()) => {
  if (!ip) return null;
  const secret = process.env.JWT_SECRET_APP || "dev";
  return createHash("sha256").update(`${secret}|${brDay(now)}|${cardId}|${ip}|${ua ?? ""}`).digest("hex").slice(0, 16);
};

// Tira caracteres de controle (quebra de linha só na mensagem) e espaços das pontas.
const clean = (v, max, multiline = false) =>
  typeof v === "string" ? v.replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "").trim().slice(0, max + 1) : "";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formulário público. `spam` = caiu na isca (campo escondido): responde 201 sem gravar, para o robô não insistir. */
export const normalizeLead = (body, connect) => {
  if (clean(body?.website, 200)) return { spam: true, errors: [] };
  const errors = [];
  const action = connect?.actions?.find((a) => a.id === body?.action && a.channel === "form");
  if (!action) return { errors: ["Este formulário não está mais disponível."] };
  const interest = body?.interest ? connect.services?.find((s) => s.id === body.interest && s.action === action.id) : undefined;

  const name = clean(body?.name, 80);
  const raw = clean(body?.contact, 120);
  const digits = raw.replace(/\D/g, "");
  const contact = EMAIL.test(raw) ? raw.toLowerCase() : /^[\d\s()+.-]+$/.test(raw) && digits.length >= 10 && digits.length <= 15 ? digits : "";
  const message = clean(body?.message, 500, true);

  if (name.length < 2 || name.length > 80) errors.push("Informe seu nome.");
  if (!contact) errors.push("Informe um WhatsApp com DDD ou um e-mail válido.");
  if (message.length > 500) errors.push("A mensagem pode ter até 500 caracteres.");
  if (body?.consent !== true) errors.push("Marque a autorização para enviar seus dados.");
  return { errors, data: { action: action.id, interest: interest?.id ?? null, name, contact, message: message || null } };
};

/** Conversão registrada pelo dono. `date` = YYYY-MM-DD (vira o fim do dia em Brasília). */
export const normalizeConversion = (body, now = new Date()) => {
  const errors = [];
  const date = typeof body?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  const occurredAt = date ? new Date(`${date}T23:59:59-03:00`) : null;
  if (!occurredAt || Number.isNaN(occurredAt.getTime())) errors.push("Informe a data.");
  else if (date > brDay(now)) errors.push("A data não pode ser no futuro.");
  const note = clean(body?.note, 200);
  if (note.length > 200) errors.push("A descrição pode ter até 200 caracteres.");
  let value = null;
  if (body?.value !== undefined && body.value !== null && body.value !== "") {
    value = Number(body.value);
    if (!Number.isFinite(value) || value < 0 || value > 10_000_000) errors.push("Valor inválido.");
  }
  const action = typeof body?.action === "string" && CONNECT_ID.test(body.action) ? body.action : null;
  const leadId = typeof body?.leadId === "string" && /^[0-9a-f-]{36}$/i.test(body.leadId) ? body.leadId : null;
  return { errors, data: { occurredAt, note: note || null, value: value === null ? null : Math.round(value * 100) / 100, action, leadId } };
};

/* Recomendações: regras fixas e explicáveis. Cada uma traz a evidência (números) e nunca promete resultado.
   Abaixo do volume mínimo não há conclusão: só orientações de configuração.
   ponytail: limites fixos; trocar por teste estatístico quando houver volume real para calibrar. */
export const MIN_VISITORS = 30; // visitantes únicos no período antes de qualquer conclusão
export const MIN_CLICKS = 10; // cliques únicos para comparar ações ou serviços

const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const fmtPct = (v) => `${v.toLocaleString("pt-BR")}%`;

const RULES = [
  // Visitas sem cliques nas ações.
  (m) => {
    const rate = pct(m.actionClickers, m.visitors);
    if (rate >= 5) return null;
    return {
      id: "poucos-cliques",
      title: "Muitas visitas, poucos cliques nas ações",
      text: "As pessoas abrem o cartão, mas quase ninguém toca nos botões do Conecta. Vale revisar se o texto da ação principal deixa claro o próximo passo.",
      evidence: `${m.actionClickers} de ${m.visitors} visitantes (${fmtPct(rate)}) clicaram em alguma ação.`,
      fix: { kind: "edit", label: "Revisar ações no editor" },
    };
  },
  // Uma ação secundária atrai bem mais que a principal.
  (m, k) => {
    const primary = k.actions[0]?.id;
    const ranked = [...m.actions].filter((a) => k.actions.some((x) => x.id === a.id)).sort((a, b) => b.clickers - a.clickers);
    const top = ranked[0];
    const main = m.actions.find((a) => a.id === primary);
    if (!top || top.id === primary || top.clickers < MIN_CLICKS || top.clickers < 2 * (main?.clickers ?? 0)) return null;
    const label = k.actions.find((a) => a.id === top.id)?.label ?? top.id;
    return {
      id: "acao-destaque",
      title: `"${label}" recebe mais cliques que a ação principal`,
      text: "Pode fazer sentido colocá-la em primeiro lugar. Se trocar, compare o período seguinte com este antes de concluir.",
      evidence: `${top.clickers} visitantes clicaram em "${label}", contra ${main?.clickers ?? 0} na ação principal.`,
      fix: { kind: "primary", id: top.id, label: `Tornar "${label}" principal` },
    };
  },
  // Ação que ninguém usa.
  (m, k) => {
    const dead = m.actions.find((a) => a.eligible >= MIN_VISITORS && a.clickers === 0 && k.actions.some((x) => x.id === a.id));
    if (!dead) return null;
    const label = k.actions.find((a) => a.id === dead.id).label;
    return {
      id: "acao-sem-uso",
      title: `Ninguém clicou em "${label}"`,
      text: "Talvez ela não seja necessária, ou o texto não esteja claro. Menos opções costumam deixar a escolha mais fácil.",
      evidence: `${dead.eligible} visitantes viram essa ação e nenhum clicou.`,
      fix: { kind: "edit", label: "Revisar no editor" },
    };
  },
  // Bloco do Conecta pouco visto.
  (m) => {
    if (pct(m.sectionViewers, m.visitors) >= 40) return null;
    return {
      id: "secao-pouco-vista",
      title: "Poucas pessoas chegam até o bloco do Conecta",
      text: "A maioria sai antes de ver suas ações e serviços. Confira se a ação principal está visível logo no começo do cartão.",
      evidence: `${m.sectionViewers} de ${m.visitors} visitantes (${fmtPct(pct(m.sectionViewers, m.visitors))}) viram o bloco.`,
      fix: { kind: "edit", label: "Abrir no editor" },
    };
  },
  // Um serviço concentra o interesse.
  (m, k) => {
    const ranked = [...m.services].sort((a, b) => b.clickers - a.clickers);
    const [top, second] = ranked;
    if (!top || (k.services?.length ?? 0) < 2 || top.clickers < MIN_CLICKS || top.clickers < 2 * (second?.clickers ?? 0)) return null;
    const name = k.services.find((s) => s.id === top.id)?.name ?? top.id;
    return {
      id: "servico-destaque",
      title: `${name} concentra o interesse`,
      text: "É o serviço que mais gente escolheu. Pode valer destacá-lo na bio, nas redes ou no primeiro lugar da lista.",
      evidence: `${top.clickers} visitantes escolheram ${name}${second ? `; o segundo teve ${second.clickers}` : ""}.`,
      ...(k.services[0]?.id !== top.id && { fix: { kind: "service-first", id: top.id, label: `Colocar ${name} em primeiro` } }),
    };
  },
];

/** Orientações de configuração (sempre válidas, não dependem de dados). */
export const setupTips = (k) => {
  if (!k) return ["Ative o Conecta no editor do cartão (seção Conecta) para escolher o objetivo e as ações do visitante."];
  const tips = [];
  if (!k.actions?.length) tips.push("Cadastre pelo menos uma ação. A primeira da lista vira o botão principal.");
  if (!k.services?.length) tips.push("Cadastre seus serviços ou produtos e ligue cada um a uma ação: a mensagem já chega dizendo o que a pessoa quer.");
  if (k.actions?.length && !k.actions.some((a) => a.channel === "form")) tips.push("Uma ação com formulário deixa quem não usa WhatsApp deixar o contato.");
  if (k.actions?.some((a) => a.channel === "whatsapp" && !a.message)) {
    tips.push("Escreva a mensagem pronta de cada ação de WhatsApp para a conversa já começar com o assunto certo.");
  }
  if (!tips.length) tips.push("Divulgue o link (bio, grupos, QR impresso) para juntar dados. As recomendações aparecem com mais visitas.");
  return tips;
};

/** Pouco tráfego: observações do que já aconteceu, sem concluir nada (o painel avisa que são primeiros sinais). */
export const earlySignals = (m, k) => {
  if (!k || !m.visitors) return [];
  const out = [`${m.visitors} ${m.visitors === 1 ? "visitante" : "visitantes"} no período; ${m.actionClickers} ${m.actionClickers === 1 ? "clicou" : "clicaram"} em alguma ação.`];
  const top = [...m.actions].filter((a) => a.clickers && k.actions.some((x) => x.id === a.id)).sort((a, b) => b.clickers - a.clickers)[0];
  if (top) out.push(`"${k.actions.find((x) => x.id === top.id).label}" é a ação mais clicada até agora (${top.clickers}).`);
  if (m.visitors >= 10 && pct(m.sectionViewers, m.visitors) < 40) out.push(`Só ${m.sectionViewers} de ${m.visitors} visitantes rolaram até o bloco do Conecta.`);
  if (m.leads) out.push(`Você já recebeu ${m.leads} ${m.leads === 1 ? "contato" : "contatos"} pelo formulário.`);
  return out;
};

/** m = métricas do período (conecta.service.js, metrics). k = config.connect atual. */
export const recommend = (m, k) => {
  const ready = !!k && m.visitors >= MIN_VISITORS;
  return {
    ready,
    minVisitors: MIN_VISITORS,
    items: ready ? RULES.map((rule) => rule(m, k)).filter(Boolean) : [],
    early: ready ? [] : earlySignals(m, k),
    tips: setupTips(k),
  };
};
