-- AlterTable
ALTER TABLE "users" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN "users"."isVerified" IS 'Blue badge verification status - indicates if the user account is verified';
