import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "nail-designer",
  name: "Nail designer",
  category: "Beleza",
  config: {
    name: { first: "Bia", last: "Nunes" },
    username: "bianunes.nails",
    photo: {
      src: unsplash("1604654894610-df63bc536371"),
      alt: "Mão com unhas decoradas em preto e dourado",
      focal: "45% 55%",
    },
    bio: "Unhas que duram e não estragam a natural. Alongamento, gel e nail art feitos com cuidado.",
    niche: "Nail designer",
    location: "Recife",
    accent: "#B56FA0",
    theme: "light",
    style: "glam",
    availability: { open: true, label: "Agenda aberta para este mês" },
    socials: [
      { platform: "instagram", handle: "@bianunes.nails", url: "https://instagram.com/bianunes.nails" },
      { platform: "pinterest", label: "Inspirações", handle: "bianunesnails", url: "https://pinterest.com" },
    ],
    whatsapp: {
      number: "5581900000000",
      display: "+55 81 90000-0000",
      message: "Oi, Bia! Vim pelo seu cartão digital e quero agendar um horário.",
    },
    email: { address: "contato@example.com", subject: "Agendamento de unhas" },
    partnership: {
      title: "Agende seu horário.",
      text: "Manda uma foto da inspiração que eu te passo o valor e o tempo do procedimento.",
      formats: ["Alongamento", "Esmaltação em gel", "Manutenção", "Nail art"],
    },
    now: {
      title: "Serviços",
      text: "Manutenção a cada 21 dias para manter as unhas sempre bonitas.",
      interests: ["Fibra de vidro", "Banho de gel", "Francesinha", "Pés"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Bia Nunes | Nail designer",
      description: "Alongamento, esmaltação em gel e nail art em Recife. Agende pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Marcas que usamos" },
  },
};
