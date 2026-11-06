// Partes comuns a todos os modelos. Cada modelo sobrescreve só o que muda.
export const unsplash = (id) => `https://images.unsplash.com/photo-${id}`;

export const baseLabels = {
  socials: "Redes sociais",
  featured: "Em destaque",
  now: "Agora",
  brands: "Marcas parceiras",
  whatsapp: "WhatsApp",
  email: "E-mail",
  saveContact: "Salvar contato",
  share: "Compartilhar",
  linkCopied: "Link copiado",
  showQr: "Mostrar QR code",
  close: "Fechar",
  qrTitle: "Leve este cartão",
  qrText: "Escaneie com a câmera do celular para abrir esta página.",
  watchOn: "Assistir no",
  openOn: "Abrir no",
  themeToLight: "Mudar para tema claro",
  themeToDark: "Mudar para tema escuro",
  followers: "seguidores",
  copyEmail: "Copiar e-mail",
  copied: "E-mail copiado",
};

export const baseFooter = {
  showVoren: true,
  vorenLabel: "Cartão digital criado com VorenMe",
};
