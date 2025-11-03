#!/bin/bash

# Script للنشر السريع على Vercel

echo "🚀 بدء النشر على Vercel..."
echo ""

# التحقق من Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI غير مثبت"
    echo "📦 جاري التثبيت..."
    npm install -g vercel
    echo "✅ تم التثبيت!"
    echo ""
fi

# النشر
echo "📤 جاري النشر..."
vercel --prod

echo ""
echo "✅ النشر مكتمل!"
echo "🔗 افتح الرابط الذي سيظهر أعلاه"

