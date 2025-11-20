/**
 * سكريبت لإنشاء Policy الثانية (للرفع) تلقائياً
 * 
 * هذا السكريبت يضيف Policy للسماح للمستخدمين المسجلين برفع الصور
 */

// قراءة المتغيرات من .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ خطأ: نحتاج SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('📋 كيف تحصل عليه:');
  console.error('1. Supabase Dashboard → Settings → API');
  console.error('2. انسخ "service_role" key (المفتاح السري)');
  console.error('3. أضف إلى .env.local:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

async function createUploadPolicy() {
  console.log('🔄 جاري إنشاء Policy للرفع...\n');

  try {
    // Policy للسماح للمستخدمين المسجلين برفع الملفات
    const policySQL = `
      CREATE POLICY IF NOT EXISTS "Authenticated Avatar Upload" 
      ON storage.objects 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
      );
    `;

    // استخدام PostgREST API لتنفيذ SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql: policySQL }),
    });

    if (response.ok) {
      console.log('✅ تم إنشاء Policy للرفع بنجاح!\n');
      console.log('🎉 Storage جاهز بالكامل الآن!');
      console.log('');
      console.log('✅ Policy 1: القراءة للجميع (موجودة)');
      console.log('✅ Policy 2: الرفع للمستخدمين المسجلين (تم إضافتها الآن)');
      return true;
    } else {
      // محاولة طريقة بديلة - استخدام Supabase Management API مباشرة
      console.log('🔄 جاري محاولة طريقة بديلة...\n');
      
      // طريقة بديلة: استخدام Storage API
      const altResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/bucket/avatars`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
        }
      );

      if (altResponse.ok) {
        console.log('✅ تم التحقق من وجود bucket');
        console.log('');
        console.log('⚠️  ملاحظة: قد تحتاج إلى إضافة Policy يدوياً');
        console.log('   لكن لا تقلق - سأعطيك تعليمات سهلة!');
        return false;
      }
      
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error('');
    console.error('💡 لا بأس - يمكنك إضافتها يدوياً بسهولة:');
    console.error('');
    console.error('📋 الخطوات البسيطة:');
    console.error('1. Supabase Dashboard → Storage → avatars → Policies');
    console.error('2. New policy');
    console.error('3. Get started quickly');
    console.error('4. اختر: "Enable insert access for authenticated users only"');
    console.error('5. Use this template → Review → Save');
    return false;
  }
}

createUploadPolicy().then(success => {
  if (success) {
    console.log('');
    console.log('🚀 يمكنك الآن اختبار المشروع!');
  } else {
    console.log('');
    console.log('📝 اتبع التعليمات أعلاه لإضافة Policy يدوياً');
  }
});

