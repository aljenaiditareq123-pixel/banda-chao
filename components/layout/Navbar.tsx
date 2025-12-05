'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { authAPI } from '@/lib/api';
import AuthButtons from './AuthButtons';
import UploadButton from './UploadButton';
import NotificationBell from '@/components/common/NotificationBell';

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await authAPI.logout();
    } catch (error) {
      // Continue with client-side cleanup even if API call fails
      console.error('Logout API error:', error);
    }

    // Clear client-side storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('bandaChao_isLoggedIn');
      localStorage.removeItem('bandaChao_userEmail');
      localStorage.removeItem('bandaChao_userName');
      localStorage.removeItem('bandaChao_userRole');
      localStorage.removeItem('bandaChao_user');
      
      // Redirect to home
      router.push(`/${locale}`);
      router.refresh();
    }
  };

  // Prevent hydration mismatch by rendering minimal shell until mounted
  if (!mounted) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 relative z-[9999] pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="text-xl font-bold text-primary">
                Banda Chao
              </Link>
            </div>
            <div className="flex items-center gap-4 relative z-[9999] pointer-events-auto">
              <Link href={`/${locale}/makers`} className="text-gray-600 hover:text-gray-900">
                {locale === 'ar' ? 'الحرفيون' : locale === 'zh' ? '手工艺人' : 'Makers'}
              </Link>
              <Link href={`/${locale}/products`} className="text-gray-600 hover:text-gray-900">
                {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
              </Link>
              <Link href={`/${locale}/videos`} className="text-gray-600 hover:text-gray-900">
                {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
              </Link>
              <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900">
                {locale === 'ar' ? 'عن' : locale === 'zh' ? '关于' : 'About'}
              </Link>
              <AuthButtons locale={locale} isLoggedIn={false} />
              <UploadButton locale={locale} isLoggedIn={false} />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 relative z-[9999] pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl font-bold text-primary">
              Banda Chao
            </Link>
          </div>
          <div className="flex items-center gap-4 relative z-[9999] pointer-events-auto">
            <Link 
              href={`/${locale}/makers`} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'ar' ? 'الحرفيون' : locale === 'zh' ? '手工艺人' : 'Makers'}
            </Link>
            <Link 
              href={`/${locale}/products`} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
            </Link>
            <Link 
              href={`/${locale}/videos`} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
            </Link>
            <Link 
              href={`/${locale}/posts`} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'ar' ? 'المنشورات' : locale === 'zh' ? '帖子' : 'Posts'}
            </Link>
            <Link 
              href={`/${locale}/about`} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'ar' ? 'عن' : locale === 'zh' ? '关于' : 'About'}
            </Link>
            {/* Auth Buttons */}
            <AuthButtons 
              locale={locale} 
              isLoggedIn={!!user && !authLoading}
              userName={user?.name || null}
              onLogout={handleLogout}
            />
            {/* Upload Button */}
            <UploadButton 
              locale={locale}
              isLoggedIn={!!user && !authLoading}
              userRole={user?.role || undefined}
            />
            {/* Language Switcher */}
            <div className="flex items-center gap-2 relative z-[9999] pointer-events-auto">
              <Link 
                href="/ar" 
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  locale === 'ar' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                AR
              </Link>
              <Link 
                href="/en" 
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  locale === 'en' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                EN
              </Link>
              <Link 
                href="/zh" 
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  locale === 'zh' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                ZH
              </Link>
            </div>
            <NotificationBell />
            {/* Cart Icon */}
            <CartIcon locale={locale} />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Cart Icon Component
function CartIcon({ locale }: { locale: string }) {
  const { itemCount, toggleDrawer } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={locale === 'ar' ? 'سلة التسوق' : locale === 'zh' ? '购物车' : 'Shopping Cart'}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      aria-label={locale === 'ar' ? 'سلة التسوق' : locale === 'zh' ? '购物车' : 'Shopping Cart'}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}

