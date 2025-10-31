import Link from 'next/link';

export default function StartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎉 مرحباً في Banda Chao!
          </h1>
          <p className="text-xl text-gray-600">
            منصة هجينة تجمع بين التواصل الاجتماعي والتجارة الإلكترونية
          </p>
        </div>

        {/* Main Links Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔗 الروابط الرئيسية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Home */}
            <Link
              href="/"
              className="p-6 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🏠</div>
              <h3 className="text-xl font-bold mb-1">الصفحة الرئيسية</h3>
              <p className="text-sm opacity-90">ابدأ هنا - عرض الفيديوهات والمنتجات</p>
              <div className="mt-2 text-xs opacity-75">http://localhost:3000</div>
            </Link>

            {/* AI Chat */}
            <Link
              href="/ai/chat"
              className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-xl font-bold mb-1">AI Chat</h3>
              <p className="text-sm opacity-90">تحدث مع AI مباشرة - اضغط 🎤</p>
              <div className="mt-2 text-xs opacity-75">http://localhost:3000/ai/chat</div>
            </Link>

            {/* AI Dashboard */}
            <Link
              href="/ai/dashboard"
              className="p-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-xl font-bold mb-1">AI Dashboard</h3>
              <p className="text-sm opacity-90">لوحة تحكم AI Agents</p>
              <div className="mt-2 text-xs opacity-75">http://localhost:3000/ai/dashboard</div>
            </Link>

            {/* Search */}
            <Link
              href="/search"
              className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-xl font-bold mb-1">البحث</h3>
              <p className="text-sm opacity-90">ابحث في الفيديوهات والمنتجات</p>
              <div className="mt-2 text-xs opacity-75">http://localhost:3000/search</div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ⚡ إجراءات سريعة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/auth/login"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition text-center"
            >
              <div className="text-2xl mb-2">🔐</div>
              <div className="font-semibold text-gray-900">تسجيل الدخول</div>
            </Link>

            <Link
              href="/videos/new"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition text-center"
            >
              <div className="text-2xl mb-2">📹</div>
              <div className="font-semibold text-gray-900">رفع فيديو</div>
            </Link>

            <Link
              href="/products/new"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition text-center"
            >
              <div className="text-2xl mb-2">🛍️</div>
              <div className="font-semibold text-gray-900">إضافة منتج</div>
            </Link>
          </div>
        </div>

        {/* App Installation */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">📱 تثبيت التطبيق على الهاتف</h2>
          <div className="space-y-3 text-lg">
            <div className="flex items-start space-x-3">
              <span className="font-bold">1.</span>
              <div>
                <strong>Android:</strong> افتح في Chrome → اضغط &quot;إضافة إلى الشاشة الرئيسية&quot;
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="font-bold">2.</span>
              <div>
                <strong>iPhone:</strong> افتح في Safari → Share → Add to Home Screen
              </div>
            </div>
          </div>
        </div>

        {/* Important Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📚 صفحات أخرى
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/videos/short" className="text-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="text-2xl mb-2">🎬</div>
              <div className="text-sm font-medium">فيديوهات قصيرة</div>
            </Link>

            <Link href="/videos/long" className="text-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="text-2xl mb-2">📺</div>
              <div className="text-sm font-medium">فيديوهات طويلة</div>
            </Link>

            <Link href="/products" className="text-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="text-2xl mb-2">🛒</div>
              <div className="text-sm font-medium">المنتجات</div>
            </Link>

            <Link href="/ai/voice-settings" className="text-center p-4 hover:bg-gray-50 rounded-lg transition">
              <div className="text-2xl mb-2">🎚️</div>
              <div className="text-sm font-medium">إعدادات الصوت</div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">✅ الموقع يعمل على: <strong>http://localhost:3000</strong></p>
          <p className="text-sm">🎉 استمتع باستخدام Banda Chao!</p>
        </div>
      </div>
    </div>
  );
}

