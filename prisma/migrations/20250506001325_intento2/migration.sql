/*
  Warnings:

  - The primary key for the `companies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customer_number` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `companies` table. All the data in the column will be lost.
  - The `id` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `datetime` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `lead_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `outcome_note` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `person_name` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `events` table. All the data in the column will be lost.
  - The `id` column on the `events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `leads` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `age` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_user` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `company_id_int` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `date_added` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `next_step` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `leads` table. All the data in the column will be lost.
  - The `id` column on the `leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type` on the `templates` table. All the data in the column will be lost.
  - The `id` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `contact_log` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sector` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `events` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `company_id` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `event_id` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `company_id` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `company_id` on the `templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unique_code` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `company_id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "contact_log" DROP CONSTRAINT "contact_log_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_company_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_company_id_fkey";

-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_company_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_fkey";

-- AlterTable
ALTER TABLE "companies" DROP CONSTRAINT "companies_pkey",
DROP COLUMN "customer_number",
DROP COLUMN "phone",
DROP COLUMN "type",
ADD COLUMN     "employee_numbers" DOUBLE PRECISION,
ADD COLUMN     "ruc" DOUBLE PRECISION,
ADD COLUMN     "sector" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "events" DROP CONSTRAINT "events_pkey",
DROP COLUMN "datetime",
DROP COLUMN "lead_id",
DROP COLUMN "outcome_note",
DROP COLUMN "person_name",
DROP COLUMN "role",
DROP COLUMN "title",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "company_id",
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "leads" DROP CONSTRAINT "leads_pkey",
DROP COLUMN "age",
DROP COLUMN "assigned_user",
DROP COLUMN "company_id_int",
DROP COLUMN "created_at",
DROP COLUMN "date_added",
DROP COLUMN "description",
DROP COLUMN "next_step",
DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "event_id" INTEGER NOT NULL,
ADD COLUMN     "job_role" TEXT,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "work_area" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "company_id",
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "templates" DROP CONSTRAINT "templates_pkey",
DROP COLUMN "type",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "company_id",
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "password",
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "unique_code" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "company_id",
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "contact_log";

-- CreateTable
CREATE TABLE "ContactLog" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "update_contacts" TIMESTAMP(3) NOT NULL,
    "statusventa" TEXT NOT NULL,

    CONSTRAINT "ContactLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
