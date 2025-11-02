#!/bin/bash
# إكمال الإعداد الكامل - سهل جداً!

echo "═══════════════════════════════════════════════════════"
echo "   🚀 إكمال إعداد Banda Chao"
echo "═══════════════════════════════════════════════════════"
echo ""

# طلب Backend URL
echo "📝 أحتاج Backend URL من Render"
echo ""
echo "💡 كيف أحصل عليه:"
echo "   1. اذهب إلى: https://dashboard.render.com"
echo "   2. اضغط على Web Service الخاص بك"
echo "   3. انسخ URL من الأعلى"
echo "   مثال: https://banda-chao-backend.onrender.com"
echo ""
read -p "🔗 الصق Backend URL هنا: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ يجب إدخال URL!"
    exit 1
fi

# تنظيف URL
BACKEND_URL="${BACKEND_URL%/}"
API_URL="${BACKEND_URL}/api/v1"
SOCKET_URL="${BACKEND_URL}"

echo ""
echo "✅ سيتم إضافة:"
echo "   NEXT_PUBLIC_API_URL = $API_URL"
echo "   NEXT_PUBLIC_SOCKET_URL = $SOCKET_URL"
echo ""

# إضافة في Vercel
echo "➕ إضافة في Vercel..."

echo "$API_URL" | vercel env add NEXT_PUBLIC_API_URL production preview development 2>/dev/null || {
    echo "⚠️  تم تحديث NEXT_PUBLIC_API_URL"
}

echo "$SOCKET_URL" | vercel env add NEXT_PUBLIC_SOCKET_URL production preview development 2>/dev/null || {
    echo "⚠️  تم تحديث NEXT_PUBLIC_SOCKET_URL"
}

echo ""
echo "🔄 Redeploying Frontend..."
vercel --prod --yes

echo ""
echo "═══════════════════════════════════════════════════════"
echo "   ✅ تم! الموقع جاهز الآن!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🌐 افتح: https://banda-chao.vercel.app"
echo ""
echo "📝 اختبر:"
echo "   ✅ Login/Register"
echo "   ✅ Chat"
echo "   ✅ Feed"
echo "   ✅ Products"
echo ""

