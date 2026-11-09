import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "confeitaria",
  name: "Confeitaria",
  category: "Alimentação",
  config: {
    name: { first: "Doce", last: "Ateliê Nina" },
    username: "doceatelienina",
    photo: {
      src: unsplash("1578985545062-69928b1d9587"),
      alt: "Bolo de chocolate decorado com cobertura",
      focal: "50% 55%",
    },
    bio: "Bolos, doces e kits de festa feitos sob encomenda, com receita de família e ingrediente de verdade.",
    niche: "Confeitaria artesanal",
    location: "Curitiba",
    accent: "#C2557A",
    theme: "light",
    style: "leve",
    availability: { open: true, label: "Encomendas com 3 dias de antecedência" },
    socials: [
      { platform: "instagram", handle: "@doceatelienina", url: "https://instagram.com/doceatelienina" },
      { platform: "tiktok", handle: "@doceatelienina", url: "https://www.tiktok.com/doceatelienina" },
    ],
    whatsapp: {
      number: "5541900000000",
      display: "+55 41 90000-0000",
      message: "Oi! Vim pelo cartão digital e quero fazer uma encomenda.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Faça sua encomenda.",
      text: "Diga a data, o número de pessoas e o sabor. Mandamos sugestões e o valor pelo WhatsApp.",
      formats: ["Bolos", "Docinhos", "Kit festa", "Presentes"],
    },
    now: {
      title: "Cardápio",
      text: "Sabores novos todo mês. Retirada ou entrega na cidade.",
      interests: ["Brigadeiro", "Red velvet", "Naked cake", "Sem lactose"],
    },
    coupons: [{ brand: "Primeira encomenda", code: "NINA10", discount: "10% OFF" }],
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Doce Ateliê Nina | Confeitaria",
      description: "Confeitaria artesanal em Curitiba: bolos e doces sob encomenda.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Cardápio", brands: "Parceiros" },
  },
};
