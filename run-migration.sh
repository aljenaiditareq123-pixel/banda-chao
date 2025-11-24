#!/bin/bash

# البحث عن مجلد مشروع "banda-chao" على جهازك
PROJECT_PATH=$(find ~/Documents ~/Desktop ~/Downloads -type d -name "banda-chao" 2>/dev/null | head -n 1)

if [ -z "$PROJECT_PATH" ]; then
  echo "❌ لم يتم العثور على مجلد المشروع banda-chao في جهازك."
  echo "💡 المسار الحالي للمشروع: $(pwd)"
  echo ""
  read -p "هل تريد استخدام المسار الحالي؟ (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    PROJECT_PATH=$(pwd)
  else
    echo "يرجى فتح مجلد المشروع يدويًا وتشغيل هذا السكريبت من هناك."
    exit 1
  fi
fi

echo "✔ تم العثور على المشروع في: $PROJECT_PATH"

# البحث عن مجلد السيرفر داخل المشروع
SERVER_PATH=$(find "$PROJECT_PATH" -type d -name "server" -maxdepth 2 2>/dev/null | head -n 1)

if [ -z "$SERVER_PATH" ]; then
  echo "❌ لم يتم العثور على مجلد server داخل المشروع!"
  echo "💡 جارٍ البحث في: $PROJECT_PATH"
  echo ""
  read -p "هل تريد إنشاء مجلد server؟ (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    SERVER_PATH="$PROJECT_PATH/server"
    mkdir -p "$SERVER_PATH"
    echo "✔ تم إنشاء مجلد server في: $SERVER_PATH"
  else
    exit 1
  fi
fi

echo "✔ تم العثور على مجلد السيرفر في: $SERVER_PATH"
cd "$SERVER_PATH"

# إنشاء أو تحديث ملف .env
if [ ! -f ".env" ]; then
  echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banda_chao?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""' > .env
  echo "✔ تم إنشاء ملف .env"
else
  # تحديث DATABASE_URL إذا كان موجودًا
  if grep -q "DATABASE_URL" .env; then
    sed -i '' 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banda_chao?schema=public"|' .env
    echo "✔ تم تحديث DATABASE_URL في ملف .env"
  else
    echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banda_chao?schema=public"' >> .env
    echo "✔ تم إضافة DATABASE_URL إلى ملف .env"
  fi
fi

# إنشاء قاعدة البيانات إذا لم تكن موجودة
echo "🔍 جارٍ التحقق من وجود قاعدة البيانات..."
createdb banda_chao 2>/dev/null && echo "✔ تم إنشاء قاعدة البيانات banda_chao" || echo "⚠ قد تكون قاعدة البيانات موجودة بالفعل أو حدث خطأ."

# التحقق من وجود Prisma
if [ ! -f "package.json" ]; then
  echo "❌ ملف package.json غير موجود في مجلد server!"
  echo "💡 يرجى التأكد من أنك في المجلد الصحيح."
  exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ ملف prisma/schema.prisma غير موجود!"
  echo "💡 يرجى التأكد من أن Prisma مُعد بشكل صحيح."
  exit 1
fi

# تشغيل Prisma migration
echo "🚀 جارٍ تشغيل Prisma migration..."
npx prisma migrate dev --name auto-fix

echo ""
echo "✅ اكتمل تنفيذ السكريبت!"
echo "💡 إذا واجهت أي أخطاء، يرجى التحقق من:"
echo "   1. أن PostgreSQL يعمل على localhost:5432"
echo "   2. أن اسم المستخدم وكلمة المرور هما postgres:postgres"
echo "   3. أن Prisma مُثبت في المشروع (npm install)"

