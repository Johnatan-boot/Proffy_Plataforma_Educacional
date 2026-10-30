# AUDITORIA PROFFY 2.0 — Relatório de Integração

Este documento registra o que foi encontrado na auditoria, o que foi integrado,
e o que continua sendo um gap real e consciente (não escondido).

---

## 1. Estado do backend (antes da integração)

Fastify + TypeScript + Prisma 7 + SQLite, arquitetura Repository/Service/Controller/Routes,
API em `/api/v1`, Zod para validação, erros centralizados. Módulos já existentes:
Users, Teachers, Students, Subjects, TeacherSubject, Availability, Schedules.

Testes antes da auditoria: o `README` afirmava "8 pass, 0 fail", mas rodando de fato
o `npm test` dava **7 pass, 1 fail** — um `dist/lib/prisma-smoke-test.js` órfão,
artefato de um build antigo que veio junto no zip, sem fonte `.ts` correspondente.
Um `rm -rf dist && npm run build` limpo resolveu (não era um bug de código, era lixo de build).

Faltavam, de fato:
- CORS (o front não conseguia chamar a API do navegador)
- Autenticação (login/register não existiam no backend)
- Endpoints de **listagem** (`GET` de todos os registros) de Teachers, Students e Subjects
- Endpoints de agendamentos por professor/aluno

## 2. Estado do frontend (antes da integração)

React + Vite bem estruturado (`pages/`, `components/ui`, `features/*/services`),
mas **cada `features/*/services/index.ts` era mock em memória**, com comentários do
próprio time já deixados no código avisando disso. Login e Register apenas navegavam,
sem chamar nada. `currentUser` era um objeto fixo hardcoded.

## 3. O que foi integrado (ponta a ponta, testado de verdade)

### Backend
- CORS via `@fastify/cors`, controlado por `CORS_ORIGIN` no `.env`
- Módulo `auth` novo: `POST /api/v1/auth/register` e `POST /api/v1/auth/login`,
  hash de senha com `node:crypto.scrypt` (sem dependência nova)
- Migration nova: `User.avatar`, `User.whatsapp`, e `UserRole` ganhou `ADMIN`
  (a tela de Cadastro já oferecia "Diretoria" como opção)
- `GET /api/v1/teachers` e `GET /api/v1/teachers/:id`: agora retornam o professor
  já "achatado" (nome/avatar/whatsapp vêm do `User`, `subject`/`subjectId` vêm do
  join com `TeacherSubject`→`Subject`) — é exatamente o shape que o frontend espera
- `GET /api/v1/students`, `PATCH /api/v1/students/:id`
- `GET /api/v1/subjects` (antes só existia busca por id/nome)
- `GET /api/v1/schedules/teacher/:teacherId` e `/student/:studentId`
- `PATCH /api/v1/teachers/:id` agora also aceita `name`, `avatar`, `whatsapp`, `subjectId`
  (orquestra a atualização entre `User`, `Teacher` e `TeacherSubject`)

### Frontend
- `services/http`: cliente HTTP real (`get/post/patch/delete`), erros JSON tratados
- `features/auth`: `authService` real + sessão salva em `localStorage`
  (sem JWT, como pedido — é só a sessão do usuário logado)
- `Login` e `Register`: formulários controlados, chamando a API de verdade,
  com loading e mensagens de erro
- `AppLayout`: usuário exibido no topo/menu agora vem da sessão real; "Sair" limpa a sessão
- `subjectService`, `studentService`, `teacherService`: trocados de mock para HTTP real,
  **mantendo as mesmas assinaturas** usadas pelas páginas — nenhuma página precisou ser recriada
- `TeacherForm`: a lista de disciplinas era uma lista fixa hardcoded no componente
  (1 a 10, "Artes"..."Química"); agora carrega de `GET /subjects` de verdade
- `TeacherForm`: faltava o campo de e-mail (o backend exige e-mail único por usuário;
  o formulário original não tinha esse campo) — adicionado

### Gap de modelagem resolvido de forma consciente
Criar um professor/aluno pelo painel administrativo não corresponde a nenhum endpoint
único do backend: `POST /teachers` e `POST /students` esperam um `userId` **já existente**
(eles vinculam um perfil a um usuário, não cadastram uma pessoa nova). Criar uma pessoa
nova = criar `User` + perfil juntos, que é exatamente o que `/auth/register` já faz.
Em vez de duplicar essa lógica no backend, o admin-create no frontend reaproveita
`/auth/register` gerando uma senha temporária. Isso não foi inventado: é o mesmo contrato
já usado pela tela de Cadastro.

## 4. Verificação real (não só "a tela abre")

