#!/bin/bash

# سكريبت تثبيت Node.js تلقائياً على macOS
# شغّل هذا الملف في Terminal

echo "🚀 بدء تثبيت Node.js..."
echo ""

# التحقق من وجود Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 تثبيت Homebrew أولاً..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # إضافة Homebrew إلى PATH (للأجهزة Apple Silicon)
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

echo "✅ Homebrew موجود"
echo ""

# تثبيت Node.js
echo "📥 جاري تثبيت Node.js (قد يستغرق بضع دقائق)..."
brew install node

echo ""
echo "✅ تم تثبيت Node.js بنجاح!"
echo ""
echo "📋 التحقق من التثبيت:"
node --version
npm --version

echo ""
echo "🎉 انتهى! الآن يمكنك تشغيل:"
echo "   cd /Users/tarqahmdaljnydy/Desktop/banda-chao"
echo "   npm install"
echo "   npm run dev"

