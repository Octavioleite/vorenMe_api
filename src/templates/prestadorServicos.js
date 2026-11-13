import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "prestador-servicos",
  name: "Prestador de serviços",
  category: "Casa e reparos",
  config: {
    name: { first: "Marcos", last: "Ferreira" },
    username: "marcos.eletricista",
    photo: {
      src: unsplash("1621905251189-08b45d6a269e"),
      alt: "Eletricista de capacete e luvas mexendo em um quadro de energia",
      focal: "55% 40%",
    },
    bio: "Instalações e reparos elétricos residenciais com nota fiscal e garantia do serviço. Orçamento sem compromisso.",
    niche: "Eletricista residencial",
    location: "Campinas",
    accent: "#E0A21B",
    theme: "light",
    style: "oficio",
    availability: { open: true, label: "Atendo também aos sábados" },
    socials: [
      { platform: "instagram", handle: "@marcos.eletricista", url: "https://instagram.com/marcos.eletricista" },
    ],
    whatsapp: {
      number: "5519900000000",
      display: "+55 19 90000-0000",
      message: "Olá, Marcos! Vim pelo seu cartão e preciso de um orçamento.",
    },
    email: { address: "contato@example.com", subject: "Orçamento de serviço elétrico" },
    partnership: {
      title: "Peça seu orçamento.",
      text: "Mande uma foto do problema pelo WhatsApp. Respondo com o valor e o melhor horário para ir até você.",
      formats: ["Instalação", "Manutenção", "Emergência", "Nota fiscal"],
    },
    now: {
      title: "Região atendida",
      text: "Campinas, Valinhos, Vinhedo, Sumaré e Hortolândia. Para outras cidades, consulte.",
      interests: ["Chuveiro", "Tomadas", "Quadro de luz", "Iluminação", "Ventilador de teto"],
    },
    review: { url: "https://g.page/r/exemplo/review" },
    pix: { key: "pix@example.com", name: "Marcos Ferreira", city: "Campinas" },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Marcos Ferreira | Eletricista em Campinas",
      description: "Instalações e reparos elétricos com garantia. Orçamento rápido pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Região atendida", brands: "Marcas que uso" },
  },
};