- Backend: **14/14 testes**, `tsc` limpo, servidor rodando de verdade em `localhost:3000`
- Frontend: `tsc --noEmit` limpo, `vite build` limpo, bundle final inspecionado e
  confirmado apontando para `/auth/register`, `/auth/login` e a URL certa da API
- Fluxo de ponta a ponta testado via HTTP real contra o banco SQLite:
  criar disciplina → registrar professor já vinculado à disciplina → listar professores
  (disciplina já resolvida por nome) → registrar usuário "Diretoria" (`ADMIN`, sem perfil extra)
  → login certo (200) e errado (401) → tudo funcionando

## 5. Agendamentos e Disponibilidade — fechados numa segunda rodada

Depois da primeira entrega, `Schedule` ganhou `subjectId` (FK para `Subject`), `room` e
`className` — migration nova aplicada. Um mapper novo converte `Schedule` + relações no
formato exato que a grade semanal (`AdminSchedules`) espera (`weekday`/`from`/`to` derivados
de `scheduledAt`+`duration`, nome da disciplina, nome do professor). `GET /api/v1/schedules`
foi criado para listar a grade completa.

`Availability` já existia no backend (criar/buscar/excluir), só faltava: endpoint de
listagem por professor (`GET /api/v1/availabilities/teacher/:teacherId`) e a conexão com o
`TeacherForm`. Como o backend só tem criar/excluir (sem `PATCH`), "salvar os horários" no
frontend funciona como apagar os horários antigos e recriar os atuais — evita inventar um
endpoint de update que o backend não tinha.

Os dois foram testados de ponta a ponta com o servidor real: criar disciplina → professor →
aula com sala e turma → listar grade (formato validado) e, separadamente, criar disponibilidade
em dois dias da semana → listar disponibilidade do professor (formato validado).

`AdminSchedules` deixou de mostrar o aviso de "dados mockados" — agora é real.

## 6. Edição de disciplina + Dashboard — fechados numa terceira rodada

`PATCH /api/v1/subjects/:id` foi adicionado (antes só existia criar/listar/excluir), com
validação de nome duplicado. A tela `AdminSubjects` ganhou edição inline (clique no lápis,
edita o nome, salva ou cancela). Testado de ponta a ponta com servidor real.

O `Dashboard` já usava `teacherService`/`studentService`/`subjectService` reais desde a
primeira rodada (sem eu ter notado de início) — os cards de Professores, Alunos,
Disciplinas e o painel "Professores Recentes" já eram dados reais da API. O que faltava:
"Aulas Hoje" vinha do mock financeiro; agora é calculado de verdade a partir de
`scheduleService.getAll()`, contando os horários cujo dia da semana bate com hoje.

