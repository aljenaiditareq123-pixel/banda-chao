#!/bin/bash
# Complete setup script for Render Shell
# Tests connection and creates user in one go

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   🔧 Render Database Setup Script      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "📋 Step 1: Testing Database Connection"
echo "======================================"
echo ""

# Test connection
CONNECTION_WORKED=false

echo "🧪 Trying direct connection..."
if psql "$DATABASE_URL" -c "SELECT 1 as test;" > /dev/null 2>&1; then
  echo "✅ SUCCESS: Direct connection works"
  CONNECTION_WORKED=true
else
  echo "❌ Direct connection failed, trying with SSL..."
  
  if PGSSLMODE=require psql "$DATABASE_URL" -c "SELECT 1 as test;" > /dev/null 2>&1; then
    echo "✅ SUCCESS: Connection works with PGSSLMODE=require"
    echo "💡 Update DATABASE_URL to include ?sslmode=require"
    CONNECTION_WORKED=true
  else
    echo "❌ Connection failed even with SSL"
    echo ""
    echo "🔍 Trying to diagnose..."
    psql "$DATABASE_URL" -c "SELECT 1;" 2>&1 | head -5
    exit 1
  fi
fi

if [ "$CONNECTION_WORKED" = false ]; then
  echo "❌ All connection attempts failed"
  exit 1
fi

echo ""
echo "📋 Step 2: Creating User"
echo "======================="
echo ""

EMAIL="aljenaiditareq123@gmail.com"
PASSWORD="T123q123"
NAME="Tareq"

echo "User Details:"
echo "  Email: $EMAIL"
echo "  Name: $NAME"
echo ""

# Check if we can use Node.js
if command -v node &> /dev/null && [ -f "scripts/render-create-user.ts" ]; then
  echo "✅ Using Node.js script (recommended)..."
  cd /opt/render/project/src/server 2>/dev/null || cd server 2>/dev/null || cd .
  npx ts-node scripts/render-create-user.ts
else
  echo "⚠️  Node.js not available, using SQL directly..."
  echo "   Note: Password will be hashed using pgcrypto"
  
  # Try with pgcrypto extension
  SQL="
  -- Enable pgcrypto if not enabled
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  
  -- Insert or update user
  INSERT INTO users (id, email, password, name, role, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    '$EMAIL',
    crypt('$PASSWORD', gen_salt('bf', 10)),
    '$NAME',
    'USER',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    password = crypt('$PASSWORD', gen_salt('bf', 10)),
    name = '$NAME',
    updated_at = NOW()
  RETURNING id, email, name, role;
  "
  
  if PGSSLMODE=require psql "$DATABASE_URL" << EOF
$SQL
EOF
  then
    echo "✅ User created/updated successfully"
  else
    echo "❌ Failed to create user with SQL"
    echo "💡 Please use Node.js script: npx ts-node scripts/render-create-user.ts"
    exit 1
  fi
fi

echo ""
echo "📋 Step 3: Verifying User"
echo "========================="
echo ""

if PGSSLMODE=require psql "$DATABASE_URL" -c "SELECT id, email, name, role FROM users WHERE email = '$EMAIL';" 2>&1; then
  echo ""
  echo "✅ Setup completed successfully!"
  echo ""
  echo "📝 Login Credentials:"
  echo "   Email: $EMAIL"
  echo "   Password: $PASSWORD"
else
  echo "⚠️  Could not verify user, but creation may have succeeded"
fi

echo ""
echo "✅ All done!"



