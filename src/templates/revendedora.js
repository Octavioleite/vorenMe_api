import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "revendedora",
  name: "Revendedora de cosméticos",
  category: "Comércio",
  config: {
    name: { first: "Carla", last: "Menezes" },
    username: "carlamenezes.beleza",
    photo: {
      src: unsplash("1596462502278-27bfdc403348"),
      alt: "Pincéis de maquiagem, batom e pó sobre fundo bege",
      focal: "50% 45%",
    },
    bio: "Perfumes, maquiagem e cuidados com a pele com preço de revista. Entrego na sua casa ou no trabalho.",
    niche: "Consultora de beleza",
    location: "Salvador",
    accent: "#B5838D",
    theme: "light",
    style: "glam",
    availability: { open: true, label: "Pedidos todos os dias pelo WhatsApp" },
    socials: [
      { platform: "instagram", handle: "@carlamenezes.beleza", url: "https://instagram.com/carlamenezes.beleza" },
      { platform: "website", label: "Minha loja online", handle: "Loja online", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5571900000000",
      display: "+55 71 90000-0000",
      message: "Oi, Carla! Vim pelo seu cartão e quero ver os produtos da revista.",
    },
    email: { address: "contato@example.com", subject: "Pedido pelo cartão digital" },
    partnership: {
      title: "Monte seu pedido.",
      text: "Me diga o que procura que eu mando as opções e as promoções do ciclo. Parcelo e entrego.",
      formats: ["Perfumes", "Maquiagem", "Skincare", "Presentes"],
    },
    now: {
      title: "Promoções do ciclo",
      text: "Kits de presente e lançamentos com desconto até o fim do ciclo. Peça a revista digital.",
      url: "https://example.com",
      interests: ["Kits de presente", "Lançamentos", "Refil", "Masculino"],
    },
    pix: { key: "pix@example.com", name: "Carla Menezes", city: "Salvador" },
    coupons: [{ brand: "Loja online", code: "CARLA15", discount: "15% OFF", url: "https://example.com" }],
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Carla Menezes | Consultora de beleza",
      description: "Perfumes, maquiagem e skincare com entrega em Salvador. Peça pelo WhatsApp.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Promoções do ciclo", brands: "Marcas que revendo" },
  },
};