A seção de **Indicadores Financeiros** (faturamento, custo, margem, gráficos) continua
simulada — e agora **diz isso na tela**, com um selo visível ("Simulação — sem endpoint
financeiro no backend"). Não construí esse domínio porque o backend não modela nada de
faturamento/custo/pagamento: isso seria inventar uma funcionalidade nova, não integrar
uma que já existe. `AdminTimesheet` (ponto eletrônico) continua no mesmo caso.

## 7. O que ainda não foi integrado — gap real, não escondido

`AdminTimesheet` e a seção financeira do `Dashboard` continuam simulados pelo motivo
explicado acima. Não há mais nenhum domínio do backend (Users, Teachers, Students,
Subjects, TeacherSubject, Availability, Schedules, Auth) sem endpoint de listagem,
criação, edição e exclusão onde fazia sentido ter.

## 8. Produção — Render + Clever Cloud MySQL

Tudo preparado para deploy, sem trocar o banco de dev (continua SQLite por padrão):

- `backend/prisma/schema.mysql.prisma` + migration consolidada em
  `backend/prisma/migrations-mysql/` pronta pra um MySQL novo
- `backend/src/lib/prisma.ts` escolhe o client certo via `DATABASE_PROVIDER`
  (SQLite é o padrão se a variável não existir — zero mudança pro ambiente local)
- `render.yaml` no backend e no frontend, `.env.production.example` nos dois
- Passo a passo completo em **`DEPLOY.md`** na raiz do projeto — contas necessárias,
  ordem dos passos, variáveis de ambiente, checklist final

Validado nesta rodada: os dois Prisma Clients (SQLite e MySQL) geram e compilam juntos
sem conflito; o servidor em modo dev padrão continua funcionando exatamente como antes.
**Não validado** (não há como, fora deste ambiente): a conexão real com um MySQL da
Clever Cloud e o deploy de fato no Render — isso depende de contas e credenciais que
só você tem.

## 8.1. Dois bugs reais encontrados rodando no Windows (corrigidos)

Testar só no meu ambiente (Linux, containerizado) não pegou dois problemas que
apareceram no primeiro teste real em máquina de desenvolvedor (Windows):

1. **`.env` nunca era carregado em tempo de execução.** `src/server.ts` não importava
   `dotenv/config` — só o Prisma CLI lia o `.env` (via `prisma7.config.ts`). Na prática,
   `CORS_ORIGIN` (e qualquer outra variável) sempre usava o valor padrão fixo no código,
   ignorando o que estivesse no `.env`. Corrigido com `import "dotenv/config"` como
   primeira linha de `src/server.ts`. Validado de verdade: troquei o `.env` pra um valor
   diferente, reiniciei o servidor, e confirmei por `curl` que o novo valor passou a valer
   (e o antigo parou de funcionar).
2. **Conflito de porta entre frontend e backend.** O script `dev` do frontend forçava
   `--port=3000`, a mesma porta do backend — o Vite detectava a porta ocupada e pulava
   sozinho pra 3001, mas o `CORS_ORIGIN` padrão continuava `http://localhost:3000`,
   quebrando toda chamada à API por CORS. Corrigido: frontend agora sobe fixo em `3001`
   com `--strictPort` (nunca mais pula de porta silenciosamente), e o `.env` padrão do
   backend já vem com `CORS_ORIGIN="http://localhost:3001"` combinando. Validado com os
   dois servidores de pé ao mesmo tempo, sem editar nada manualmente.

## 8.2. Instalação no Windows (Node 22/24) — `better-sqlite3` sem Visual Studio

O `package.json` do backend declarava `better-sqlite3@^13` direto, mas nenhum código usa
esse pacote (só o `@prisma/adapter-better-sqlite3`, que já traz o seu próprio, versão 12).
A 13.0.3 não publica binário pronto para Windows (Node 22 e 24), então o `npm install`
caía em `node-gyp rebuild` e falhava exigindo o Visual Studio com "Desktop development
with C++". A 12.11.1 tem binário pronto para os dois, então foi removida a dependência
direta (e o `@types/better-sqlite3`) e o lock foi regenerado: agora só a 12.11.1 é
instalada, baixando o binário pronto, sem compilar nada.

Dicas para instalar no Windows sem dor de cabeça:
- Mova o projeto para uma pasta curta, sem espaços/parênteses e fora de Downloads/OneDrive
  (ex.: `C:\dev\Proffy2.0`). Pastas como `Proffy2.0_integrado (1)` e o antivírus geram
  os erros `EPERM ... rmdir` do `npm warn cleanup`.
- Se o npm pedir aprovação de scripts de instalação, aprove: `npm install-scripts approve
  prisma better-sqlite3 @prisma/engines esbuild`.
- Depois do `npm install`: `npm run db:generate`, `npm run dev`. O `dev.db` já vem pronto,
  com as 10 disciplinas.

## 9. Código antigo/não usado identificado (não removido)

`package.json` do frontend ainda lista `@google/genai`, `express` e `dotenv` como
dependências — resquício do scaffold original (AI Studio), sem nenhum uso em `src/`.
Não removi para não mexer em nada além do necessário; pode ser removido com segurança
quando quiserem (não há import nenhum desses pacotes no código).

## 10. Como rodar

### Backend
```bash
cd backend
npm install
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
npm run build
npm test
npm run dev   # ou: node dist/server.js
```
Servidor em `http://localhost:3000`, API em `/api/v1`.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # confira VITE_API_URL
npm run dev
```
Interface em `http://localhost:3001` (porta fixa, configurada no `package.json`
pra nunca colidir com o backend, que fica na `3000`).

### Produção
Ver **`DEPLOY.md`** na raiz do projeto — passo a passo completo (Render + Clever
Cloud MySQL), com os comandos `npm run build:production` / `npm run start:production`
e scripts dedicados `db:migrate:deploy:mysql` já prontos no `package.json` do backend.

## 11. Próximos passos sugeridos (em ordem de dependência)

Dos gaps originais, só resta um — todo o resto (Agendamentos, Disponibilidade, edição de
disciplina, preparação de produção) foi fechado ao longo desta auditoria:

1. **Deploy de fato**: seguir o `DEPLOY.md` — criar conta/banco na Clever Cloud, conectar
   o repositório no Render, preencher as variáveis de ambiente. É a única etapa que
   depende de ação sua (contas/credenciais) e não pode ser feita por mim sozinho.
2. `Dashboard`/`AdminTimesheet` (seção financeira e ponto eletrônico): decidir se viram
   endpoints reais de métricas (funcionalidade nova, não integração) ou se as telas são
   simplificadas/removidas
3. Testes automatizados do frontend (hoje só há typecheck + build; backend já tem 14
   testes cobrindo as regras de negócio de agendamento)
