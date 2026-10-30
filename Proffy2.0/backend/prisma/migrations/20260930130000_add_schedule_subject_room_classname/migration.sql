-- AlterTable: Schedule ganha subjectId (obrigatorio), room e className (opcionais)
-- para alimentar a grade semanal (AdminSchedules) com dados reais.

-- Cria uma disciplina de fallback para linhas existentes, se houver.
INSERT INTO "Subject" ("id", "name", "createdAt")
SELECT 'subject_fallback_migration', 'A definir', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Schedule")
  AND NOT EXISTS (SELECT 1 FROM "Subject" WHERE "id" = 'subject_fallback_migration');

ALTER TABLE "Schedule" ADD COLUMN "subjectId" TEXT NOT NULL DEFAULT 'subject_fallback_migration';
ALTER TABLE "Schedule" ADD COLUMN "room" TEXT;
ALTER TABLE "Schedule" ADD COLUMN "className" TEXT;
