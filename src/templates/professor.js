import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "professor",
  name: "Professor particular",
  category: "Educação",
  config: {
    name: { first: "Juliana", last: "Rocha" },
    username: "profjulianarocha",
    photo: {
      src: unsplash("1503676260728-1c00da094a0b"),
      alt: "Livros empilhados com uma maçã e lápis de cor sobre a mesa",
      focal: "50% 50%",
    },
    bio: "Aulas particulares de inglês e reforço escolar, do básico à preparação para provas. Online ou presencial.",
    niche: "Professora de inglês",
    location: "Florianópolis",
    accent: "#6D3BF5",
    theme: "light",
    style: "leve",
    availability: { open: true, label: "Vagas abertas para este mês" },
    socials: [
      { platform: "instagram", handle: "@profjulianarocha", url: "https://instagram.com/profjulianarocha" },
      { platform: "youtube", handle: "@profjulianarocha", url: "https://www.youtube.com/@profjulianarocha" },
    ],
    whatsapp: {
      number: "5548900000000",
      display: "+55 48 90000-0000",
      message: "Oi, Juliana! Vim pelo seu cartão e quero saber sobre as aulas.",
    },
    email: { address: "contato@example.com", subject: "Aulas particulares" },
    partnership: {
      title: "Marque uma aula experimental.",
      text: "Na primeira aula vejo seu nível e o seu objetivo. Depois montamos um plano com horário fixo.",
      formats: ["Online", "Presencial", "Individual", "Em dupla"],
    },
    now: {
      title: "Matérias",
      text: "Turmas para crianças, adolescentes e adultos.",
      interests: ["Inglês para viagem", "Conversação", "Reforço escolar", "ENEM e vestibular", "Inglês para o trabalho"],
    },
    pix: { key: "pix@example.com", name: "Juliana Rocha", city: "Florianopolis" },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Juliana Rocha | Aulas de inglês",
      description: "Aulas particulares de inglês e reforço escolar, online ou presencial.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Matérias", brands: "Escolas parceiras" },
  },
};
