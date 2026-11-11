import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "loja-carros",
  name: "Loja de carros",
  category: "Automotivo",
  config: {
    name: { first: "Rota", last: "Veículos" },
    username: "rotaveiculos",
    photo: {
      src: unsplash("1492144534655-ae79c964c9d7"),
      alt: "Carros esportivos expostos em uma garagem escura",
      focal: "60% 55%",
    },
    bio: "Seminovos revisados, com laudo cautelar e garantia. Aceitamos seu carro na troca e financiamos em até 60x.",
    niche: "Seminovos e multimarcas",
    location: "Goiânia",
    accent: "#E04A2F",
    theme: "dark",
    style: "forte",
    availability: { open: true, label: "Seg a sex, 8h às 18h. Sáb até 13h" },
    socials: [
      { platform: "instagram", handle: "@rotaveiculos", url: "https://instagram.com/rotaveiculos" },
      { platform: "youtube", handle: "@rotaveiculos", url: "https://www.youtube.com/@rotaveiculos" },
      { platform: "website", label: "Estoque completo", handle: "rotaveiculos.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5562900000000",
      display: "+55 62 90000-0000",
      message: "Olá! Vim pelo cartão digital e quero saber sobre os carros disponíveis.",
    },
    email: { address: "contato@example.com", subject: "Interesse em veículo" },
    partnership: {
      title: "Encontre seu próximo carro.",
      text: "Diga o modelo, o ano e quanto quer investir. Mandamos as opções do estoque e simulamos o financiamento na hora.",
      formats: ["Financiamento", "Troca", "Consórcio", "Test drive"],
    },
    now: {
      title: "Estoque",
      text: "Carros novos chegando toda semana. Todos com revisão feita, documentação em dia e laudo cautelar.",
      url: "https://example.com",
      interests: ["SUVs", "Sedans", "Hatches", "Picapes"],
    },
    address: {
      text: "Av. T-63, 1500 - Setor Bueno, Goiânia - GO",
      hours: [
        { days: "Seg a Sex", time: "8h às 18h" },
        { days: "Sábado", time: "8h às 13h" },
      ],
    },
    brands: [],
    website: { label: "rotaveiculos.com.br", url: "https://example.com" },
    footer: baseFooter,
    seo: {
      title: "Rota Veículos | Seminovos em Goiânia",
      description: "Seminovos revisados com laudo cautelar e garantia. Financiamento e troca. Fale pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Estoque", brands: "Marcas que trabalhamos" },
  },
};
