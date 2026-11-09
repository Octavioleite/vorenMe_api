import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "advocacia",
  name: "Advocacia",
  category: "Serviços profissionais",
  config: {
    name: { first: "Dra. Helena", last: "Prates" },
    username: "helenaprates.adv",
    photo: {
      src: unsplash("1573496359142-b8d87734a5a2"),
      alt: "Helena Prates, advogada, sentada com notebook",
      focal: "50% 30%",
    },
    bio: "Direito de família e do consumidor, com explicações claras e atendimento sem juridiquês.",
    niche: "Advogada · OAB/SP 000.000",
    location: "São Paulo",
    accent: "#2F4A6D",
    theme: "light",
    style: "clinica",
    availability: { open: true, label: "Consultas online e presenciais" },
    socials: [
      { platform: "instagram", handle: "@helenaprates.adv", url: "https://instagram.com/helenaprates.adv" },
      { platform: "website", label: "Site do escritório", handle: "escritorio.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Olá, Dra. Helena! Vim pelo cartão digital e gostaria de agendar uma consulta.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Agende uma consulta.",
      text: "Conte brevemente o seu caso pelo WhatsApp. Retornamos com horário e orientação inicial.",
      formats: ["Família", "Consumidor", "Contratos", "Inventário"],
    },
    now: {
      title: "Áreas",
      text: "Atendimento para pessoas físicas e pequenas empresas.",
      interests: ["Divórcio", "Pensão", "Revisão de contratos", "Indenizações"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Dra. Helena Prates | Advogada",
      description: "Advogada em São Paulo: família, consumidor e contratos. Agende uma consulta.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Áreas", brands: "Parceiros" },
  },
};
