import nodemailer from "nodemailer";

// Envio: SMTP (ex.: Gmail) se SMTP_HOST existir, senão Resend se RESEND_API_KEY existir,
// senão (dev) só mostra no console para testar o fluxo sem enviar nada.
let smtp;
const smtpTransport = () =>
  (smtp ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465, // 465 = TLS direto; 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));

const from = () => process.env.MAIL_FROM || (process.env.SMTP_USER ? `VorenMe <${process.env.SMTP_USER}>` : "VorenMe <nao-responda@vorenme.com>");

export const sendMail = async ({ to, subject, html, text }) => {
  if (process.env.SMTP_HOST) {
    await smtpTransport().sendMail({ from: from(), to, subject, html, text });
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    console.log(`[mail dev] para ${to}: ${subject}\n${text ?? html}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: from(), to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
};

const ACCENT = "#6A45F5";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * Layout único dos e-mails: tabela + estilos inline (Gmail/Outlook ignoram <style> e flexbox).
 * `lines` são parágrafos em texto puro (escapados aqui). Devolve { html, text }.
 */
export const layout = ({ preview, title, lines, cta, footnote }) => {
  const front = process.env.FRONT_URL || "http://localhost:5173";
  const p = (t) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2c2c2e">${esc(t)}</p>`;
  // Fundo branco do começo ao fim (sem caixa cinza) e "light only" para o modo escuro do Gmail/Apple Mail não inverter.
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(title)}</title>
<style>:root{color-scheme:light only;supported-color-schemes:light only}</style></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preview ?? title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff"><tr><td align="center" style="padding:40px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 0 32px;font-size:18px;font-weight:700;letter-spacing:-0.01em;color:${ACCENT}">VorenMe</td></tr>
<tr><td>
<h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:700;color:#111113;letter-spacing:-0.02em">${esc(title)}</h1>
${lines.map(p).join("\n")}
${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td bgcolor="${ACCENT}" style="border-radius:999px;background:${ACCENT}">
<a href="${esc(cta.url)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${esc(cta.label)}</a></td></tr></table>
<p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6e6e73">Se o botão não abrir, copie este link: <a href="${esc(cta.url)}" style="color:${ACCENT};word-break:break-all">${esc(cta.url)}</a></p>` : ""}
${footnote ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.55;color:#6e6e73">${esc(footnote)}</p>` : ""}
</td></tr>
<tr><td style="padding:40px 0 0"><div style="border-top:1px solid #e5e5ea;font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td style="padding:20px 0 0;font-size:12px;line-height:1.6;color:#8e8e93">Você recebe este e-mail porque tem uma conta no VorenMe.<br><a href="${esc(front)}/painel" style="color:#6e6e73;text-decoration:underline">Abrir o painel</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = [title, "", ...lines, ...(cta ? ["", `${cta.label}: ${cta.url}`] : []), ...(footnote ? ["", footnote] : []), "", "VorenMe"].join("\n");
  return { html, text };
};
