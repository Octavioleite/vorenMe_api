import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "loja",
  name: "Loja",
  category: "Comércio",
  config: {
    name: { first: "Ateliê", last: "Aurora" },
    username: "atelieaurora",
    photo: {
      src: unsplash("1441986300917-64674bd600d8"),
      alt: "Interior da loja com araras de roupas",
      focal: "50% 50%",
    },
    bio: "Moda feminina com peças selecionadas a dedo. Atendimento na loja e entrega para todo o Brasil.",
    niche: "Moda feminina",
    location: "São Paulo",
    accent: "#B5838D",
    theme: "light",
    availability: { open: true, label: "Seg a sáb, 9h às 19h" },
    socials: [
      { platform: "instagram", handle: "@atelieaurora", url: "https://instagram.com/atelieaurora" },
      { platform: "website", label: "Loja online", handle: "atelieaurora.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Olá! Vim pelo cartão digital e quero saber mais sobre os produtos.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Fale com a gente.",
      text: "Tire dúvidas sobre tamanhos, disponibilidade e entregas. Respondemos rapidinho pelo WhatsApp.",
      formats: ["Retirada na loja", "Entrega", "Troca fácil"],
    },
    now: {
      title: "Novidades",
      text: "Coleção nova chegando toda semana. Siga no Instagram para ver primeiro.",
      interests: ["Vestidos", "Alfaiataria", "Acessórios"],
    },
    brands: [],
    website: { label: "atelieaurora.com.br", url: "https://example.com" },
    footer: baseFooter,
    seo: {
      title: "Ateliê Aurora | Moda feminina",
      description: "Moda feminina com peças selecionadas. Loja em São Paulo e entrega para todo o Brasil.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Novidades", brands: "Marcas que vendemos" },
  },
};
