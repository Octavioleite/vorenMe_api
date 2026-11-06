import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.route.js";

const app = express();

// Atrás de proxy (nginx, Railway, Render...): TRUST_PROXY=1 para o rate limit ver o IP real.
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));

// Sem FRONT_URL = sem CORS: no dev o vorenMe_app fala com a API pelo proxy do Vite.
app.use(cors({ origin: process.env.FRONT_URL || false }));
app.use(express.json({ limit: "200kb" }));

app.use(routes);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "server is alive" });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}/api/v1`);
});
