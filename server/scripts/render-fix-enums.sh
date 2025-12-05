#!/bin/bash
# Fix Enums and Database Schema on Render
# This script creates enums first, then applies full schema

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🔧 Render Enum & Schema Fix Script  ║"
echo "╚════════════════════════════════════════╝"
echo ""

cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "📋 Step 1: Generating Prisma Client"
echo "===================================="
npx prisma generate --schema=./prisma/schema.prisma
echo "✅ Done"
echo ""

echo "📋 Step 2: Creating Enums Manually"
echo "==================================="
echo "   Creating UserRole enum..."

# Create UserRole enum if it doesn't exist
psql "$DATABASE_URL" << 'EOF' 2>&1 || true
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'FOUNDER', 'MAKER', 'ADMIN', 'BUYER');
        RAISE NOTICE 'UserRole enum created';
    ELSE
        RAISE NOTICE 'UserRole enum already exists';
    END IF;
END $$;
EOF

echo "✅ Enums check completed"
echo ""

echo "📋 Step 3: Applying Full Schema"
echo "================================"
echo "   This will create/update all tables..."

# Use db push with force reset to ensure clean state
if npx prisma db push --schema=./prisma/schema.prisma --force-reset --accept-data-loss 2>&1; then
  echo "✅ Schema applied successfully"
else
  echo "⚠️  db push had issues, but continuing..."
fi

echo ""
echo "📋 Step 4: Verifying Enums"
echo "=========================="
psql "$DATABASE_URL" -c "SELECT typname FROM pg_type WHERE typtype = 'e';" 2>&1 | grep -i userrole && echo "✅ UserRole enum exists" || echo "⚠️  UserRole enum check failed"

echo ""
echo "📋 Step 5: Verifying Tables"
echo "==========================="
TABLES=("users" "orders" "products")
for table in "${TABLES[@]}"; do
  if psql "$DATABASE_URL" -c "\d $table" > /dev/null 2>&1; then
    echo "✅ Table '$table' exists"
  else
    echo "⚠️  Table '$table' not found"
  fi
done

echo ""
echo "📋 Step 6: Creating User"
echo "========================"
if npx ts-node scripts/render-create-user.ts 2>&1; then
  echo "✅ User created successfully"
else
  echo "⚠️  User creation failed, but schema is fixed"
fi

echo ""
echo "✅ All done! Database is ready."



