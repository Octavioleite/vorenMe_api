import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "lash-designer",
  name: "Lash & sobrancelha",
  category: "Beleza",
  config: {
    name: { first: "Júlia", last: "Prado" },
    username: "juliaprado.lash",
    photo: {
      src: unsplash("1589710751893-f9a6770ad71b"),
      alt: "Aplicação de extensão de cílios fio a fio",
      focal: "50% 45%",
    },
    bio: "Olhar marcante sem exagero. Extensão de cílios e design de sobrancelha respeitando o seu rosto.",
    niche: "Lash designer & designer de sobrancelhas",
    location: "Salvador",
    accent: "#8E6C8A",
    theme: "light",
    style: "glam",
    availability: { open: true, label: "Horários disponíveis esta semana" },
    socials: [
      { platform: "instagram", handle: "@juliaprado.lash", url: "https://instagram.com/juliaprado.lash" },
      { platform: "tiktok", handle: "@juliaprado.lash", url: "https://www.tiktok.com/@juliaprado.lash" },
    ],
    whatsapp: {
      number: "5571900000000",
      display: "+55 71 90000-0000",
      message: "Oi, Júlia! Vim pelo seu cartão digital e quero agendar um horário.",
    },
    email: { address: "contato@example.com", subject: "Agendamento lash e sobrancelha" },
    partnership: {
      title: "Agende seu horário.",
      text: "Conte o efeito que você quer e eu indico a técnica certa para o seu olhar.",
      formats: ["Fio a fio", "Volume russo", "Lash lifting", "Design de sobrancelha"],
    },
    now: {
      title: "Técnicas",
      text: "Manutenção a cada 15 a 20 dias. Materiais hipoalergênicos.",
      interests: ["Henna", "Brow lamination", "Efeito delineado", "Remoção"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Júlia Prado | Lash & sobrancelha",
      description: "Extensão de cílios, lash lifting e design de sobrancelha em Salvador.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Técnicas", brands: "Marcas que usamos" },
  },
};
