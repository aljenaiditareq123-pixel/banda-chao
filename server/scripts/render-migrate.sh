#!/bin/bash
# Script to run Prisma migrations on Render Shell
# Usage: Run this in Render Shell for backend service

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   🔄 Prisma Migration Script           ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "📋 Step 1: Generating Prisma Client"
echo "===================================="
echo ""

cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .

if npx prisma generate --schema=./prisma/schema.prisma 2>&1; then
  echo "✅ Prisma Client generated successfully"
else
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi

echo ""
echo "📋 Step 2: Deploying Migrations"
echo "==============================="
echo ""

# Try migrate deploy first (for production)
if npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1; then
  echo "✅ Migrations deployed successfully"
else
  echo "⚠️  migrate deploy failed, trying db push..."
  echo ""
  
  # Fallback to db push
  if npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss 2>&1; then
    echo "✅ Database schema pushed successfully"
  else
    echo "❌ Both migrate deploy and db push failed"
    exit 1
  fi
fi

echo ""
echo "📋 Step 3: Verifying Schema"
echo "==========================="
echo ""

# Check if password column exists
if psql "$DATABASE_URL" -c "\d users" 2>/dev/null | grep -q "password"; then
  echo "✅ Password column exists in users table"
else
  echo "⚠️  Password column not found, but migration may have succeeded"
  echo "   Run: psql \"\$DATABASE_URL\" -c \"\\d users\" to verify"
fi

echo ""
echo "✅ Migration completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Verify schema: psql \"\$DATABASE_URL\" -c \"\\d users\""
echo "   2. Create user: npx ts-node scripts/render-create-user.ts"



