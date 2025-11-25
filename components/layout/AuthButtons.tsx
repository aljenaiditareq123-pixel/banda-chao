'use client';

import Link from 'next/link';

interface AuthButtonsProps {
  locale: string;
  isLoggedIn?: boolean;
  userName?: string | null;
  onLogout?: () => void;
}

export default function AuthButtons({
  locale,
  isLoggedIn = false,
  userName,
  onLogout,
}: AuthButtonsProps) {
  // Simple logged out state - pure Link navigation
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 relative z-[100]">
        <Link
          href={`/${locale}/login`}
          className="text-sm px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
        >
          {locale === 'ar' ? 'تسجيل الدخول' : locale === 'zh' ? '登录' : 'Login'}
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="text-sm px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          {locale === 'ar' ? 'إنشاء حساب' : locale === 'zh' ? '注册' : 'Sign up'}
        </Link>
      </div>
    );
  }

  // Logged in state - show user menu
  return (
    <div className="flex items-center gap-2 relative z-[100]">
      <span className="text-sm text-gray-700">
        {locale === 'ar' ? 'مرحباً، ' : locale === 'zh' ? '你好, ' : 'Hi, '}
        {userName || (locale === 'ar' ? 'مستخدم' : locale === 'zh' ? '用户' : 'User')}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="text-sm px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
      >
        {locale === 'ar' ? 'تسجيل الخروج' : locale === 'zh' ? '退出' : 'Logout'}
      </button>
    </div>
  );
}
