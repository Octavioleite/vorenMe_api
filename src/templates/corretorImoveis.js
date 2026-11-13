import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "corretor-imoveis",
  name: "Corretor de imóveis",
  category: "Imóveis",
  config: {
    name: { first: "Marcos", last: "Teixeira" },
    username: "marcosteixeira.imoveis",
    photo: {
      src: unsplash("1564013799919-ab600027ffc6"),
      alt: "Casa com piscina e palmeiras",
      focal: "50% 55%",
    },
    bio: "Compra, venda e locação com acompanhamento do primeiro contato até a entrega das chaves.",
    niche: "Corretor de imóveis · CRECI 00000-F",
    location: "Florianópolis",
    accent: "#C9A227",
    theme: "dark",
    style: "sobrio",
    availability: { open: true, label: "Atendimento todos os dias" },
    socials: [
      { platform: "instagram", handle: "@marcosteixeira.imoveis", url: "https://instagram.com/marcosteixeira.imoveis" },
      { platform: "youtube", label: "Tour dos imóveis", handle: "@marcosteixeira", url: "https://www.youtube.com/marcosteixeira" },
    ],
    whatsapp: {
      number: "5548900000000",
      display: "+55 48 90000-0000",
      message: "Olá, Marcos! Vim pelo cartão digital e procuro um imóvel.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Encontre seu imóvel.",
      text: "Diga o bairro, o tipo e a faixa de valor. Mando opções selecionadas no mesmo dia.",
      formats: ["Compra", "Venda", "Locação", "Avaliação"],
    },
    now: {
      title: "Imóveis",
      text: "Apartamentos e casas em toda a Grande Florianópolis.",
      interests: ["Frente mar", "Lançamentos", "Financiamento", "Permuta"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Marcos Teixeira | Corretor de imóveis",
      description: "Corretor de imóveis em Florianópolis: compra, venda e locação.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Imóveis", brands: "Construtoras parceiras" },
  },
};
