'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthButtons from './AuthButtons';
import UploadButton from './UploadButton';
import NotificationBell from '@/components/common/NotificationBell';

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('bandaChao_isLoggedIn') === 'true';
      const name = localStorage.getItem('bandaChao_userName');
      const role = localStorage.getItem('bandaChao_userRole');
      setIsLoggedIn(loggedIn);
      setUserName(name);
      setUserRole(role);
      
      // Defensive logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Navbar] Auth state loaded:', { loggedIn, name, role });
      }
    }
  }, []);

  // Listen for storage changes (e.g., login/logout from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem('bandaChao_isLoggedIn') === 'true';
        const name = localStorage.getItem('bandaChao_userName');
        const role = localStorage.getItem('bandaChao_userRole');
        setIsLoggedIn(loggedIn);
        setUserName(name);
        setUserRole(role);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Navbar] Logout called');
      }
      localStorage.removeItem('bandaChao_isLoggedIn');
      localStorage.removeItem('bandaChao_userEmail');
      localStorage.removeItem('bandaChao_userName');
      localStorage.removeItem('bandaChao_userRole');
      setIsLoggedIn(false);
      setUserName(null);
      setUserRole(null);
      window.location.href = `/${locale}`;
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
              isLoggedIn={isLoggedIn}
              userName={userName}
              onLogout={handleLogout}
            />
            {/* Upload Button */}
            <UploadButton 
              locale={locale}
              isLoggedIn={isLoggedIn}
              userRole={userRole || undefined}
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
  const [mounted, setMounted] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        const cart = localStorage.getItem('banda_chao_cart');
        if (cart) {
          try {
            const items = JSON.parse(cart);
            const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
            setItemCount(count);
          } catch (err) {
            setItemCount(0);
          }
        }
      }
    };

    updateCartCount();
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  if (!mounted) {
    return (
      <Link href={`/${locale}/cart`} className="relative">
        <svg
          className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors"
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
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/cart`} className="relative">
      <svg
        className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors"
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
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  );
}

