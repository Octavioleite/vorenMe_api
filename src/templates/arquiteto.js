import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "arquiteto",
  name: "Arquiteto e interiores",
  category: "Arte & estilo",
  config: {
    name: { first: "Lívia", last: "Andrade" },
    username: "liviaandrade.arq",
    photo: {
      src: unsplash("1618221195710-dd6b41faaea6"),
      alt: "Sala de estar com sofá cinza, mesa de madeira e luz natural",
      focal: "50% 60%",
    },
    bio: "Projetos residenciais e de interiores pensados para o jeito que você vive. Do projeto ao acompanhamento da obra.",
    niche: "Arquiteta · CAU A000000-0",
    location: "Brasília",
    accent: "#7A8F6B",
    theme: "light",
    style: "galeria",
    availability: { open: true, label: "Agenda aberta para novos projetos" },
    socials: [
      { platform: "instagram", handle: "@liviaandrade.arq", url: "https://instagram.com/liviaandrade.arq" },
      { platform: "pinterest", handle: "liviaandradearq", url: "https://pinterest.com/liviaandradearq" },
    ],
    featured: {
      title: "Apartamento Asa Sul",
      platform: "website",
      url: "https://example.com",
      kind: "project",
      image: { src: unsplash("1586023492125-27b2c045efd7"), alt: "Poltrona amarela em sala clara com quadro na parede", focal: "50% 55%" },
    },
    whatsapp: {
      number: "5561900000000",
      display: "+55 61 90000-0000",
      message: "Olá, Lívia! Vim pelo seu cartão e quero conversar sobre um projeto.",
    },
    email: { address: "contato@example.com", subject: "Novo projeto" },
    partnership: {
      title: "Vamos conversar sobre seu projeto.",
      text: "Me conte o espaço, o prazo e o que você imagina. A primeira conversa é sem custo.",
      formats: ["Residencial", "Interiores", "Reforma", "Acompanhamento de obra"],
    },
    now: {
      title: "Como funciona",
      text: "Briefing, estudo preliminar, projeto executivo e acompanhamento. Você aprova cada etapa.",
      interests: ["Projeto 3D", "Marcenaria", "Iluminação", "Consultoria online"],
    },
    brands: [],
    website: { label: "liviaandrade.arq.br", url: "https://example.com" },
    footer: baseFooter,
    seo: {
      title: "Lívia Andrade | Arquitetura e interiores",
      description: "Projetos residenciais e de interiores em Brasília. Agende uma conversa.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, featured: "Projeto em destaque", now: "Como funciona", brands: "Fornecedores parceiros" },
  },
};
