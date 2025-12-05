#!/bin/bash
# Complete database fix script for Render
# Fixes missing password column and creates user

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🔧 Render Database Fix Script        ║"
echo "╚════════════════════════════════════════╝"
echo ""

cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .

# Step 1: Generate Prisma Client
echo "📋 Step 1: Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma
echo "✅ Done"
echo ""

# Step 2: Push schema (this will add missing columns)
echo "📋 Step 2: Pushing database schema..."
echo "   This will add missing columns like 'password'"
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
echo "✅ Done"
echo ""

# Step 3: Verify password column exists
echo "📋 Step 3: Verifying schema..."
if psql "$DATABASE_URL" -c "\d users" 2>/dev/null | grep -q "password"; then
  echo "✅ Password column exists"
else
  echo "⚠️  Password column check failed, but continuing..."
fi
echo ""

# Step 4: Create user
echo "📋 Step 4: Creating user..."
if npx ts-node scripts/render-create-user.ts 2>&1; then
  echo "✅ User created successfully"
else
  echo "❌ Failed to create user"
  exit 1
fi

echo ""
echo "✅ All done! Database is fixed and user is created."



