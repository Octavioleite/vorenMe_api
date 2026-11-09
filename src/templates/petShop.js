import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "pet-shop",
  name: "Pet shop",
  category: "Comércio",
  config: {
    name: { first: "Pet", last: "Amigo" },
    username: "petamigo",
    photo: {
      src: unsplash("1516734212186-a967f81ad0d7"),
      alt: "Golden retriever feliz recebendo carinho",
      focal: "65% 40%",
    },
    bio: "Banho, tosa e tudo que seu pet precisa, com carinho de quem também tem bicho em casa.",
    niche: "Pet shop · banho & tosa",
    location: "Brasília",
    accent: "#E08A2E",
    theme: "light",
    style: "leve",
    availability: { open: true, label: "Seg a sáb, 8h às 19h" },
    socials: [
      { platform: "instagram", handle: "@petamigo", url: "https://instagram.com/petamigo" },
      { platform: "website", label: "Loja online", handle: "petamigo.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5561900000000",
      display: "+55 61 90000-0000",
      message: "Oi! Vim pelo cartão digital e quero agendar banho e tosa.",
    },
    email: { address: "contato@example.com", subject: "Agendamento banho e tosa" },
    partnership: {
      title: "Agende o banho.",
      text: "Informe o porte e a raça do pet. Buscamos e levamos em casa no bairro.",
      formats: ["Banho", "Tosa", "Hidratação", "Táxi dog"],
    },
    now: {
      title: "Serviços",
      text: "Ração, petiscos e acessórios com entrega no mesmo dia.",
      interests: ["Cães", "Gatos", "Pacote mensal", "Vacinas"],
    },
    coupons: [{ brand: "Primeiro banho", code: "PETAMIGO10", discount: "10% OFF" }],
    brands: [],
    website: { label: "petamigo.com.br", url: "https://example.com" },
    footer: baseFooter,
    seo: {
      title: "Pet Amigo | Pet shop, banho e tosa",
      description: "Pet shop em Brasília: banho, tosa, táxi dog e produtos com entrega no mesmo dia.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Marcas que vendemos" },
  },
};
