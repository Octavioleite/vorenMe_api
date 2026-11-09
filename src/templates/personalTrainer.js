import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "personal-trainer",
  name: "Personal trainer",
  category: "Saúde",
  config: {
    name: { first: "Diego", last: "Alves" },
    username: "diegoalves.personal",
    photo: {
      src: unsplash("1517836357463-d25dfeac3438"),
      alt: "Atleta levantando barra com anilhas na academia",
      focal: "50% 50%",
    },
    bio: "Treino com método, não com moda. Hipertrofia, emagrecimento e condicionamento com acompanhamento de perto.",
    niche: "Personal trainer · CREF 000000-G/SP",
    location: "Ribeirão Preto",
    accent: "#2FA36B",
    theme: "dark",
    style: "forte",
    availability: { open: true, label: "Vagas para novos alunos" },
    socials: [
      { platform: "instagram", handle: "@diegoalves.personal", url: "https://instagram.com/diegoalves.personal" },
      { platform: "youtube", handle: "@diegoalves", url: "https://www.youtube.com/@diegoalves" },
    ],
    whatsapp: {
      number: "5516900000000",
      display: "+55 16 90000-0000",
      message: "Fala, Diego! Vim pelo seu cartão digital e quero saber sobre os planos de treino.",
    },
    email: { address: "contato@example.com", subject: "Planos de treino" },
    partnership: {
      title: "Bora treinar?",
      text: "Começamos com avaliação física e objetivo definido. Treino presencial ou consultoria online.",
      formats: ["Presencial", "Online", "Avaliação física", "Grupos"],
    },
    now: {
      title: "Planos",
      text: "Planilha ajustada todo mês e suporte pelo WhatsApp entre os treinos.",
      interests: ["Hipertrofia", "Emagrecimento", "Mobilidade", "Corrida"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Diego Alves | Personal trainer",
      description: "Personal trainer em Ribeirão Preto. Treino presencial e consultoria online.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Planos", brands: "Parceiros" },
  },
};
