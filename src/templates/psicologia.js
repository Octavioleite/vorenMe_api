import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "psicologia",
  name: "Psicologia",
  category: "Saúde",
  config: {
    name: { first: "Ana", last: "Ribeiro" },
    username: "anaribeiro.psi",
    photo: {
      src: unsplash("1573497019940-1c28c88b4f3e"),
      alt: "Ana Ribeiro, psicóloga, sorrindo",
      focal: "50% 30%",
    },
    bio: "Um espaço seguro para falar sobre ansiedade, relações e autoconhecimento, no seu ritmo.",
    niche: "Psicóloga · CRP 06/000000",
    location: "Belo Horizonte",
    accent: "#7A8F6B",
    theme: "light",
    style: "sereno",
    availability: { open: true, label: "Vagas para novos pacientes" },
    socials: [
      { platform: "instagram", handle: "@anaribeiro.psi", url: "https://instagram.com/anaribeiro.psi" },
      { platform: "spotify", label: "Podcast", handle: "Conversas de consultório", url: "https://open.spotify.com" },
    ],
    whatsapp: {
      number: "5531900000000",
      display: "+55 31 90000-0000",
      message: "Olá, Ana! Vim pelo seu cartão digital e gostaria de saber sobre horários de atendimento.",
    },
    email: { address: "contato@example.com", subject: "Atendimento psicológico" },
    partnership: {
      title: "Vamos conversar?",
      text: "Atendimento online e presencial. A primeira conversa serve para nos conhecermos e tirar dúvidas.",
      formats: ["Online", "Presencial", "Adultos", "Casais"],
    },
    now: {
      title: "Abordagem",
      text: "Terapia Cognitivo-Comportamental, com sessões semanais de 50 minutos.",
      interests: ["Ansiedade", "Autoestima", "Relacionamentos", "Carreira"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Ana Ribeiro | Psicóloga",
      description: "Psicóloga em Belo Horizonte. Atendimento online e presencial para adultos e casais.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Abordagem", brands: "Convênios" },
  },
};
