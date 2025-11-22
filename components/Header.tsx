'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import NotificationsBell from '@/components/notifications/NotificationsBell';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hide language switcher on founder pages (Arabic-only)
  const isFounderPage = pathname?.startsWith('/founder');

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            {/* Logo */}
          <Link href={`/${language}`} className="flex items-center space-x-2" aria-label={t('home') || 'Home'}>
            <span className="text-2xl font-bold text-primary-600">Banda Chao</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6" aria-label="Main navigation">
            <Link href={`/${language}`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('home') || 'Home'}>
              {t('home') || 'الرئيسية'}
            </Link>
            <Link href={`/${language}/makers`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('makers') || 'Makers'}>
              {t('makers') || 'الحرفيون'}
            </Link>
            <Link href={`/${language}/products`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('products') || 'Products'}>
              {t('products') || 'المنتجات'}
            </Link>
            <Link href={`/${language}/videos`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('videos') || 'Videos'}>
              {t('videos') || 'الفيديوهات'}
            </Link>
            {user && (
              <>
                <Link href={`/${language}/feed`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('feed') || 'Feed'}>
                  {t('feed') || 'الخلاصة'}
                </Link>
                <Link href={`/${language}/orders`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('orders') || 'Orders'}>
                  {t('orders') || 'طلباتي'}
                </Link>
                <Link href={`/${language}/maker/dashboard`} className="text-gray-700 hover:text-primary-600 transition font-medium whitespace-nowrap" aria-label={t('makerDashboard') || 'Maker Dashboard'}>
                  {t('makerDashboard') || 'لوحة الحرفي'}
                </Link>
              </>
            )}
            {user?.role === "FOUNDER" && (
              <Link href="/founder/assistant" className="text-primary-600 hover:text-primary-700 transition font-semibold" aria-label="المؤسس">
                المؤسس
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Language Switcher - Hidden on mobile and on founder pages (Arabic-only) */}
            {!isFounderPage && (
            <div className="hidden sm:flex items-center space-x-1 border border-gray-300 rounded-lg px-2 py-1">
              <button
                onClick={() => {
                  setLanguage('zh');
                  // Preserve current route when switching language
                  const currentPath = window.location.pathname;
                  const newPath = currentPath.replace(/^\/(zh|ar|en)/, '/zh') || '/zh';
                  if (currentPath !== newPath) {
                    router.push(newPath);
                  }
                }}
                className={`px-2 py-1 text-xs rounded transition ${
                  language === 'zh'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="中文"
                aria-label="Switch to Chinese"
              >
                中文
              </button>
              <button
                onClick={() => {
                  setLanguage('ar');
                  // Preserve current route when switching language
                  const currentPath = window.location.pathname;
                  const newPath = currentPath.replace(/^\/(zh|ar|en)/, '/ar') || '/ar';
                  if (currentPath !== newPath) {
                    router.push(newPath);
                  }
                }}
                className={`px-2 py-1 text-xs rounded transition ${
                  language === 'ar'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="العربية"
                aria-label="Switch to Arabic"
              >
                عربي
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  // Preserve current route when switching language
                  const currentPath = window.location.pathname;
                  const newPath = currentPath.replace(/^\/(zh|ar|en)/, '/en') || '/en';
                  if (currentPath !== newPath) {
                    router.push(newPath);
                  }
                }}
                className={`px-2 py-1 text-xs rounded transition ${
                  language === 'en'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="English"
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>
            )}

            {/* Cart */}
            <Link
              href={`/${language}/cart`}
              className="flex items-center text-gray-700 hover:text-primary-600 transition relative p-2"
              aria-label={t('cartTitle') ?? 'Cart'}
            >
              <span role="img" aria-label="cart" className="text-xl leading-none">
                🛒
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && <NotificationsBell />}

            {/* User Menu */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href={`/${language}/profile/${user.id}`}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition"
                  aria-label={t('myAccount') || 'My Account'}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User'}
                      className="h-9 w-9 rounded-full border-2 border-primary-200"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                      {(user.name || user.email)?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-medium">{user.name || t('myAccount')}</span>
                  {user.role === 'FOUNDER' && (
                    <span className="ml-2 rounded-full bg-emerald-600 px-2 py-1 text-xs text-white font-semibold" title="Founder Account">
                      Founder
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition font-medium"
                  aria-label={t('logout') || 'Logout'}
                >
                  {t('logout') || 'تسجيل الخروج'}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition font-medium"
                  aria-label={t('login') || 'Login'}
                >
                  {t('login') || 'تسجيل الدخول'}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                  aria-label={t('register') || 'Register'}
                >
                  {t('register') || 'إنشاء حساب'}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3" aria-label="Mobile navigation">
              <Link
                href={`/${language}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                aria-label={t('home') || 'Home'}
              >
                {t('home') || 'الرئيسية'}
              </Link>
              <Link
                href={`/${language}/makers`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                aria-label={t('makers') || 'Makers'}
              >
                {t('makers') || 'الحرفيون'}
              </Link>
              <Link
                href={`/${language}/products`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                aria-label={t('products') || 'Products'}
              >
                {t('products') || 'المنتجات'}
              </Link>
              <Link
                href={`/${language}/videos`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                aria-label={t('videos') || 'Videos'}
              >
                {t('videos') || 'الفيديوهات'}
              </Link>
              {user && (
                <>
                  <Link
                    href="/feed"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                    aria-label={t('feed') || 'Feed'}
                  >
                    {t('feed') || 'الخلاصة'}
                  </Link>
                  <Link
                    href={`/${language}/orders`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                    aria-label={t('orders') || 'Orders'}
                  >
                    {t('orders') || 'طلباتي'}
                  </Link>
                  <Link
                    href={`/${language}/profile/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                    aria-label={t('myProfile') || 'My Profile'}
                  >
                    {t('myProfile') || 'ملفي الشخصي'}
                  </Link>
                </>
              )}
              {user?.role === "FOUNDER" && (
                <Link
                  href="/founder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition font-semibold"
                  aria-label={t('founderConsole') || 'Founder Console'}
                >
                  {t('founderConsole') || 'المؤسس'}
                </Link>
              )}
              {!user && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition font-medium"
                    aria-label={t('login') || 'Login'}
                  >
                    {t('login') || 'تسجيل الدخول'}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-center"
                    aria-label={t('register') || 'Register'}
                  >
                    {t('register') || 'إنشاء حساب'}
                  </Link>
                </>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  aria-label={t('logout') || 'Logout'}
                >
                  {t('logout') || 'تسجيل الخروج'}
                </button>
              )}
              {/* Mobile Language Switcher - Hidden on founder pages (Arabic-only) */}
              {!isFounderPage && (
              <div className="px-4 py-2 border-t border-gray-200 mt-2 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t('language') || 'اللغة'}:</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setLanguage('zh')}
                      className={`px-3 py-1 text-xs rounded transition ${
                        language === 'zh'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-label="Switch to Chinese"
                    >
                      中文
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        const currentPath = window.location.pathname;
                        const newPath = currentPath.replace(/^\/(zh|ar|en)/, '/ar') || '/ar';
                        if (currentPath !== newPath) {
                          router.push(newPath);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded transition ${
                        language === 'ar'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-label="Switch to Arabic"
                    >
                      عربي
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        const currentPath = window.location.pathname;
                        const newPath = currentPath.replace(/^\/(zh|ar|en)/, '/en') || '/en';
                        if (currentPath !== newPath) {
                          router.push(newPath);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded transition ${
                        language === 'en'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-label="Switch to English"
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
