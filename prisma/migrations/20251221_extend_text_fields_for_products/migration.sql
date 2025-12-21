-- AlterTable: Extend text fields in products table to support long URLs and descriptions
-- This migration changes VARCHAR fields to TEXT type to accommodate long Amazon URLs and descriptions

-- Change description fields to TEXT
ALTER TABLE "products" ALTER COLUMN "description" TYPE TEXT;
ALTER TABLE "products" ALTER COLUMN "description_ar" TYPE TEXT;
ALTER TABLE "products" ALTER COLUMN "description_zh" TYPE TEXT;

-- Change URL fields to TEXT (to support long Amazon URLs, etc.)
ALTER TABLE "products" ALTER COLUMN "image_url" TYPE TEXT;
ALTER TABLE "products" ALTER COLUMN "external_link" TYPE TEXT;
ALTER TABLE "products" ALTER COLUMN "video_url" TYPE TEXT;
