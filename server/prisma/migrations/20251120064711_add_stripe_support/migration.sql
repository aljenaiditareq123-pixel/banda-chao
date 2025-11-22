-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PAID';
ALTER TYPE "OrderStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "stripe_id" TEXT,
ALTER COLUMN "shipping_address" DROP NOT NULL,
ALTER COLUMN "shipping_city" DROP NOT NULL,
ALTER COLUMN "shipping_country" DROP NOT NULL,
ALTER COLUMN "shipping_name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "orders_stripe_id_idx" ON "orders"("stripe_id");
