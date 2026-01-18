-- CreateTable
-- Create payout_requests table for maker payout requests

CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "admin_notes" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payout_requests_user_id_idx" ON "payout_requests"("user_id");

-- CreateIndex
CREATE INDEX "payout_requests_status_idx" ON "payout_requests"("status");

-- CreateIndex
CREATE INDEX "payout_requests_created_at_idx" ON "payout_requests"("created_at");

-- AddForeignKey
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE "payout_requests" IS 'Maker payout requests - طلبات سحب الأرباح للتجار';
COMMENT ON COLUMN "payout_requests"."status" IS 'PENDING, APPROVED, REJECTED, COMPLETED';
