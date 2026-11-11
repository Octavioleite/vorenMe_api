import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "maquiadora",
  name: "Maquiadora",
  category: "Beleza",
  config: {
    name: { first: "Bianca", last: "Lopes" },
    username: "biancalopes.make",
    photo: {
      src: unsplash("1487412947147-5cebf100ffc2"),
      alt: "Mulher com maquiagem marcada nos olhos passando batom",
      focal: "50% 35%",
    },
    bio: "Maquiagem para noivas, madrinhas e eventos. Pele que dura a festa inteira e fica bonita na foto.",
    niche: "Maquiadora profissional",
    location: "Recife",
    accent: "#C2557A",
    theme: "dark",
    style: "glam",
    availability: { open: true, label: "Datas abertas para o próximo semestre" },
    socials: [
      { platform: "instagram", handle: "@biancalopes.make", url: "https://instagram.com/biancalopes.make" },
      { platform: "tiktok", handle: "@biancalopes.make", url: "https://www.tiktok.com/@biancalopes.make" },
    ],
    featured: {
      title: "Noivas da temporada",
      platform: "instagram",
      url: "https://instagram.com/biancalopes.make",
      kind: "post",
      image: { src: unsplash("1519741497674-611481863552"), alt: "Buquê de flores nas mãos de uma noiva", focal: "50% 50%" },
    },
    whatsapp: {
      number: "5581900000000",
      display: "+55 81 90000-0000",
      message: "Oi, Bianca! Vim pelo seu cartão e quero ver disponibilidade para a minha data.",
    },
    email: { address: "contato@example.com", subject: "Orçamento de maquiagem" },
    partnership: {
      title: "Reserve sua data.",
      text: "Me conte a data, o local e quantas pessoas. Mando o orçamento e marco o teste de maquiagem.",
      formats: ["Noivas", "Madrinhas", "Formatura", "Atendimento a domicílio"],
    },
    now: {
      title: "Pacotes",
      text: "Todos os pacotes de noiva incluem teste de maquiagem e kit de retoque.",
      interests: ["Noiva", "Pele natural", "Make para foto", "Penteado"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Bianca Lopes | Maquiadora em Recife",
      description: "Maquiagem para noivas, madrinhas e eventos. Reserve sua data pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, featured: "Portfólio", now: "Pacotes", brands: "Marcas que uso" },
  },
};
