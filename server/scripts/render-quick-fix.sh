#!/bin/bash
# Quick fix: Force reset database schema
# This is the FINAL command to fix all missing tables

set -e

cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .

echo "🔄 Resetting database schema..."
npx prisma generate --schema=./prisma/schema.prisma
npx prisma db push --schema=./prisma/schema.prisma --force-reset --accept-data-loss

echo "✅ Database reset complete!"
echo ""
echo "Creating user..."
npx ts-node scripts/render-create-user.ts

echo ""
echo "✅ All done!"



