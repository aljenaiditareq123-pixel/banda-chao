-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'FOUNDER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
