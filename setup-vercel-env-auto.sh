#!/bin/bash

# Script تلقائي لإضافة Environment Variables في Vercel
# هذا Script يطلب منك Backend URL فقط، ثم يفعل كل شيء تلقائياً

echo "═══════════════════════════════════════════════════════"
echo "   🤖 أتمتة Environment Variables في Vercel"
echo "═══════════════════════════════════════════════════════"
echo ""

# دالة للتحقق من Vercel CLI
check_vercel() {
    if command -v vercel &> /dev/null; then
        VERCEL_CMD="vercel"
        return 0
    elif command -v npx &> /dev/null; then
        VERCEL_CMD="npx vercel"
        echo "ℹ️  سيستخدم npx vercel (لا يحتاج تثبيت)"
        return 0
    else
        echo "⚠️  Vercel CLI غير متوفر"
        echo ""
        echo "📦 تثبيت Vercel CLI..."
        npm install -g vercel
        if [ $? -eq 0 ]; then
            VERCEL_CMD="vercel"
            echo "✅ تم تثبيت Vercel CLI"
            return 0
        else
            echo "❌ فشل التثبيت. استخدم: npm install -g vercel"
            exit 1
        fi
    fi
}

# التحقق من Vercel CLI
check_vercel
echo ""

# التحقق من Login
echo "🔍 التحقق من Vercel Login..."
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo "⚠️  لم يتم تسجيل الدخول إلى Vercel"
    echo ""
    echo "🔐 تسجيل الدخول إلى Vercel..."
    echo "   سيطلب منك فتح المتصفح والموافقة"
    $VERCEL_CMD login
    if [ $? -ne 0 ]; then
        echo "❌ فشل Login. حاول مرة أخرى."
        exit 1
    fi
    echo ""
fi

echo "✅ تم تسجيل الدخول إلى Vercel"
echo ""

# طلب Backend URL
echo "═══════════════════════════════════════════════════════"
echo "   📋 الخطوة الوحيدة: Backend URL"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. اذهب إلى Render Dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "2. اذهب إلى Web Service 'banda-chao-backend'"
echo ""
echo "3. انسخ URL (مثل: https://banda-chao-backend.onrender.com)"
echo ""
read -p "📝 الصق Backend URL هنا: " BACKEND_URL

# التحقق من URL
if [[ ! $BACKEND_URL =~ ^https?:// ]]; then
    echo "❌ URL غير صحيح. يجب أن يبدأ بـ http:// أو https://"
    exit 1
fi

echo ""
echo "✅ Backend URL: $BACKEND_URL"
echo ""

# إضافة Environment Variables
echo "═══════════════════════════════════════════════════════"
echo "   🔧 إضافة Environment Variables..."
echo "═══════════════════════════════════════════════════════"
echo ""

# الانتقال إلى مجلد المشروع
cd "$(dirname "$0")"

# إزالة / من النهاية إذا كان موجود
BACKEND_URL="${BACKEND_URL%/}"

API_URL="${BACKEND_URL}/api/v1"
SOCKET_URL="${BACKEND_URL}"

echo "📝 سيتم إضافة:"
echo "   NEXT_PUBLIC_API_URL = $API_URL"
echo "   NEXT_PUBLIC_SOCKET_URL = $SOCKET_URL"
echo ""

# إضافة Environment Variables
echo "➕ إضافة NEXT_PUBLIC_API_URL..."
echo "$API_URL" | $VERCEL_CMD env add NEXT_PUBLIC_API_URL production
echo "$API_URL" | $VERCEL_CMD env add NEXT_PUBLIC_API_URL preview
echo "$API_URL" | $VERCEL_CMD env add NEXT_PUBLIC_API_URL development

echo ""
echo "➕ إضافة NEXT_PUBLIC_SOCKET_URL..."
echo "$SOCKET_URL" | $VERCEL_CMD env add NEXT_PUBLIC_SOCKET_URL production
echo "$SOCKET_URL" | $VERCEL_CMD env add NEXT_PUBLIC_SOCKET_URL preview
echo "$SOCKET_URL" | $VERCEL_CMD env add NEXT_PUBLIC_SOCKET_URL development

echo ""
echo "✅ تم إضافة Environment Variables"
echo ""

# Redeploy
echo "═══════════════════════════════════════════════════════"
echo "   🚀 Redeploy في Vercel..."
echo "═══════════════════════════════════════════════════════"
echo ""

read -p "هل تريد Redeploy الآن؟ (y/n): " REDEPLOY

if [ "$REDEPLOY" = "y" ] || [ "$REDEPLOY" = "Y" ]; then
    echo ""
    echo "🚀 بدء Redeploy..."
    $VERCEL_CMD --prod
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ تم Redeploy بنجاح!"
    else
        echo ""
        echo "⚠️  Redeploy فشل. يمكنك Redeploy يدوياً من Vercel Dashboard"
    fi
else
    echo ""
    echo "⚠️  لم يتم Redeploy"
    echo "   يمكنك Redeploy لاحقاً من Vercel Dashboard"
    echo "   أو شغل: $VERCEL_CMD --prod"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "   ✅ تم بنجاح!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "✅ Environment Variables تم إضافتها"
echo "✅ Backend URL: $BACKEND_URL"
echo ""
echo "🎉 كل شيء جاهز!"

