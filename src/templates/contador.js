import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "contador",
  name: "Contador",
  category: "Serviços profissionais",
  config: {
    name: { first: "Paulo", last: "Nogueira" },
    username: "paulonogueira.contabil",
    photo: {
      src: unsplash("1460925895917-afdab827c52f"),
      alt: "Notebook aberto com gráficos financeiros na tela",
      focal: "50% 40%",
    },
    bio: "Contabilidade para MEI, pequenas empresas e profissionais liberais. Abertura de empresa, impostos e folha sem dor de cabeça.",
    niche: "Contador · CRC 1SP000000",
    location: "São Paulo",
    accent: "#3B5BDB",
    theme: "light",
    style: "sobrio",
    availability: { open: true, label: "Atendimento online em todo o Brasil" },
    socials: [
      { platform: "instagram", handle: "@paulonogueira.contabil", url: "https://instagram.com/paulonogueira.contabil" },
      { platform: "website", label: "Site do escritório", handle: "nogueiracontabil.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Olá, Paulo! Vim pelo seu cartão e quero falar sobre a contabilidade da minha empresa.",
    },
    email: { address: "contato@example.com", subject: "Contabilidade da minha empresa" },
    partnership: {
      title: "Fale com um contador.",
      text: "Conte o tamanho da sua empresa e o que precisa. Em um dia útil você recebe uma proposta com valor fixo mensal.",
      formats: ["Abertura de empresa", "MEI", "Simples Nacional", "Imposto de Renda"],
    },
    now: {
      title: "Serviços",
      text: "Do MEI que quer crescer à empresa que precisa organizar a casa.",
      interests: ["Folha de pagamento", "Planejamento tributário", "Troca de contador", "Pró-labore"],
    },
    brands: [],
    website: { label: "nogueiracontabil.com.br", url: "https://example.com" },
    footer: baseFooter,
    seo: {
      title: "Paulo Nogueira | Contador",
      description: "Contabilidade para MEI e pequenas empresas. Proposta em um dia útil.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Serviços", brands: "Clientes" },
  },
};
