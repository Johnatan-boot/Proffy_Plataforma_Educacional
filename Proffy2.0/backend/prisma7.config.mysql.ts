// Config de produção: aponta para o schema MySQL em vez do SQLite usado em dev.
// Uso: npx prisma migrate deploy --config prisma7.config.mysql.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.mysql.prisma",
  migrations: {
    path: "prisma/migrations-mysql",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
