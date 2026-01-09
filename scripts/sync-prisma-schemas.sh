#!/bin/bash

# Sync Prisma Schemas Script
# Ensures root schema (source of truth) is synced to server schema

set -e

echo "🔄 Syncing Prisma Schemas..."
echo ""

ROOT_SCHEMA="prisma/schema.prisma"
SERVER_SCHEMA="server/prisma/schema.prisma"

# Check if root schema exists
if [ ! -f "$ROOT_SCHEMA" ]; then
    echo "❌ Error: Root schema not found at $ROOT_SCHEMA"
    exit 1
fi

# Check if server schema exists
if [ ! -f "$SERVER_SCHEMA" ]; then
    echo "⚠️  Warning: Server schema not found at $SERVER_SCHEMA"
    echo "Creating directory..."
    mkdir -p server/prisma
fi

# Backup server schema before overwriting
if [ -f "$SERVER_SCHEMA" ]; then
    BACKUP_FILE="${SERVER_SCHEMA}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📦 Creating backup: $BACKUP_FILE"
    cp "$SERVER_SCHEMA" "$BACKUP_FILE"
fi

# Copy root schema to server
echo "📋 Copying root schema to server..."
cp "$ROOT_SCHEMA" "$SERVER_SCHEMA"

echo "✅ Schema synced successfully!"
echo ""
echo "Next steps:"
echo "1. Review changes: diff $BACKUP_FILE $SERVER_SCHEMA (if backup exists)"
echo "2. Regenerate Prisma client: cd server && npx prisma generate"
echo "3. Test migrations: cd server && npx prisma migrate dev"
echo ""
