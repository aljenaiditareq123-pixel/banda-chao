-- AlterTable
-- Add platformFee and makerRevenue columns to orders table
-- Platform commission: 5% deducted from seller
-- Seller receives 95% after commission

ALTER TABLE "orders" ADD COLUMN "platformFee" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN "makerRevenue" DOUBLE PRECISION;

-- Add comments for documentation
COMMENT ON COLUMN "orders"."platformFee" IS 'Platform commission (5% deducted from seller)';
COMMENT ON COLUMN "orders"."makerRevenue" IS 'Revenue to seller after commission deduction (95%)';
