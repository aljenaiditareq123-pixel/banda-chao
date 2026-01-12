#!/bin/bash
# Deployment script for Backend

echo "🔨 Building backend..."
npm install
npx prisma generate
npm run build

echo "✅ Build complete!"
echo ""
echo "📦 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to Railway/Render"
echo "2. Set Environment Variables"
echo "3. Run migrations: npx prisma migrate deploy"


