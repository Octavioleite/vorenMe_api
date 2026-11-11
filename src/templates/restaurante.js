import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "restaurante",
  name: "Restaurante e delivery",
  category: "Alimentação",
  config: {
    name: { first: "Brasa", last: "Burger" },
    username: "brasaburger",
    photo: {
      src: unsplash("1568901346375-23c9450c58cd"),
      alt: "Hambúrguer artesanal com queijo, alface e tomate",
      focal: "50% 55%",
    },
    bio: "Hambúrguer artesanal na brasa, pão de fermentação natural e batata cortada na hora. Salão e delivery.",
    niche: "Hamburgueria artesanal",
    location: "Belo Horizonte",
    accent: "#E8552B",
    theme: "light",
    style: "leve",
    availability: { open: true, label: "Ter a dom, 18h às 23h30" },
    socials: [
      { platform: "instagram", handle: "@brasaburger", url: "https://instagram.com/brasaburger" },
      { platform: "website", label: "Cardápio e pedidos", handle: "brasaburger.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5531900000000",
      display: "+55 31 90000-0000",
      message: "Oi! Vim pelo cartão digital e quero fazer um pedido.",
    },
    email: { address: "contato@example.com", subject: "Contato pelo cartão digital" },
    partnership: {
      title: "Peça agora.",
      text: "Mande seu pedido pelo WhatsApp ou pelo cardápio online. Entregamos em até 40 minutos na região.",
      formats: ["Delivery", "Retirada", "Salão", "Eventos"],
    },
    now: {
      title: "Cardápio",
      text: "Burgers, porções e milkshakes. Opções vegetarianas todos os dias.",
      url: "https://example.com",
      interests: ["Smash", "Clássico", "Vegetariano", "Combos"],
    },
    address: {
      text: "Rua Pium-í, 900 - Cruzeiro, Belo Horizonte - MG",
      hours: [
        { days: "Ter a Qui", time: "18h às 23h" },
        { days: "Sex a Dom", time: "18h às 23h30" },
      ],
    },
    review: { url: "https://g.page/r/exemplo/review" },
    pix: { key: "pix@example.com", name: "Brasa Burger", city: "Belo Horizonte" },
    coupons: [{ brand: "Primeiro pedido", code: "BRASA10", discount: "10% OFF" }],
    brands: [],
    website: { label: "brasaburger.com.br", url: "https://example.com" },
    footer: baseFooter,
    seo: {
      title: "Brasa Burger | Hamburgueria em BH",
      description: "Hambúrguer artesanal na brasa. Peça pelo WhatsApp ou venha ao salão.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Cardápio", brands: "Parceiros" },
  },
};
