import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "influenciadora",
  name: "Influenciadora",
  category: "Criadores de conteúdo",
  config: {
    name: { first: "Luana", last: "Ferraz" },
    username: "luanaferraz.fit",
    photo: {
      src: unsplash("1550345332-09e3ac987658"),
      alt: "Luana Ferraz em foto preto e branco na academia",
      focal: "42% 28%",
    },
    bio: "Treino possível para a vida real. Força, constância e zero culpa, sem promessa milagrosa.",
    niche: "Fitness & treino de força",
    location: "Rio de Janeiro",
    accent: "#E8552B",
    theme: "dark",
    style: "criador",
    availability: { open: true, label: "Agenda aberta para collabs" },
    socials: [
      { platform: "instagram", handle: "@seuperfil", url: "https://instagram.com/seuperfil" },
      { platform: "tiktok", handle: "@seuperfil", url: "https://www.tiktok.com/@seuperfil" },
      { platform: "youtube", handle: "@seucanal", url: "https://www.youtube.com/@seucanal" },
    ],
    featured: {
      title: "Meu vídeo mais assistido",
      platform: "youtube",
      url: "https://www.youtube.com/@seucanal",
      kind: "video",
      image: { src: unsplash("1541534741688-6078c6bfb5c5"), alt: "Capa do vídeo em destaque", focal: "50% 40%" },
    },
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Oi! Vim pelo seu cartão digital e gostaria de conversar sobre uma parceria.",
    },
    email: { address: "parcerias@example.com", subject: "Proposta de parceria" },
    partnership: {
      title: "Bora construir algo juntos.",
      text: "Campanhas para marcas que combinam com o meu público. Conte sua ideia e eu respondo em até 48h.",
      formats: ["Reels", "TikTok", "YouTube", "UGC", "Eventos"],
    },
    now: {
      title: "Agora",
      text: "Conte aqui o projeto em que você está trabalhando no momento.",
      interests: ["Musculação", "Corrida", "Mobilidade"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Luana Ferraz | Fitness & treino de força",
      description: "Criadora de conteúdo fitness. Redes, conteúdos e contato para parcerias.",
      locale: "pt_BR",
    },
    labels: baseLabels,
  },
};
