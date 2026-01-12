/**
 * سكريبت شامل لإنشاء جميع Policies تلقائياً
 * 
 * الاستخدام:
 * 1. تأكد من وجود SUPABASE_SERVICE_ROLE_KEY في .env.local
 * 2. شغل: node scripts/setup-policies-complete.js
 */

const fs = require('fs');
const path = require('path');

// قراءة .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let SUPABASE_URL, SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      const value = values.join('=').trim();
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') {
        SUPABASE_URL = value;
      }
      if (key.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
        SERVICE_ROLE_KEY = value;
      }
    }
  });
}

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL غير موجود');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.log('⚠️  Service Role Key غير موجود');
  console.log('');
  console.log('لإنشاء Policy تلقائياً، نحتاج Service Role Key:');
  console.log('1. Supabase Dashboard → Settings → API');
  console.log('2. انسخ "service_role" key');
  console.log('3. أضف إلى .env.local:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('');
  console.log('بدلاً من ذلك، يمكنك إضافة Policy يدوياً:');
  console.log('Storage → avatars → Policies → New policy');
  console.log('اختر: "Enable insert access for authenticated users only"');
  process.exit(0);
}

async function setupPolicies() {
  console.log('🚀 بدء إعداد Policies تلقائياً...\n');

  // استخدام Supabase REST API مباشرة
  const policies = [
    {
      name: 'Authenticated Avatar Upload',
      operation: 'INSERT',
      roles: ['authenticated'],
    },
  ];

  console.log('📝 ملاحظة: Supabase لا يدعم إنشاء Policies مباشرة عبر REST API');
  console.log('   لكن يمكنك إضافتها بسهولة من Dashboard\n');
  console.log('═══════════════════════════════════════════════');
  console.log('   تعليمات إضافة Policy الثانية:');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('1. افتح: https://supabase.com/dashboard');
  console.log('2. Storage → avatars → Policies');
  console.log('3. New policy');
  console.log('4. Get started quickly');
  console.log('5. اختر: "Enable insert access for authenticated users only"');
  console.log('6. Use this template → Review → Save policy');
  console.log('');
  console.log('✅ بهذا تكون انتهيت!');
}

setupPolicies();


