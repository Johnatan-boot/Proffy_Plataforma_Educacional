-- AlterTable: campos de perfil usados pelo frontend (avatar e WhatsApp)
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsapp" TEXT;

-- O novo valor ADMIN do enum UserRole não exige alteração no SQLite
-- (enums são armazenados como TEXT). No MySQL ele entra no schema MySQL dedicado.
