import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

// Em desenvolvimento continua usando SQLite (comportamento padrão, sem mudanças,
// com tipagem estática completa do Prisma Client).
// Em produção (DATABASE_PROVIDER=mysql), carrega dinamicamente o client MySQL
// gerado a partir de prisma/schema.mysql.prisma (require, não import, porque
// esse client só existe depois de `prisma generate --config prisma7.config.mysql.ts`
// — não é gerado em dev). Os dois clients são estruturalmente idênticos, pois
// vêm do mesmo conjunto de models, então o cast é seguro.
const provider = process.env.DATABASE_PROVIDER || "sqlite";

export const prisma: PrismaClient =
  provider === "mysql" ? createMysqlClient() : createSqliteClient();

function createSqliteClient(): PrismaClient {
  // O adapter do SQLite espera um caminho de arquivo puro, não uma connection
  // string com o prefixo "file:" usado pelo Prisma (ex.: DATABASE_URL="file:./dev.db").
  const rawUrl = process.env.DATABASE_URL || "./dev.db";
  const sqlitePath = rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl;

  const adapter = new PrismaBetterSqlite3({
    url: sqlitePath,
  });

  return new PrismaClient({ adapter });
}

function createMysqlClient(): PrismaClient {
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  const {
    PrismaClient: MysqlPrismaClient,
  } = require("../generated/prisma-mysql/client");

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required when DATABASE_PROVIDER=mysql",
    );
  }

  const adapter = new PrismaMariaDb({
    uri: process.env.DATABASE_URL,
  });

  return new MysqlPrismaClient({ adapter }) as unknown as PrismaClient;
}
