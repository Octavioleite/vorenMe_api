import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "fisioterapia",
  name: "Fisioterapia e pilates",
  category: "Saúde",
  config: {
    name: { first: "Renata", last: "Prado" },
    username: "renataprado.fisio",
    photo: {
      src: unsplash("1518611012118-696072aa579a"),
      alt: "Mulher fazendo exercício de solo em um tapete de pilates",
      focal: "55% 45%",
    },
    bio: "Fisioterapia ortopédica e pilates para tratar dor, recuperar movimento e prevenir lesões, no seu ritmo.",
    niche: "Fisioterapeuta · CREFITO 3/000000-F",
    location: "Santos",
    accent: "#2A7A8C",
    theme: "light",
    style: "sereno",
    availability: { open: true, label: "Agenda aberta para avaliação" },
    socials: [
      { platform: "instagram", handle: "@renataprado.fisio", url: "https://instagram.com/renataprado.fisio" },
      { platform: "youtube", handle: "@renataprado.fisio", url: "https://www.youtube.com/@renataprado.fisio" },
    ],
    whatsapp: {
      number: "5513900000000",
      display: "+55 13 90000-0000",
      message: "Olá, Renata! Vim pelo seu cartão e quero agendar uma avaliação.",
    },
    email: { address: "contato@example.com", subject: "Agendamento de avaliação" },
    partnership: {
      title: "Agende sua avaliação.",
      text: "Na primeira sessão entendemos sua dor e montamos um plano. Aulas individuais ou em dupla.",
      formats: ["Fisioterapia", "Pilates", "Domiciliar", "Pós-operatório"],
    },
    now: {
      title: "Convênios",
      text: "Atendo particular e por reembolso. Emito recibo para o plano de saúde.",
      interests: ["Unimed", "Bradesco Saúde", "SulAmérica", "Reembolso"],
    },
    address: {
      text: "Av. Ana Costa, 400, sala 52 - Gonzaga, Santos - SP",
      hours: [{ days: "Seg a Sex", time: "7h às 20h" }],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Renata Prado | Fisioterapia e pilates em Santos",
      description: "Fisioterapia ortopédica e pilates. Agende sua avaliação pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Convênios", brands: "Parceiros" },
  },
};
