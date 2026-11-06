import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "clinica-medica",
  name: "Clínica médica",
  category: "Saúde",
  config: {
    name: { first: "Dra. Marina", last: "Alves" },
    username: "dramarinaalves",
    photo: {
      src: unsplash("1559839734-2b71ea197ec2"),
      alt: "Dra. Marina Alves de jaleco no consultório",
      focal: "50% 25%",
    },
    bio: "Cuidado próximo e sem pressa, com foco em prevenção e acompanhamento de longo prazo.",
    niche: "Clínica geral · CRM-SP 000000",
    location: "São Paulo",
    accent: "#2A7A8C",
    theme: "light",
    availability: { open: true, label: "Agenda aberta para novos pacientes" },
    socials: [
      { platform: "instagram", handle: "@dramarinaalves", url: "https://instagram.com/dramarinaalves" },
      { platform: "website", label: "Site da clínica", handle: "clinica.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5511900000000",
      display: "+55 11 90000-0000",
      message: "Olá! Vim pelo cartão digital e gostaria de agendar uma consulta.",
    },
    email: { address: "contato@example.com", subject: "Agendamento de consulta" },
    partnership: {
      title: "Agende sua consulta.",
      text: "Atendimento presencial e por telemedicina. Fale com a recepção pelo WhatsApp para ver os horários.",
      formats: ["Presencial", "Telemedicina", "Check-up"],
    },
    now: {
      title: "Especialidades",
      text: "Atendimento de adultos e idosos, com foco em prevenção.",
      interests: ["Check-up", "Hipertensão", "Diabetes", "Saúde do idoso"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Dra. Marina Alves | Clínica geral",
      description: "Clínica geral em São Paulo. Agende sua consulta presencial ou por telemedicina.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Especialidades", brands: "Convênios" },
  },
};
