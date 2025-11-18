#!/usr/bin/env bash

# Force set shell to bash
export SHELL=/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Banda Chao - Prisma Migration Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Navigate to server folder
echo "📁 Step 1: Navigating to server folder..."
cd "/Users/tarqahmdaljnydy/Documents/banda-chao/server" || exit 1
echo "✅ Current directory: $(pwd)"
echo ""

# Step 2: Create/overwrite .env file
echo "📝 Step 2: Creating/updating .env file..."
rm -f .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banda_chao?schema=public"
JWT_SECRET="secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
EOF
echo "✅ .env file created"
echo ""

# Step 3: Check PostgreSQL
echo "🔍 Step 3: Checking PostgreSQL status..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running on localhost:5432"
else
    echo "❌ PostgreSQL is NOT running on localhost:5432"
    echo "⚠️  Please start PostgreSQL from Postgres.app or via: brew services start postgresql"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Step 4: Create database
echo "🗄️  Step 4: Creating database (if it doesn't exist)..."
if createdb banda_chao 2>/dev/null; then
    echo "✅ Database 'banda_chao' created successfully"
else
    DB_EXISTS=$(psql -lqt -h localhost -U postgres | cut -d \| -f 1 | grep -w banda_chao | wc -l)
    if [ "$DB_EXISTS" -eq 1 ]; then
        echo "ℹ️  Database 'banda_chao' already exists"
    else
        echo "⚠️  Could not create database. Error may have occurred."
    fi
fi
echo ""

# Step 5: Install dependencies (if needed)
echo "📦 Step 5: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    INSTALL_EXIT=$?
    if [ $INSTALL_EXIT -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ node_modules exists, skipping npm install"
fi
echo ""

# Step 6: Run Prisma migration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Step 6: Running Prisma migration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
npx prisma migrate dev --name auto-fix
MIGRATION_EXIT_CODE=$?
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅✅✅ MIGRATION COMPLETED SUCCESSFULLY! ✅✅✅"
    echo ""
    echo "Next steps:"
    echo "  - Your database is now updated with the latest schema"
    echo "  - You can start your server with: npm run dev"
    echo ""
else
    echo ""
    echo "❌❌❌ MIGRATION FAILED! ❌❌❌"
    echo ""
    echo "Please check the error messages above."
    echo "Common issues:"
    echo "  - PostgreSQL not running: Start it with 'brew services start postgresql'"
    echo "  - Database connection error: Check DATABASE_URL in .env"
    echo "  - Prisma errors (P1000/P1001): Database connection failed"
    echo ""
    exit $MIGRATION_EXIT_CODE
fi

