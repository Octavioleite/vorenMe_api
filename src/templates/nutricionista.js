import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "nutricionista",
  name: "Nutricionista",
  category: "Saúde",
  config: {
    name: { first: "Paula", last: "Mendes" },
    username: "paulamendes.nutri",
    photo: {
      src: unsplash("1512621776951-a57141f2eefd"),
      alt: "Prato colorido com salada, abacate e legumes",
      focal: "50% 50%",
    },
    bio: "Alimentação possível para a sua rotina, sem dieta da moda e sem cortar o que você gosta.",
    niche: "Nutricionista · CRN-3 00000",
    location: "Campinas",
    accent: "#6F9A5B",
    theme: "light",
    style: "sereno",
    availability: { open: true, label: "Vagas para novos pacientes" },
    socials: [
      { platform: "instagram", handle: "@paulamendes.nutri", url: "https://instagram.com/paulamendes.nutri" },
      { platform: "website", label: "Receitas", handle: "paulamendes.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5519900000000",
      display: "+55 19 90000-0000",
      message: "Olá, Paula! Vim pelo cartão digital e quero agendar uma consulta.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Vamos começar?",
      text: "Consulta com avaliação completa e plano alimentar montado para o seu dia a dia.",
      formats: ["Online", "Presencial", "Esportiva", "Gestantes"],
    },
    now: {
      title: "Atendimento",
      text: "Retorno a cada 30 dias, com ajustes no plano e suporte pelo WhatsApp.",
      interests: ["Emagrecimento", "Ganho de massa", "Intolerâncias", "Reeducação"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Paula Mendes | Nutricionista",
      description: "Nutricionista em Campinas: consultas online e presenciais.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Atendimento", brands: "Convênios" },
  },
};
