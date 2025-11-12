'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/start" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">Banda Chao</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-700 hover:text-red-600 transition">
              {t('home')}
            </Link>
            <Link href="/videos/short" className="text-gray-700 hover:text-red-600 transition">
              {t('shortVideos')}
            </Link>
            <Link href="/videos/long" className="text-gray-700 hover:text-red-600 transition">
              {t('longVideos')}
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-red-600 transition">
              {t('products')}
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-red-600 transition">
              {t('search')}
            </Link>
            {user && (
              <>
                <Link href="/chat" className="text-gray-700 hover:text-red-600 transition">
                  {t('chat')}
                </Link>
                <Link href="/feed" className="text-gray-700 hover:text-red-600 transition">
                  {t('feed')}
                </Link>
                <Link href="/videos/new" className="text-gray-700 hover:text-red-600 transition">
                  {t('uploadVideo')}
                </Link>
                <Link href="/products/new" className="text-gray-700 hover:text-red-600 transition">
                  {t('addProduct')}
                </Link>
              </>
            )}
            <Link href="/ai/dashboard" className="text-gray-700 hover:text-red-600 transition">
              🤖 AI助手
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-2 py-1">
              <button
                onClick={() => setLanguage('zh')}
                className={`px-2 py-1 text-sm rounded transition ${
                  language === 'zh'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 text-sm rounded transition ${
                  language === 'ar'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                العربية
              </button>
            </div>
            <Link
              href="/cart"
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
              aria-label={t('cartTitle') ?? 'Cart'}
            >
              <span role="img" aria-label="cart" className="text-xl leading-none">
                🛒
              </span>
              <span className="text-sm font-semibold">{totalItems}</span>
            </Link>

            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm">
                      {(user.name || user.email)?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name || t('myAccount')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
