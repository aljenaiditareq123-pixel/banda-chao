#!/bin/bash

# سكريبت لإصلاح PATH واستخدام Vercel
# Script to fix PATH and use Vercel

export PATH="$HOME/.nvm/versions/node/v24.11.0/bin:$PATH"

cd /Users/tarqahmdaljnydy/Desktop/banda-chao

echo "✅ PATH تم إصلاحه"
echo "✅ في مجلد المشروع"
echo ""
echo "🚀 جاري تشغيل vercel login..."
echo ""

npx vercel login

