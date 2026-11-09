import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "esteticista",
  name: "Esteticista",
  category: "Beleza",
  config: {
    name: { first: "Camila", last: "Duarte" },
    username: "camiladuarte.estetica",
    photo: {
      src: unsplash("1570172619644-dfd03ed5d881"),
      alt: "Cliente recebendo máscara facial em cabine de estética",
      focal: "50% 35%",
    },
    bio: "Pele saudável com protocolo feito para você. Avaliação antes de qualquer procedimento, sempre.",
    niche: "Esteticista · Registro profissional 00000",
    location: "Florianópolis",
    accent: "#A47C6B",
    theme: "light",
    style: "sereno",
    availability: { open: true, label: "Horários disponíveis esta semana" },
    socials: [
      { platform: "instagram", handle: "@camiladuarte.estetica", url: "https://instagram.com/camiladuarte.estetica" },
      { platform: "website", label: "Site do espaço", handle: "camiladuarte.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5548900000000",
      display: "+55 48 90000-0000",
      message: "Olá, Camila! Vim pelo seu cartão digital e gostaria de agendar uma avaliação.",
    },
    email: { address: "contato@example.com", subject: "Avaliação estética" },
    partnership: {
      title: "Agende sua avaliação.",
      text: "Na primeira sessão analisamos sua pele e montamos um plano de cuidados, com valores explicados.",
      formats: ["Limpeza de pele", "Peeling", "Drenagem", "Microagulhamento"],
    },
    now: {
      title: "Tratamentos",
      text: "Faciais e corporais, com pacotes mensais para quem quer constância.",
      interests: ["Acne", "Manchas", "Rejuvenescimento", "Pós-operatório"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Camila Duarte | Esteticista",
      description: "Estética facial e corporal em Florianópolis. Limpeza de pele, peeling e drenagem.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Tratamentos", brands: "Marcas que usamos" },
  },
};
