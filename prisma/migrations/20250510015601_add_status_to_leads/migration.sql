/*
  Warnings:

  - You are about to drop the column `created_at` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `companies` table. All the data in the column will be lost.
  - You are about to alter the column `country` on the `companies` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `created_at` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `events` table. All the data in the column will be lost.
  - You are about to alter the column `location` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `name` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `type` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `active` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `employee_numbers` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_google` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_company_id_fkey";

-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_company_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_fkey";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "country" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "employee_numbers" SET NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "location" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'nuevo';

-- AlterTable
ALTER TABLE "templates" DROP COLUMN "active",
DROP COLUMN "company_id",
DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "scheduled",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "company_id",
DROP COLUMN "password_hash",
DROP COLUMN "role",
DROP COLUMN "username",
ADD COLUMN     "email" VARCHAR(100) NOT NULL,
ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ADD COLUMN     "password_google" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "meets" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "recordatorio" TEXT,

    CONSTRAINT "meets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
