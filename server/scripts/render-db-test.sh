#!/bin/bash
# Script to test database connection on Render Shell
# Usage: Run this in Render Shell for backend service

echo "🔍 Testing Database Connection on Render..."
echo "=========================================="
echo ""

# Get DATABASE_URL from environment
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "📋 DATABASE_URL Info:"
echo "$DATABASE_URL" | sed 's/:[^:@]*@/:****@/g'  # Mask password
echo ""

# Test 1: Try psql with DATABASE_URL as-is
echo "🧪 Test 1: Connecting with DATABASE_URL..."
if psql "$DATABASE_URL" -c "SELECT 1 as test;" 2>&1; then
  echo "✅ SUCCESS: Connection works with DATABASE_URL"
  exit 0
else
  echo "❌ FAILED: Connection failed with DATABASE_URL"
fi

echo ""
echo "🧪 Test 2: Trying with PGSSLMODE=require..."
export PGSSLMODE=require
if psql "$DATABASE_URL" -c "SELECT 1 as test;" 2>&1; then
  echo "✅ SUCCESS: Connection works with PGSSLMODE=require"
  echo "💡 Solution: Add ?sslmode=require to DATABASE_URL"
  exit 0
else
  echo "❌ FAILED: Connection still failed with PGSSLMODE=require"
fi

echo ""
echo "🧪 Test 3: Trying with explicit SSL parameters..."
# Extract components from DATABASE_URL
DB_URL_WITH_SSL="${DATABASE_URL}?sslmode=require"
if psql "$DB_URL_WITH_SSL" -c "SELECT 1 as test;" 2>&1; then
  echo "✅ SUCCESS: Connection works with ?sslmode=require"
  echo "💡 Solution: Update DATABASE_URL to include ?sslmode=require"
  exit 0
else
  echo "❌ FAILED: All connection attempts failed"
  echo ""
  echo "📋 Troubleshooting:"
  echo "   1. Check if PostgreSQL service is running"
  echo "   2. Verify DATABASE_URL is correct"
  echo "   3. Check network connectivity"
  exit 1
fi



