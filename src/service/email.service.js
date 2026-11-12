import prisma from "../lib/prisma.js";
import { layout, sendMail } from "../utils/mail.js";

const front = () => process.env.FRONT_URL || "http://localhost:5173";
const first = (user) => (user.name ? user.name.trim().split(/\s+/)[0] : "");
const hi = (user) => (first(user) ? `Oi, ${first(user)}!` : "Oi!");
const date = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "America/Sao_Paulo" });
const billing = () => ({ label: "Abrir assinatura", url: `${front()}/painel/assinatura` });

/** Todos os e-mails do produto. Cada um recebe o usuário (e dados extras) e devolve { subject, html, text }. */
export const templates = {
  welcome: (u, { verifyLink }) => ({
    subject: "Confirme seu e-mail e comece no VorenMe",
    ...layout({
      title: "Bem-vindo ao VorenMe",
      preview: "Confirme seu e-mail para proteger sua conta. Você tem 3 dias grátis.",
      lines: [hi(u), "Sua conta está criada e você tem 3 dias grátis para testar tudo, sem cartão de crédito.",
        "Antes de tudo, confirme que este e-mail é seu. É por ele que você recupera a senha e recebe os avisos da assinatura.",
        "Depois é só escolher um modelo, colocar seu WhatsApp, Pix e endereço, e compartilhar o link na bio e nos grupos."],
      cta: { label: "Confirmar meu e-mail", url: verifyLink },
      footnote: "O link vale por 7 dias. Se você não criou esta conta, pode ignorar este e-mail.",
    }),
  }),

  verifyEmail: (u, { verifyLink }) => ({
    subject: "Confirme seu e-mail do VorenMe",
    ...layout({
      title: "Confirme seu e-mail",
      lines: [hi(u), "Toque no botão abaixo para confirmar que este e-mail é seu. É por ele que você recupera a senha e recebe os avisos da assinatura."],
      cta: { label: "Confirmar meu e-mail", url: verifyLink },
      footnote: "O link vale por 7 dias. Se não foi você que pediu, pode ignorar este e-mail.",
    }),
  }),

  passwordReset: (u, { link }) => ({
    subject: "Redefina sua senha do VorenMe",
    ...layout({
      title: "Vamos criar uma nova senha",
      lines: [hi(u), "Recebemos um pedido para redefinir a senha da sua conta. O link abaixo vale por 1 hora."],
      cta: { label: "Criar nova senha", url: link },
      footnote: "Se não foi você, pode ignorar este e-mail. Sua senha continua a mesma.",
    }),
  }),

  passwordChanged: (u) => ({
    subject: "Sua senha foi alterada",
    ...layout({
      title: "Senha alterada",
      lines: [hi(u), `A senha da sua conta VorenMe foi alterada em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.`],
      cta: { label: "Abrir o VorenMe", url: `${front()}/painel` },
      footnote: "Não foi você? Entre no painel, clique em \"Esqueci minha senha\" e crie uma nova agora. Se foi você, não precisa fazer nada.",
    }),
  }),

  paymentConfirmed: (u, { until, value = 9.99 }) => ({
    subject: "Pagamento confirmado",
    ...layout({
      title: "Pagamento confirmado, obrigado!",
      lines: [hi(u), `Recebemos seu pagamento de R$ ${Number(value).toFixed(2).replace(".", ",")}. Seus cartões estão completos e no ar até ${date(until)}.`,
        "A próxima fatura chega por e-mail antes do vencimento."],
      cta: billing(),
    }),
  }),

  canceled: (u, { activeUntil, offlineAt }) => ({
    subject: "Assinatura cancelada",
    ...layout({
      title: "Sua assinatura foi cancelada",
      lines: [hi(u), "Pronto, nada mais será cobrado.",
        `Seus cartões continuam completos até ${date(activeUntil)}. Depois ficam 5 dias no modo básico e saem do ar em ${date(offlineAt)}.`,
        "Se mudar de ideia, é só assinar de novo: tudo volta como estava."],
      cta: { label: "Assinar de novo", url: `${front()}/painel/assinatura` },
    }),
  }),

  referralReward: (u) => ({
    subject: "Você ganhou 1 mês grátis",
    ...layout({
      title: "Sua indicação assinou!",
      lines: [hi(u), "Uma pessoa que você indicou acabou de assinar o VorenMe. Por isso, um mês da sua assinatura fica por nossa conta.",
        "Continue compartilhando seu link: cada nova assinatura vale mais um mês."],
      cta: { label: "Ver minhas indicações", url: `${front()}/painel/assinatura` },
    }),
  }),

  trialEnding: (u, { activeUntil }) => ({
    subject: "Seu teste grátis acaba amanhã",
    ...layout({
      title: "Seu teste acaba amanhã",
      preview: "Assine agora e a primeira cobrança só vence quando o teste acabar.",
      lines: [hi(u), `Seu teste grátis do VorenMe vai até ${date(activeUntil)}.`,
        "Assinando agora, a primeira cobrança de R$ 9,99 só vence quando o teste acabar. Pague com Pix, boleto ou cartão, sem fidelidade."],
      cta: { label: "Assinar por R$ 9,99/mês", url: `${front()}/painel/assinatura` },
    }),
  }),

  expired: (u, { offlineAt, subscribed }) => ({
    subject: subscribed ? "Falta pagar sua fatura do VorenMe" : "Seu teste grátis acabou",
    ...layout({
      title: subscribed ? "Falta pagar a fatura" : "Seu teste acabou",
      lines: [hi(u), "Seus cartões estão no ar no modo básico, só com nome, WhatsApp e contato, e você não consegue mais editar.",
        `Em ${date(offlineAt)} eles saem do ar. Quem abrir o link ou o QR code vai ver uma página de indisponível.`,
        subscribed ? "Pague a fatura para voltar ao normal na hora." : "Assine para liberar tudo de novo. Leva um minuto."],
      cta: billing(),
    }),
  }),

  goingOffline: (u, { offlineAt }) => ({
    subject: "Seus cartões saem do ar amanhã",
    ...layout({
      title: "Seus cartões saem do ar amanhã",
      lines: [hi(u), `Em ${date(offlineAt)} seus cartões deixam de abrir, inclusive pelos QR codes impressos.`,
        "Pagando hoje, nada sai do ar e tudo volta a ficar completo."],
      cta: billing(),
    }),
  }),

  offline: (u) => ({
    subject: "Seus cartões saíram do ar",
    ...layout({
      title: "Seus cartões saíram do ar",
      lines: [hi(u), "Seus cartões não estão mais abrindo para os visitantes.",
        "Nada foi apagado: assine e eles voltam na hora, com os mesmos links e QR codes."],
      cta: { label: "Voltar ao ar", url: `${front()}/painel/assinatura` },
    }),
  }),

  // Sem nome/telefone/e-mail do visitante no corpo: o contato fica só no painel (LGPD, necessidade).
  newLead: (u, { cardId, slug, label }) => ({
    subject: "Novo contato pelo seu cartão",
    ...layout({
      title: "Você recebeu um novo contato",
      preview: `Alguém deixou o contato pelo cartão /${slug}.`,
      lines: [hi(u), `Alguém preencheu o formulário${label ? ` "${label}"` : ""} do seu cartão /${slug}. Responda rápido: quem acabou de pedir contato está esperando.`],
      cta: { label: "Ver o contato", url: `${front()}/painel/estatisticas/${cardId}` },
      footnote: "Os dados da pessoa ficam só no painel do VorenMe. Use-os apenas para responder a esse contato.",
    }),
  }),

  accountDeleted: (u) => ({
    subject: "Sua conta foi excluída",
    ...layout({
      title: "Conta excluída",
      lines: [hi(u), "Sua conta do VorenMe, seus cartões e fotos foram excluídos, e a assinatura foi cancelada.", "Obrigado por ter usado o VorenMe."],
      footnote: "Se não foi você, responda este e-mail imediatamente.",
    }),
  }),
};

const toMail = (user, name, data) => ({ to: user.email, ...templates[name](user, data) });

/** Envia sem nunca quebrar o fluxo principal (cadastro, pagamento...): erro vira log. */
export const notify = async (user, name, data = {}) => {
  try {
    await sendMail(toMail(user, name, data));
  } catch (error) {
    console.error(`Error sending "${name}" email:`, error.message);
  }
};

/** Envia uma única vez por chave (ex.: um lembrete por período). A linha é gravada antes: dois envios simultâneos não duplicam. */
export const notifyOnce = async (user, key, name, data = {}) => {
  try {
    await prisma.emailLog.create({ data: { userId: user.id, key } });
  } catch (error) {
    if (error?.code === "P2002") return false; // já enviado
    throw error;
  }
  try {
    await sendMail(toMail(user, name, data));
    return true;
  } catch (error) {
    // Falhou o envio: libera a chave para a próxima rodada tentar de novo.
    await prisma.emailLog.delete({ where: { userId_key: { userId: user.id, key } } }).catch(() => {});
    console.error(`Error sending "${name}" email:`, error.message);
    return false;
  }
};
