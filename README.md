# vorenMe_api

API do VorenMe (cartões de visita digitais). Express 5 + Prisma + Postgres.

```bash
cp .env.example .env
docker compose up -d db   # só se não tiver um Postgres rodando (sobe na 5433)
npm install
npm run prisma -- migrate deploy
npm run dev        # http://localhost:8081/api/v1
npm test
```

Camadas: `routes → controller → service → repository`, validação em `dto/`.
O cartão inteiro fica em `Card.config` (JSON no formato `CreatorConfig` do `vorenMe_app`).
Modelos por nicho ficam em `src/templates/`.
