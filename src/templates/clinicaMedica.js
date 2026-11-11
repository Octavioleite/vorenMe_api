import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "clinica-medica",
  name: "Médicos e saúde",
  category: "Saúde",
  config: {
    name: { first: "Dra. Marina", last: "Alves" },
    username: "dramarinaalves",
    photo: {
      src: unsplash("1559839734-2b71ea197ec2"),
      alt: "Dra. Marina Alves de jaleco no consultório",
      focal: "50% 25%",
    },
    bio: "Atendimento próximo e sem pressa, com foco em prevenção e acompanhamento de longo prazo.",
    niche: "Sua especialidade · CRM/CRO/CRP 000000",
    location: "São Paulo",
    accent: "#2A7A8C",
    theme: "light",
    style: "clinica",
    availability: { open: true, label: "Agenda aberta para novos pacientes" },
    socials: [
      { platform: "instagram", handle: "@dramarinaalves", url: "https://instagram.com/dramarinaalves" },
      { platform: "website", label: "Site do consultório", handle: "consultorio.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Olá! Vim pelo cartão digital e gostaria de agendar uma consulta.",
    },
    email: { address: "contato@example.com", subject: "Agendamento de consulta" },
    partnership: {
      title: "Agende sua consulta.",
      text: "Atendimento presencial e online. Fale pelo WhatsApp para ver os horários disponíveis.",
      formats: ["Presencial", "Online", "Retorno"],
    },
    now: {
      title: "Especialidades",
      text: "Troque pelas áreas que você atende: médico, dentista, fisioterapeuta, psicólogo e outros.",
      interests: ["Consultas", "Prevenção", "Acompanhamento", "Avaliação"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Dra. Marina Alves | Profissional de saúde",
      description: "Atendimento em saúde em São Paulo. Agende sua consulta presencial ou online.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Especialidades", brands: "Convênios" },
  },
};
