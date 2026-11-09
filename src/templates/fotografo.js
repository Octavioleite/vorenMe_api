import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "fotografo",
  name: "Fotógrafo",
  category: "Arte & estilo",
  config: {
    name: { first: "Rafa", last: "Lima Foto" },
    username: "rafalimafoto",
    photo: {
      src: unsplash("1516035069371-29a1b244cc32"),
      alt: "Câmera fotográfica e lentes sobre fundo escuro",
      focal: "50% 45%",
    },
    bio: "Casamentos, ensaios e eventos fotografados com naturalidade. Fotos que contam o dia como ele foi.",
    niche: "Fotógrafo",
    location: "Belo Horizonte",
    accent: "#E4572E",
    theme: "dark",
    style: "tinta",
    availability: { open: true, label: "Datas abertas para 2026" },
    socials: [
      { platform: "instagram", label: "Portfólio", handle: "@rafalimafoto", url: "https://instagram.com/rafalimafoto" },
      { platform: "pinterest", label: "Referências", handle: "rafalimafoto", url: "https://pinterest.com/rafalimafoto" },
    ],
    whatsapp: {
      number: "5531900000000",
      display: "+55 31 90000-0000",
      message: "Olá, Rafa! Vim pelo cartão digital e quero um orçamento de fotos.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Reserve sua data.",
      text: "Conte o tipo de evento, a data e o local. Envio pacotes e disponibilidade em até 24h.",
      formats: ["Casamento", "Ensaio", "Eventos", "Corporativo"],
    },
    now: {
      title: "Trabalhos",
      text: "Galeria online entregue em até 30 dias.",
      interests: ["Pré-wedding", "Gestante", "Família", "Retrato"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Rafa Lima Foto | Fotógrafo",
      description: "Fotógrafo em Belo Horizonte: casamentos, ensaios e eventos.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Trabalhos", brands: "Parceiros" },
  },
};
