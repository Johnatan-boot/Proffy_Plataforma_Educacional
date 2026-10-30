# Decisão 003 — MySQL em produção

## Contexto

O Proffy 2.0 será desenvolvido localmente utilizando SQLite, mas precisa estar preparado para um ambiente de produção com um banco relacional mais adequado para uma aplicação hospedada.

## Decisão

Utilizar MySQL como banco de dados de produção.

O banco será hospedado na Clever Cloud.

O acesso ao banco será realizado através do Prisma, mantendo a camada de persistência separada da lógica de negócio.

## Ambiente

```text
Render
   ↓
Fastify
   ↓
Prisma
   ↓
MySQL
   ↓
Clever Cloud