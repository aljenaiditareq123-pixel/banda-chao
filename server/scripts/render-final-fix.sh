#!/bin/bash
# FINAL FIX: Complete database setup with enums
# Run this in Render Shell to fix everything

set -e

cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .

echo "🔄 Final Database Fix - Creating Enums & Schema..."

# Step 1: Generate Prisma Client
npx prisma generate --schema=./prisma/schema.prisma

# Step 2: Create enums manually first (must be done before tables)
echo "Creating enums..."
PGSSLMODE=require psql "$DATABASE_URL" << 'EOF' 2>&1 || true
-- Drop existing enums if they exist (to avoid conflicts)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "VideoType" CASCADE;
DROP TYPE IF EXISTS "GroupBuyStatus" CASCADE;

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'FOUNDER', 'MAKER', 'ADMIN', 'BUYER');

-- Create OrderStatus enum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Create VideoType enum
CREATE TYPE "VideoType" AS ENUM ('SHORT', 'LONG');

-- Create GroupBuyStatus enum
CREATE TYPE "GroupBuyStatus" AS ENUM ('OPEN', 'COMPLETED');
EOF

# Step 3: Apply full schema
echo "Applying schema..."
npx prisma db push --schema=./prisma/schema.prisma --force-reset --accept-data-loss

# Step 4: Create user
echo "Creating user..."
npx ts-node scripts/render-create-user.ts

echo "✅ Done!"

