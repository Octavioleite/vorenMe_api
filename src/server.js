import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.route.js";
import { startReminders } from "./service/reminder.service.js";

const app = express();

// Atrás de proxy: o rate limit precisa ver o IP real. TRUST_PROXY = nº de proxies (ex.: 1) ou faixas
// confiáveis do Express (ex.: "loopback,linklocal,uniquelocal" = qualquer IP de rede interna/Docker),
// que serve quando a API recebe chamadas por caminhos com nº de proxies diferente.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) app.set("trust proxy", /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);

// Sem FRONT_URL = sem CORS: no dev o vorenMe_app fala com a API pelo proxy do Vite.
app.use(cors({ origin: process.env.FRONT_URL || false }));
app.use(express.json({ limit: "200kb" }));

// Cabeçalhos de segurança. frame-ancestors 'self': o painel mostra o cartão num iframe do próprio site,
// mas outro site não consegue embutir (clickjacking nos botões de Pix/WhatsApp).
// ponytail: sem CSP de script-src; o index.html do app tem script inline. Adicionar com nonce se precisar.
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Content-Security-Policy": "frame-ancestors 'self'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  next();
});

app.use(routes);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "server is alive" });
});

const PORT = process.env.PORT || 8081;

// Em produção (FRONT_URL definido) quase sempre há proxy na frente: sem TRUST_PROXY o rate limit
// vê o IP do proxy e um único atacante bloqueia o login de todo mundo.
if (process.env.FRONT_URL && !process.env.TRUST_PROXY) console.warn("[aviso] TRUST_PROXY vazio: atrás de proxy, defina TRUST_PROXY=1 no .env");

app.listen(PORT, () => {
  startReminders();
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}/api/v1`);
});
