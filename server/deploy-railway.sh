#!/bin/bash
# Complete Railway Deployment Script

echo "🚀 نشر Backend على Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI غير مثبت"
    echo "تثبيت Railway CLI..."
    npm install -g @railway/cli
fi

echo "📝 الخطوة 1: تسجيل الدخول في Railway"
railway login

echo ""
echo "📝 الخطوة 2: إنشاء مشروع جديد"
railway init --name banda-chao-backend

echo ""
echo "📝 الخطوة 3: إضافة PostgreSQL Database"
railway add postgresql

echo ""
echo "📝 الخطوة 4: إعداد Environment Variables"
# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set FRONTEND_URL="https://banda-chao.vercel.app"
railway variables set NODE_ENV="production"

echo ""
echo "📝 الخطوة 5: النشر!"
railway up

echo ""
echo "✅ النشر بدأ!"
echo ""
echo "📝 الخطوة 6: الحصول على URL"
BACKEND_URL=$(railway domain)
echo "Backend URL: $BACKEND_URL"
echo ""
echo "⚠️  مهم: انسخ Backend URL وأضفه في Vercel Environment Variables!"


