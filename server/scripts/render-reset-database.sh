#!/bin/bash
# Final database reset script for Render
# WARNING: This will reset the entire database schema
# Usage: Run this in Render Shell to fix all missing tables

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   🔄 Render Database Reset Script      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "⚠️  WARNING: This will reset the database schema"
echo "   All tables will be recreated"
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .

echo "📋 Step 1: Generating Prisma Client"
echo "===================================="
echo ""
npx prisma generate --schema=./prisma/schema.prisma
echo "✅ Prisma Client generated"
echo ""

echo "📋 Step 2: Resetting Database Schema"
echo "====================================="
echo "   This will recreate all tables (users, orders, products, etc.)"
echo ""

# Use db push with force reset to recreate all tables
if npx prisma db push --schema=./prisma/schema.prisma --force-reset --accept-data-loss 2>&1; then
  echo "✅ Database schema reset and applied successfully"
else
  echo "❌ Failed to reset database schema"
  exit 1
fi

echo ""
echo "📋 Step 3: Verifying Schema"
echo "==========================="
echo ""

# Check key tables
TABLES=("users" "orders" "products" "videos")
for table in "${TABLES[@]}"; do
  if psql "$DATABASE_URL" -c "\d $table" > /dev/null 2>&1; then
    echo "✅ Table '$table' exists"
  else
    echo "⚠️  Table '$table' not found"
  fi
done

echo ""
echo "📋 Step 4: Creating User"
echo "======================="
echo ""

if npx ts-node scripts/render-create-user.ts 2>&1; then
  echo "✅ User created successfully"
else
  echo "⚠️  Failed to create user, but schema is fixed"
  echo "   You can create user manually later"
fi

echo ""
echo "✅ Database reset completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Test login with: aljenaiditareq123@gmail.com / T123q123"
echo "   2. Verify all tables: psql \"\$DATABASE_URL\" -c \"\\dt\""

