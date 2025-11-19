#!/bin/bash

# Navigate to server folder
cd "/Users/tarqahmdaljnydy/Documents/banda-chao/server"
echo "📁 Current directory: $(pwd)"

# Step 1: Create or update .env file
echo ""
echo "📝 Step 1: Creating/updating .env file..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banda_chao?schema=public"
JWT_SECRET="secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
# Note: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET should come from environment variables
# Do not set them here to avoid overriding production values
EOF
echo "✅ .env file created/updated"

# Step 2: Check if PostgreSQL is running
echo ""
echo "🔍 Step 2: Checking PostgreSQL status..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running on localhost:5432"
else
    echo "❌ PostgreSQL is NOT running on localhost:5432"
    echo "⚠️  Please start PostgreSQL and run this script again."
    exit 1
fi

# Step 3: Create database if it doesn't exist
echo ""
echo "🗄️  Step 3: Creating database (if it doesn't exist)..."
createdb banda_chao 2>&1 | grep -v "already exists" || echo "✅ Database check complete"

# Step 4: Install dependencies (only if node_modules is missing)
echo ""
echo "📦 Step 4: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ node_modules exists, skipping npm install"
fi

# Step 5: Run Prisma migration
echo ""
echo "🚀 Step 5: Running Prisma migration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx prisma migrate dev --name auto-fix 2>&1
MIGRATION_EXIT_CODE=$?
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
else
    echo ""
    echo "❌ Migration failed with exit code: $MIGRATION_EXIT_CODE"
    echo "Please check the error messages above."
fi

