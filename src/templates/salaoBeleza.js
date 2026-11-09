import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "salao-beleza",
  name: "Salão de beleza",
  category: "Beleza",
  config: {
    name: { first: "Studio", last: "Flor de Lis" },
    username: "studioflordelis",
    photo: {
      src: unsplash("1562322140-8baeececf3df"),
      alt: "Cabeleireira finalizando escova em cliente no salão",
      focal: "60% 40%",
    },
    bio: "Corte, cor e tratamento pensados para o seu cabelo, não para a tendência da semana.",
    niche: "Salão de beleza",
    location: "Porto Alegre",
    accent: "#C0627A",
    theme: "light",
    style: "atelie",
    availability: { open: true, label: "Ter a sáb, 9h às 20h" },
    socials: [
      { platform: "instagram", handle: "@studioflordelis", url: "https://instagram.com/studioflordelis" },
      { platform: "tiktok", handle: "@studioflordelis", url: "https://www.tiktok.com/@studioflordelis" },
    ],
    whatsapp: {
      number: "5551900000000",
      display: "+55 51 90000-0000",
      message: "Oi! Vim pelo cartão digital e quero agendar um horário.",
    },
    email: { address: "contato@example.com", subject: "Agendamento no salão" },
    partnership: {
      title: "Agende seu horário.",
      text: "Escolha o serviço e o melhor dia. Para coloração, fazemos o teste de mecha antes, sem custo.",
      formats: ["Corte", "Coloração", "Mechas", "Escova", "Hidratação"],
    },
    now: {
      title: "Serviços",
      text: "Equipe de cabeleireiras, manicure e maquiadora no mesmo espaço.",
      interests: ["Penteados", "Noivas", "Progressiva", "Maquiagem"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Studio Flor de Lis | Salão de beleza",
      description: "Salão de beleza em Porto Alegre: corte, coloração, mechas e tratamentos. Agende pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Marcas que usamos" },
  },
};
