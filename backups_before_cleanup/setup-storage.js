/**
 * Script to automatically create Supabase Storage bucket and policies
 * 
 * HOW TO USE:
 * 1. Get your SERVICE_ROLE_KEY from Supabase:
 *    - Go to Settings → API
 *    - Copy "service_role" key (NOT the anon key!)
 * 
 * 2. Add it to .env.local:
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 * 
 * 3. Run this script:
 *    node scripts/setup-storage.js
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ خطأ: يرجى إضافة SUPABASE_SERVICE_ROLE_KEY في ملف .env.local');
  console.error('');
  console.error('كيفية الحصول على Service Role Key:');
  console.error('1. افتح Supabase Dashboard');
  console.error('2. اذهب إلى Settings → API');
  console.error('3. انسخ "service_role" key (المفتاح السري، ليس anon key)');
  console.error('4. أضفه إلى .env.local كالتالي:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

async function createBucket() {
  console.log('🔄 جاري إنشاء Storage bucket...\n');

  try {
    // Create bucket
    const createBucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        name: 'avatars',
        public: true,
        file_size_limit: 5242880, // 5MB in bytes
        allowed_mime_types: ['image/*'],
      }),
    });

    if (createBucketResponse.ok) {
      console.log('✅ تم إنشاء bucket "avatars" بنجاح!\n');
    } else if (createBucketResponse.status === 409) {
      console.log('ℹ️  bucket "avatars" موجود بالفعل\n');
    } else {
      const error = await createBucketResponse.text();
      console.error('❌ خطأ في إنشاء bucket:', error);
      throw new Error(error);
    }

    // Create Policies
    console.log('🔄 جاري إنشاء Policies...\n');

    // Policy 1: Public Read
    const readPolicy = {
      name: 'Public Avatar Read',
      definition: {
        action: 'SELECT',
        roles: ['anon', 'authenticated'],
        target: 'avatars',
      },
      check: 'true',
      using: 'true',
    };

    const readPolicyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/create_policy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify(readPolicy),
      }
    );

    if (readPolicyResponse.ok || readPolicyResponse.status === 409) {
      console.log('✅ تم إنشاء Policy للقراءة العامة\n');
    }

    // Policy 2: Authenticated Upload
    const uploadPolicy = {
      name: 'Authenticated Avatar Upload',
      definition: {
        action: 'INSERT',
        roles: ['authenticated'],
        target: 'avatars',
      },
      check: "auth.role() = 'authenticated'",
      using: "auth.role() = 'authenticated'",
    };

    const uploadPolicyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/create_policy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify(uploadPolicy),
      }
    );

    if (uploadPolicyResponse.ok || uploadPolicyResponse.status === 409) {
      console.log('✅ تم إنشاء Policy للرفع (للمستخدمين المسجلين فقط)\n');
    }

    console.log('🎉 تم إعداد Storage بنجاح!\n');
    console.log('✅ يمكنك الآن رفع الصور الشخصية في المشروع');

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error('\n💡 ملاحظة: قد تحتاج إلى إنشاء Policies يدوياً من Supabase Dashboard');
    console.error('   Storage → avatars → Policies → New Policy');
    process.exit(1);
  }
}

createBucket();

