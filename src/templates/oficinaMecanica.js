import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "oficina-mecanica",
  name: "Oficina mecânica",
  category: "Automotivo",
  config: {
    name: { first: "Auto", last: "Center Pistão" },
    username: "autocenterpistao",
    photo: {
      src: unsplash("1487754180451-c456f719a1fc"),
      alt: "Mecânico trocando o óleo de um carro com o capô aberto",
      focal: "50% 55%",
    },
    bio: "Mecânica geral, revisão e diagnóstico com scanner. Orçamento antes de mexer e peça usada devolvida para você ver.",
    niche: "Mecânica geral e revisão",
    location: "Porto Alegre",
    accent: "#2F6FDB",
    theme: "dark",
    style: "forte",
    availability: { open: true, label: "Seg a sex, 8h às 18h" },
    socials: [
      { platform: "instagram", handle: "@autocenterpistao", url: "https://instagram.com/autocenterpistao" },
    ],
    whatsapp: {
      number: "5551900000000",
      display: "+55 51 90000-0000",
      message: "Olá! Vim pelo cartão digital e quero agendar um serviço no meu carro.",
    },
    email: { address: "contato@example.com", subject: "Agendamento de serviço" },
    partnership: {
      title: "Agende sua revisão.",
      text: "Diga o modelo, o ano e o que está acontecendo. Marcamos o horário e passamos o orçamento antes do serviço.",
      formats: ["Revisão", "Freios", "Suspensão", "Injeção eletrônica", "Ar-condicionado"],
    },
    now: {
      title: "Serviços",
      text: "Atendemos todas as marcas, nacionais e importadas. Garantia de 90 dias em peças e mão de obra.",
      interests: ["Troca de óleo", "Alinhamento", "Embreagem", "Diagnóstico"],
    },
    address: {
      text: "Av. Assis Brasil, 3200 - Passo d'Areia, Porto Alegre - RS",
      hours: [
        { days: "Seg a Sex", time: "8h às 18h" },
        { days: "Sábado", time: "8h às 12h" },
      ],
    },
    review: { url: "https://g.page/r/exemplo/review" },
    pix: { key: "pix@example.com", name: "Auto Center Pistao", city: "Porto Alegre" },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Auto Center Pistão | Mecânica em Porto Alegre",
      description: "Mecânica geral, revisão e diagnóstico. Agende pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Marcas que atendemos" },
  },
};
