#!/bin/bash

# سكريبت للنشر التلقائي على Vercel
# Automatic Vercel Deployment Script

echo "🚀 بدء النشر التلقائي على Vercel..."
echo ""

# إصلاح PATH
export PATH="$HOME/.nvm/versions/node/v24.11.0/bin:$PATH"

# الانتقال للمجلد
cd /Users/tarqahmdaljnydy/Desktop/banda-chao

echo "✅ PATH تم إصلاحه"
echo "✅ في مجلد المشروع"
echo ""

# تسجيل الدخول
echo "📋 جاري تسجيل الدخول..."
npx vercel login

# النشر
echo ""
echo "📋 جاري النشر..."
npx vercel --yes --prod

echo ""
echo "✅ تم النشر!"

