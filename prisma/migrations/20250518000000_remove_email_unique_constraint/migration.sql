-- DropIndex
DROP INDEX IF EXISTS "leads_email_key";

-- AlterTable
ALTER TABLE "leads" ALTER COLUMN "email" SET DATA TYPE TEXT;
