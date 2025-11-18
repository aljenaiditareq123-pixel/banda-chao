/**
 * سكريبت بسيط لإنشاء Storage bucket
 * 
 * التعليمات بالعربية:
 * 
 * 1. احصل على SERVICE_ROLE_KEY:
 *    - اذهب إلى Supabase Dashboard
 *    - Settings → API
 *    - انسخ "service_role" key (ليس anon key!)
 * 
 * 2. أضف المفتاح إلى .env.local:
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 * 
 * 3. شغل السكريبت:
 *    node scripts/setup-storage-simple.js
 */

// قراءة المتغيرات من .env.local
const fs = require('fs');
const path = require('path');

// قراءة .env.local
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

if (!SUPABASE_URL) {
  console.error('❌ خطأ: لم يتم العثور على NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ خطأ: لم يتم العثور على SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('📋 الخطوات:');
  console.error('1. افتح Supabase Dashboard: https://supabase.com/dashboard');
  console.error('2. اختر مشروعك');
  console.error('3. Settings → API');
  console.error('4. انسخ "service_role" key (المفتاح السري)');
  console.error('5. أضف السطر التالي إلى ملف .env.local:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.error('');
  console.error('⚠️  تحذير: Service Role Key هو مفتاح سري - لا تشاركه أبداً!');
  process.exit(1);
}

async function setupStorage() {
  console.log('🚀 بدء إعداد Storage...\n');

  try {
    // إنشاء Bucket
    console.log('1️⃣  جاري إنشاء bucket "avatars"...');
    const bucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        name: 'avatars',
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/*'],
      }),
    });

    if (bucketResponse.ok) {
      console.log('   ✅ تم إنشاء bucket بنجاح!\n');
    } else if (bucketResponse.status === 409) {
      console.log('   ℹ️  bucket موجود بالفعل\n');
    } else {
      const errorText = await bucketResponse.text();
      console.error('   ❌ خطأ:', errorText);
      throw new Error(errorText);
    }

    console.log('✅ تم إعداد Storage بنجاح!');
    console.log('');
    console.log('📝 ملاحظة: Policies تحتاج إلى إعداد يدوي من Supabase Dashboard:');
    console.log('   1. Storage → avatars → Policies');
    console.log('   2. Policy 1: SELECT → Everyone');
    console.log('   3. Policy 2: INSERT → Authenticated users only');
    console.log('');
    console.log('🎉 يمكنك الآن استخدام رفع الصور في المشروع!');

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error('');
    console.error('💡 يمكنك إنشاء bucket يدوياً:');
    console.error('   1. Supabase Dashboard → Storage');
    console.error('   2. New bucket');
    console.error('   3. Name: avatars, Public: ON');
  }
}

setupStorage();


