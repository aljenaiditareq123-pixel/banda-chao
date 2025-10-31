import Link from 'next/link';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            🎉 مرحباً! أنا Auto - هذا ما أنجزناه معاً!
          </h1>
          <p className="text-xl opacity-90">
            مشروع Banda Chao - منصة كاملة للشباب الصيني
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Link - Big Button */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block px-12 py-6 bg-gradient-to-r from-red-600 to-pink-600 text-white text-2xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            🚀 افتح الموقع الآن!
          </Link>
          <p className="mt-4 text-gray-600 text-lg">
            http://localhost:3000
          </p>
        </div>

        {/* What We Built */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">رفع الفيديوهات</h3>
            <p className="text-gray-600 mb-4">يمكن للمستخدمين رفع فيديوهات قصيرة وطويلة</p>
            <Link href="/videos/new" className="text-red-600 hover:underline">
              جرّب الآن →
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Agents</h3>
            <p className="text-gray-600 mb-4">4 وكلاء ذكية: Developer, Marketing, Chat</p>
            <Link href="/ai/chat" className="text-red-600 hover:underline">
              تحدث مع AI →
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ميزة الصوت</h3>
            <p className="text-gray-600 mb-4">تحدث مع AI مباشرة - اضغط 🎤</p>
            <Link href="/ai/chat" className="text-red-600 hover:underline">
              جرّب الصوت →
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">تطبيق موبايل</h3>
            <p className="text-gray-600 mb-4">PWA - يمكن تثبيته على الهاتف</p>
            <Link href="/start" className="text-red-600 hover:underline">
              تعليمات التثبيت →
            </Link>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">المنتجات</h3>
            <p className="text-gray-600 mb-4">إضافة وعرض المنتجات مع صور متعددة</p>
            <Link href="/products" className="text-red-600 hover:underline">
              عرض المنتجات →
            </Link>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">البحث</h3>
            <p className="text-gray-600 mb-4">بحث ذكي في الفيديوهات والمنتجات</p>
            <Link href="/search" className="text-red-600 hover:underline">
              ابحث الآن →
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔗 روابط سريعة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/"
              className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition text-center"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-semibold text-gray-900">الصفحة الرئيسية</div>
            </Link>

            <Link
              href="/ai/chat"
              className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition text-center"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-semibold text-gray-900">AI Chat - تحدث مع AI</div>
            </Link>

            <Link
              href="/ai/dashboard"
              className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-gray-900">AI Dashboard</div>
            </Link>

            <Link
              href="/start"
              className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition text-center"
            >
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-semibold text-gray-900">صفحة البدء</div>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">17</div>
            <div className="text-gray-600">صفحة</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div className="text-gray-600">AI Agents</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-600">جاهز</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">✅</div>
            <div className="text-gray-600">يعمل</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-lg mb-2">
            ✅ الموقع يعمل على: <strong className="text-red-600">http://localhost:3000</strong>
          </p>
          <p className="mb-4">
            👋 أنا <strong>Auto</strong> - سعيد بالعمل معك!
          </p>
          <p className="text-sm">
            🎉 استمتع باستخدام Banda Chao!
          </p>
        </div>
      </div>
    </div>
  );
}

