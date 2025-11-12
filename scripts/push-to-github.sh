#!/bin/bash

# سكريبت لرفع المشروع على GitHub
# Script to push project to GitHub

echo "🚀 رفع المشروع على GitHub..."
echo ""

# التحقق من وجود remote
if git remote | grep -q "origin"; then
    echo "✅ GitHub مربوط بالفعل!"
    git remote -v
    echo ""
    echo "📤 جاري الرفع..."
    git push -u origin main
else
    echo "⚠️  GitHub غير مربوط بعد!"
    echo ""
    echo "📋 الخطوات:"
    echo "1. أنشئ مستودع على GitHub: https://github.com/new"
    echo "2. اسم المستودع: banda-chao"
    echo "3. انسخ رابط المستودع (مثل: https://github.com/USERNAME/banda-chao.git)"
    echo ""
    read -p "🔗 أدخل رابط GitHub: " GITHUB_URL
    
    if [ -z "$GITHUB_URL" ]; then
        echo "❌ لم تدخل رابط!"
        exit 1
    fi
    
    echo ""
    echo "🔗 جاري الربط..."
    git remote add origin "$GITHUB_URL"
    
    echo "📤 جاري الرفع..."
    git branch -M main
    git push -u origin main
    
    echo ""
    echo "✅ تم الرفع بنجاح!"
fi


