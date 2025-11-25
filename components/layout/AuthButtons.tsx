'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuthButtonsProps {
  locale: string;
  isLoggedIn: boolean;
  userName?: string | null;
  onLogout?: () => void;
}

export default function AuthButtons({ locale, isLoggedIn, userName, onLogout }: AuthButtonsProps) {
  const router = useRouter();

  // Defensive logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthButtons] Component mounted. isLoggedIn:', isLoggedIn);
    }
  }, [isLoggedIn]);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthButtons] Login button clicked');
    }
    // Link will handle navigation, but ensure it's not prevented
    router.push(`/${locale}/login`);
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthButtons] Signup button clicked');
    }
    // Link will handle navigation, but ensure it's not prevented
    router.push(`/${locale}/signup`);
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthButtons] Logout button clicked');
    }
    if (onLogout) {
      onLogout();
    }
  };

  const accountTexts = {
    ar: {
      myAccount: 'حسابي',
      logOut: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
    },
    en: {
      myAccount: 'My Account',
      logOut: 'Log Out',
      login: 'Log In',
      signup: 'Sign Up',
    },
    zh: {
      myAccount: '我的账户',
      logOut: '登出',
      login: '登录',
      signup: '注册',
    },
  };

  const t = accountTexts[locale as keyof typeof accountTexts] || accountTexts.en;

  if (isLoggedIn) {
    return (
      <>
        <span className="text-gray-600 text-sm relative z-[100]">
          {t.myAccount} {userName ? `(${userName})` : ''}
        </span>
        <button
          onClick={handleLogoutClick}
          className="text-gray-600 hover:text-gray-900 text-sm relative z-[100]"
          type="button"
        >
          {t.logOut}
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/${locale}/login`}
        className="text-gray-600 hover:text-gray-900 text-sm relative z-[100] px-3 py-2 rounded transition-colors"
        onClick={handleLoginClick}
      >
        {t.login}
      </Link>
      <Link
        href={`/${locale}/signup`}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 relative z-[100] transition-colors"
        onClick={handleSignupClick}
      >
        {t.signup}
      </Link>
    </>
  );
}

