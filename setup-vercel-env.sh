#!/bin/bash
# إضافة Environment Variables في Vercel بعد نشر Backend

echo "🔧 إعداد Environment Variables في Vercel..."
echo ""

# طلب Backend URL
read -p "🔗 أدخل Backend URL من Render (مثال: https://banda-chao-backend.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ يجب إدخال Backend URL!"
    exit 1
fi

# إزالة / من النهاية إذا كان موجود
BACKEND_URL="${BACKEND_URL%/}"

API_URL="${BACKEND_URL}/api/v1"
SOCKET_URL="${BACKEND_URL}"

echo ""
echo "📝 سيتم إضافة:"
echo "   NEXT_PUBLIC_API_URL = $API_URL"
echo "   NEXT_PUBLIC_SOCKET_URL = $SOCKET_URL"
echo ""

# إضافة Environment Variables
echo "➕ إضافة NEXT_PUBLIC_API_URL..."
echo "$API_URL" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "➕ إضافة NEXT_PUBLIC_SOCKET_URL..."
echo "$SOCKET_URL" | vercel env add NEXT_PUBLIC_SOCKET_URL production

echo ""
echo "✅ تم الإضافة بنجاح!"
echo ""
echo "🔄 الآن سنقوم بـ Redeploy..."
vercel --prod

echo ""
echo "🎉 تم! الموقع جاهز الآن!"
echo "   افتح: https://banda-chao.vercel.app"


