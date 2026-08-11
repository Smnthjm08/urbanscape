/*
  Warnings:

  - You are about to drop the column `resturant` on the `PostDetail` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('active', 'pending', 'sold', 'rented', 'archived');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "PostDetail" DROP COLUMN "resturant",
ADD COLUMN     "restaurant" INTEGER;

-- CreateIndex
CREATE INDEX "Post_city_idx" ON "Post"("city");

-- CreateIndex
CREATE INDEX "Post_type_idx" ON "Post"("type");

-- CreateIndex
CREATE INDEX "Post_property_idx" ON "Post"("property");

-- CreateIndex
CREATE INDEX "Post_price_idx" ON "Post"("price");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
