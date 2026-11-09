import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "barbearia",
  name: "Barbearia",
  category: "Beleza",
  config: {
    name: { first: "Barbearia", last: "Navalha" },
    username: "barbearianavalha",
    photo: {
      src: unsplash("1585747860715-2ba37e788b70"),
      alt: "Interior da barbearia com cadeiras clássicas e parede de tijolos",
      focal: "50% 55%",
    },
    bio: "Corte na régua, barba bem feita e um café enquanto espera. Sem pressa, sem fila.",
    niche: "Barbearia",
    location: "Goiânia",
    accent: "#C8753A",
    theme: "dark",
    style: "tinta",
    availability: { open: true, label: "Seg a sáb, 9h às 21h" },
    socials: [
      { platform: "instagram", handle: "@barbearianavalha", url: "https://instagram.com/barbearianavalha" },
      { platform: "tiktok", handle: "@barbearianavalha", url: "https://www.tiktok.com/@barbearianavalha" },
    ],
    whatsapp: {
      number: "5562900000000",
      display: "+55 62 90000-0000",
      message: "Fala! Vim pelo cartão digital e quero marcar um horário.",
    },
    email: { address: "contato@example.com", subject: "Horário na barbearia" },
    partnership: {
      title: "Marque seu horário.",
      text: "Escolha o barbeiro e o horário pelo WhatsApp. Assinantes têm prioridade na agenda.",
      formats: ["Corte", "Barba", "Combo", "Pigmentação", "Plano mensal"],
    },
    now: {
      title: "Serviços",
      text: "Plano mensal com cortes ilimitados e barba toda semana.",
      interests: ["Degradê", "Navalhado", "Sobrancelha", "Relaxamento"],
    },
    coupons: [{ brand: "Primeiro corte", code: "NAVALHA15", discount: "15% OFF" }],
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Barbearia Navalha | Corte e barba",
      description: "Barbearia em Goiânia: corte, barba e plano mensal. Marque pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Marcas que usamos" },
  },
};
