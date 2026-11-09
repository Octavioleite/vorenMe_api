import { baseFooter, baseLabels, unsplash } from "./base.js";

export default {
  id: "odontologia",
  name: "Odontologia",
  category: "Saúde",
  config: {
    name: { first: "Dr. Rafael", last: "Souza" },
    username: "drrafaelsouza",
    photo: {
      src: unsplash("1606811971618-4486d14f3f99"),
      alt: "Consultório odontológico",
      focal: "50% 40%",
    },
    bio: "Odontologia estética e preventiva, com atendimento humanizado do primeiro check-up ao sorriso novo.",
    niche: "Cirurgião-dentista · CRO-SP 00000",
    location: "Campinas",
    accent: "#3B82C4",
    theme: "light",
    style: "clinica",
    availability: { open: true, label: "Horários disponíveis esta semana" },
    socials: [
      { platform: "instagram", handle: "@drrafaelsouza", url: "https://instagram.com/drrafaelsouza" },
      { platform: "website", label: "Site do consultório", handle: "consultorio.com.br", url: "https://example.com" },
    ],
    whatsapp: {
      number: "5519900000000",
      display: "+55 19 90000-0000",
      message: "Olá! Vim pelo cartão digital e gostaria de agendar uma avaliação.",
    },
    email: { address: "contato@example.com", subject: "Agendamento de avaliação" },
    partnership: {
      title: "Agende sua avaliação.",
      text: "Primeira consulta com avaliação completa e plano de tratamento explicado sem pressa.",
      formats: ["Avaliação", "Clareamento", "Lentes", "Implantes"],
    },
    now: {
      title: "Tratamentos",
      text: "Do preventivo ao estético, tudo no mesmo consultório.",
      interests: ["Limpeza", "Ortodontia", "Clareamento", "Implantes"],
    },
    brands: [],
    footer: baseFooter,
    seo: {
      title: "Dr. Rafael Souza | Odontologia",
      description: "Odontologia estética e preventiva em Campinas. Agende sua avaliação.",
      locale: "pt_BR",
    },
    labels: { ...baseLabels, now: "Tratamentos", brands: "Convênios" },
  },
};
