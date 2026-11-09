import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "simples",
  name: "Cartão simples",
  category: "Essencial",
  config: {
    name: { first: "Lucas", last: "Andrade" },
    username: "lucasandrade",
    photo: {
      src: unsplash("1500648767791-00dcc994a43e"),
      alt: "Lucas Andrade sorrindo, retrato",
      focal: "50% 30%",
    },
    bio: "Consultor comercial. Ajudo pequenas empresas a vender mais com processo e atendimento simples.",
    niche: "Consultor comercial",
    location: "Recife",
    accent: "#2563EB",
    theme: "light",
    style: "simples",
    socials: [
      { platform: "instagram", handle: "@lucasandrade", url: "https://instagram.com/lucasandrade" },
      { platform: "website", label: "Site", handle: "lucasandrade.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5581900000000",
      display: "+55 81 90000-0000",
      message: "Olá, Lucas! Vim pelo seu cartão digital.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Vamos conversar.",
      text: "Me chame no WhatsApp e marcamos um café ou uma chamada.",
      formats: ["Consultoria", "Treinamentos", "Palestras"],
    },
    now: {
      title: "Agora",
      text: "Atendendo empresas de varejo e serviços.",
      interests: [],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Lucas Andrade | Consultor comercial",
      description: "Contato de Lucas Andrade, consultor comercial em Recife.",
      locale: "pt_BR",
    },
    labels: baseLabels,
  },
};
