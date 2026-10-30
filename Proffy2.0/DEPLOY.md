# Deploy — Proffy 2.0 em Produção

Este guia assume que você já tem (ou vai criar agora) contas no
[Render](https://render.com) e na [Clever Cloud](https://www.clever-cloud.com).
Desenvolvimento continua em SQLite, como pedido — nada disso muda o ambiente local.

## 1. Banco de dados — Clever Cloud MySQL

1. Crie um add-on MySQL na Clever Cloud (plano gratuito serve pra começar).
2. No painel do add-on, copie a **connection string** (formato
   `mysql://usuario:senha@host:porta/nome_do_banco`).
3. Guarde essa URL — ela vai virar a variável `DATABASE_URL` do backend em produção.

Não é preciso rodar nada manualmente no banco: o `render.yaml` do backend já
roda `prisma migrate deploy` automaticamente a cada build, usando a migration
consolidada em `backend/prisma/migrations-mysql/`.

## 2. Backend — Render

1. No Render, crie um **Web Service** apontando para este repositório.
2. Se o Render detectar o `backend/render.yaml`, ele já preenche build/start
   command sozinho. Se não detectar automaticamente, configure manualmente:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build:production && npm run db:migrate:deploy:mysql`
   - **Start Command**: `npm run start:production`
3. Configure as variáveis de ambiente (painel do Render → Environment):
   - `DATABASE_URL` → a connection string da Clever Cloud (passo 1)
   - `DATABASE_PROVIDER` → `mysql`
   - `CORS_ORIGIN` → a URL do frontend (você vai ter isso depois do passo 3;
     pode voltar aqui e atualizar)
4. Deploy. Ao final, você terá uma URL tipo `https://proffy-backend.onrender.com`.
5. Teste: `curl https://proffy-backend.onrender.com/api/v1/health` deve
   responder `{"status":"ok"}`.

## 3. Frontend — Render (Static Site) ou Vercel/Netlify

Qualquer hospedagem de site estático serve (o build gera arquivos puros em
`frontend/dist`). Passo a passo pro Render:

1. Crie um **Static Site** apontando para este repositório.
2. Configuração (o `frontend/render.yaml` já traz isso pronto):
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Variável de ambiente: `VITE_API_URL` → `https://proffy-backend.onrender.com/api/v1`
   (a URL do backend que você publicou no passo 2)
4. Deploy. Você terá uma URL tipo `https://proffy-frontend.onrender.com`.

## 4. Fechar o CORS

Volte nas variáveis de ambiente do **backend** no Render e atualize
`CORS_ORIGIN` para a URL real do frontend (passo 3). Sem isso, o navegador
vai bloquear as chamadas da API por CORS.

## 5. Checklist final

- [ ] `GET /api/v1/health` no backend responde `200 OK`
- [ ] Frontend carrega e a tela de Login aparece
- [ ] Cadastro de um usuário teste funciona (cria no MySQL de produção)
- [ ] Login com esse usuário funciona
- [ ] `CORS_ORIGIN` do backend aponta pro domínio real do frontend

## Rodando as migrations do MySQL manualmente (se precisar)

Normalmente não é necessário — o build do Render já roda isso. Mas se quiser
rodar manualmente (ex.: debugar), com `DATABASE_URL` apontando pro MySQL:

```bash
cd backend
npm install
DATABASE_URL="mysql://..." npm run db:migrate:deploy:mysql
```

## Arquivos relevantes

- `backend/prisma/schema.mysql.prisma` — schema do Prisma pra produção (MySQL)
- `backend/prisma/migrations-mysql/` — migration consolidada pra um banco MySQL novo
- `backend/prisma7.config.mysql.ts` — config do Prisma apontando pro schema MySQL
- `backend/src/lib/prisma.ts` — escolhe SQLite (dev, padrão) ou MySQL
  (`DATABASE_PROVIDER=mysql`) sem precisar trocar código
- `backend/render.yaml`, `frontend/render.yaml` — configuração de deploy
- `backend/.env.production.example`, `frontend/.env.production.example` —
  modelo das variáveis de ambiente de produção
