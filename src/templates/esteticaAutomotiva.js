import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "estetica-automotiva",
  name: "Estética automotiva",
  category: "Automotivo",
  config: {
    name: { first: "Garage", last: "Brilho" },
    username: "garagebrilho",
    photo: {
      src: unsplash("1607860108855-64acf2078ed9"),
      alt: "Carro preto sendo lavado à mão com espuma",
      focal: "50% 60%",
    },
    bio: "Polimento, vitrificação e higienização interna feitos com calma e produto de primeira. Seu carro sai melhor que da concessionária.",
    niche: "Estética automotiva & detailing",
    location: "Curitiba",
    accent: "#D4A017",
    theme: "dark",
    style: "forte",
    availability: { open: true, label: "Seg a sáb, 8h às 18h" },
    socials: [
      { platform: "instagram", handle: "@garagebrilho", url: "https://instagram.com/garagebrilho" },
      { platform: "tiktok", handle: "@garagebrilho", url: "https://www.tiktok.com/@garagebrilho" },
    ],
    whatsapp: {
      number: "5541900000000",
      display: "+55 41 90000-0000",
      message: "Olá! Vim pelo cartão digital e quero um orçamento para o meu carro.",
    },
    email: { address: "contato@example.com", subject: "Orçamento de estética automotiva" },
    partnership: {
      title: "Agende seu horário.",
      text: "Mande o modelo do carro e o serviço que procura. Respondemos com orçamento e data no mesmo dia.",
      formats: ["Lavagem detalhada", "Polimento", "Vitrificação", "Higienização", "Leva e traz"],
    },
    now: {
      title: "Serviços",
      text: "Pacotes por porte do veículo. Vitrificação com garantia de até 3 anos.",
      interests: ["Cristalização de vidros", "Couro", "Faróis", "Motor"],
    },
    coupons: [{ brand: "Primeira visita", code: "BRILHO10", discount: "10% OFF" }],
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Garage Brilho | Estética automotiva",
      description: "Polimento, vitrificação e higienização automotiva em Curitiba. Agende pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Marcas que usamos" },
  },
};
