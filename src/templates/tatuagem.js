import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "tatuagem",
  name: "Estúdio de tatuagem",
  category: "Arte & estilo",
  config: {
    name: { first: "Tinta", last: "Preta Studio" },
    username: "tintapretastudio",
    photo: {
      src: unsplash("1565058379802-bbe93b2f703a"),
      alt: "Tatuador de luvas pretas fazendo uma tatuagem no braço",
      focal: "45% 50%",
    },
    bio: "Fineline, blackwork e realismo. Cada projeto é desenhado do zero junto com você.",
    niche: "Estúdio de tatuagem",
    location: "São Paulo",
    accent: "#C23B3B",
    theme: "dark",
    style: "tinta",
    availability: { open: true, label: "Agenda aberta para orçamentos" },
    socials: [
      { platform: "instagram", label: "Portfólio", handle: "@tintapretastudio", url: "https://instagram.com/tintapretastudio" },
      { platform: "pinterest", label: "Referências", handle: "tintapretastudio", url: "https://pinterest.com" },
    ],
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Olá! Vim pelo cartão digital e quero orçar uma tatuagem.",
    },
    email: { address: "contato@example.com", subject: "Orçamento de tatuagem" },
    partnership: {
      title: "Orce sua tattoo.",
      text: "Mande a ideia, o tamanho aproximado e o local do corpo. O orçamento sai em até 2 dias.",
      formats: ["Fineline", "Blackwork", "Realismo", "Cobertura", "Flash"],
    },
    now: {
      title: "Estilos",
      text: "Material descartável, estúdio licenciado pela vigilância sanitária.",
      interests: ["Old school", "Geométrico", "Lettering", "Piercing"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Tinta Preta Studio | Tatuagem",
      description: "Estúdio de tatuagem em São Paulo: fineline, blackwork e realismo. Orçamento pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Estilos", brands: "Marcas que usamos" },
  },
};
