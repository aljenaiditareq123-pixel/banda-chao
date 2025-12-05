#!/bin/bash
# Script to create user in database on Render Shell
# Usage: Run this in Render Shell after database connection is verified

echo "👤 Creating User in Database..."
echo "================================"
echo ""

# Get DATABASE_URL from environment
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

EMAIL="aljenaiditareq123@gmail.com"
PASSWORD="T123q123"
NAME="Tareq"

echo "📋 User Details:"
echo "   Email: $EMAIL"
echo "   Name: $NAME"
echo ""

# Hash password using Node.js (if available) or use bcrypt
echo "🔐 Hashing password..."

# Try to use Node.js to hash password
if command -v node &> /dev/null; then
  HASHED_PASSWORD=$(node -e "
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('$PASSWORD', 10);
    console.log(hash);
  " 2>/dev/null)
  
  if [ -z "$HASHED_PASSWORD" ]; then
    echo "⚠️  Could not hash password with Node.js, using direct SQL..."
    HASHED_PASSWORD="\$2a\$10\$placeholder"  # Will need to hash properly
  fi
else
  echo "⚠️  Node.js not available, will need to hash password manually"
  HASHED_PASSWORD="\$2a\$10\$placeholder"
fi

echo "📝 Inserting user into database..."

# Generate UUID (simple version)
USER_ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || echo "gen_random_uuid()")

# SQL to create user
SQL="
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

# Try with SSL mode
export PGSSLMODE=require

if psql "$DATABASE_URL" -c "$SQL" 2>&1; then
  echo "✅ SUCCESS: User created/updated successfully"
  echo ""
  echo "📋 Verifying user..."
  psql "$DATABASE_URL" -c "SELECT id, email, name, role FROM users WHERE email = '$EMAIL';" 2>&1
  exit 0
else
  echo "❌ FAILED: Could not create user"
  echo ""
  echo "💡 Alternative: Use Node.js script instead"
  echo "   Run: node scripts/render-create-user.js"
  exit 1
fi



