/*
  Warnings:

  - You are about to drop the `Maker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Maker";

-- CreateTable
CREATE TABLE "makers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "story" TEXT,
    "profile_picture_url" TEXT,
    "cover_picture_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "makers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "makers_user_id_key" ON "makers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "makers_slug_key" ON "makers"("slug");

-- CreateIndex
CREATE INDEX "makers_user_id_idx" ON "makers"("user_id");

-- AddForeignKey
ALTER TABLE "makers" ADD CONSTRAINT "makers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
