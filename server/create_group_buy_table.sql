-- Create GroupBuy table
CREATE TABLE IF NOT EXISTS "group_buys" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "group_buys_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "group_buys_productId_idx" ON "group_buys"("productId");
CREATE INDEX IF NOT EXISTS "group_buys_status_idx" ON "group_buys"("status");
CREATE INDEX IF NOT EXISTS "group_buys_expiresAt_idx" ON "group_buys"("expiresAt");

-- Add foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'group_buys_productId_fkey'
  ) THEN
    ALTER TABLE "group_buys" 
    ADD CONSTRAINT "group_buys_productId_fkey" 
    FOREIGN KEY ("productId") 
    REFERENCES "products"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

