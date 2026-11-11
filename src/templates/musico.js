import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "musico",
  name: "Músico e DJ",
  category: "Arte & estilo",
  config: {
    name: { first: "DJ", last: "Kaio Reis" },
    username: "djkaioreis",
    photo: {
      src: unsplash("1470225620780-dba8ba36b745"),
      alt: "Mão de DJ mexendo na mesa de som com luzes roxas",
      focal: "50% 45%",
    },
    bio: "DJ para casamentos, festas e eventos corporativos. Pista cheia do começo ao fim, com som e luz inclusos.",
    niche: "DJ e produtor musical",
    location: "Fortaleza",
    accent: "#9B5DE5",
    theme: "dark",
    style: "criador",
    availability: { open: true, label: "Datas abertas para este ano" },
    socials: [
      { platform: "instagram", handle: "@djkaioreis", url: "https://instagram.com/djkaioreis" },
      { platform: "spotify", handle: "Kaio Reis", url: "https://open.spotify.com/" },
      { platform: "youtube", handle: "@djkaioreis", url: "https://www.youtube.com/@djkaioreis" },
    ],
    featured: {
      title: "Set ao vivo no último festival",
      platform: "youtube",
      url: "https://www.youtube.com/@djkaioreis",
      kind: "video",
      image: { src: unsplash("1493225457124-a3eb161ffa5f"), alt: "Artista no palco com fumaça e luzes de show", focal: "50% 40%" },
    },
    whatsapp: {
      number: "5585900000000",
      display: "+55 85 90000-0000",
      message: "Fala, Kaio! Vim pelo seu cartão e quero um orçamento para o meu evento.",
    },
    email: { address: "contato@example.com", subject: "Orçamento para evento" },
    partnership: {
      title: "Leve a pista para o seu evento.",
      text: "Mande a data, a cidade e o tipo de festa. Respondo com o orçamento e a disponibilidade.",
      formats: ["Casamento", "Aniversário", "Corporativo", "Formatura"],
    },
    now: {
      title: "Estilos",
      text: "O repertório é montado com você antes da festa.",
      interests: ["House", "Pop", "Funk", "Anos 80 e 90", "Sertanejo"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "DJ Kaio Reis | DJ para eventos em Fortaleza",
      description: "DJ para casamentos, festas e eventos. Som e luz inclusos. Orçamento pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Estilos", brands: "Eventos e marcas" },
  },
};
