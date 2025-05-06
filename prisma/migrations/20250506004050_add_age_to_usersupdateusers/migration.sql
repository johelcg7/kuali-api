/*
  Warnings:

  - You are about to drop the column `active_now` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "active_now",
DROP COLUMN "created_at",
DROP COLUMN "updated_at";
