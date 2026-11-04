# Deploy — Proffy 2.0 em produção (Render + Clever Cloud MySQL)

Desenvolvimento local continua em **SQLite**. Em produção o backend usa **MySQL**.

## Estrutura esperada do repositório

```
Proffy_Plataforma_Educacional/
├── render.yaml          ← Blueprint do Render (TEM que ficar na raiz)
├── .gitignore
├── README.md
├── legacy/              ← versão original NLW (HTML/CSS/JS)
└── Proffy2.0/
    ├── backend/         ← API Fastify + Prisma
    └── frontend/        ← React + Vite
```

## 1. Banco — Clever Cloud MySQL

1. Crie um add-on MySQL e copie a *connection string*
   (`mysql://usuario:senha@host:3306/banco`).
2. Ela será a variável `DATABASE_URL` do backend. Não é preciso criar tabelas
   à mão: o build roda `prisma migrate deploy` e aplica `prisma/migrations-mysql/`.

## 2. Publicar com o Blueprint (recomendado)

1. No Render: **New → Blueprint** e escolha este repositório.
2. Ele lê o `render.yaml` da raiz e cria `proffy-backend` e `proffy-frontend`.
3. Preencha as variáveis pedidas:
   - backend: `DATABASE_URL` e `CORS_ORIGIN` (URL do frontend, sem `/` no final)
   - frontend: `VITE_API_URL` = `https://SEU-BACKEND.onrender.com/api/v1`
4. Depois do primeiro deploy, confira `https://SEU-BACKEND.onrender.com/api/v1/health` → `{"status":"ok"}`.

> `VITE_API_URL` é embutida **na hora do build** do frontend. Se mudar, faça
> *Manual Deploy → Clear build cache & deploy*.

## 2b. Configuração manual (sem Blueprint)

Backend (Web Service):
- **Root Directory**: `Proffy2.0/backend`
- **Build Command**: `npm install && npm run build:production && npm run db:migrate:deploy:mysql`
- **Start Command**: `npm run start:production`
- **Health Check Path**: `/api/v1/health`
- Variáveis: `DATABASE_URL`, `DATABASE_PROVIDER=mysql`, `CORS_ORIGIN`, `NODE_ENV=production`, `NODE_VERSION=22.22.2`

Frontend (Static Site):
- **Root Directory**: `Proffy2.0/frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite**: `/*` → `/index.html` (senão atualizar a página em `/dashboard` dá 404)
- Variável: `VITE_API_URL`

## Problemas conhecidos (e por quê)

| Sintoma no build | Causa | Solução |
|---|---|---|
| `Cannot find name 'process'` / `install @types/node` | O Render usa `NODE_ENV=production` e não instala `devDependencies` | `typescript` e `@types/node` ficam em `dependencies` |
| `Cannot find module '../generated/prisma/client'` | O código importa tipos do client SQLite, mas o build só gerava o MySQL | `build:production` gera os dois (`db:generate` + `db:generate:mysql`) |
| Erros em `src/tests/*` no build | Testes eram compilados junto | `tsconfig.build.json` exclui `src/tests` |
| Tabelas não existem no MySQL | Build sem `db:migrate:deploy:mysql` | Incluir no Build Command |

## Plano gratuito

O serviço gratuito do Render “dorme” após alguns minutos sem uso; a primeira
requisição pode levar ~50 s para acordar.
