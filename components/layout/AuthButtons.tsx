'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, User, LayoutDashboard, LogOut } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Simple logged out state - pure Link navigation
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 relative z-[9999] pointer-events-auto">
        <Link
          href={`/${locale}/login`}
          className="text-sm px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700 pointer-events-auto"
        >
          {locale === 'ar' ? 'تسجيل الدخول' : locale === 'zh' ? '登录' : 'Login'}
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="text-sm px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors pointer-events-auto"
        >
          {locale === 'ar' ? 'إنشاء حساب' : locale === 'zh' ? '注册' : 'Sign up'}
        </Link>
      </div>
    );
  }

  // Logged in state - show user dropdown menu
  const displayName = userName || user?.name || (locale === 'ar' ? 'مستخدم' : locale === 'zh' ? '用户' : 'User');
  
  // Get user role from multiple sources (user object, localStorage fallback)
  const userRoleFromHook = user?.role;
  const userRoleFromStorage = typeof window !== 'undefined' 
    ? localStorage.getItem('bandaChao_userRole') 
    : null;
  const userRole = userRoleFromHook || userRoleFromStorage;
  
  // Debug: Log user role to console for troubleshooting
  useEffect(() => {
    console.log('[AuthButtons] User role debug:', {
      fromHook: userRoleFromHook,
      fromStorage: userRoleFromStorage,
      final: userRole,
      userObject: user
    });
  }, [userRoleFromHook, userRoleFromStorage, userRole, user]);
  
  // Show admin link for ADMIN, FOUNDER, and MERCHANT roles
  const showAdminLink = userRole === 'ADMIN' || userRole === 'FOUNDER' || userRole === 'MERCHANT';

  return (
    <div className="relative z-[9999] pointer-events-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
      >
        {/* User Avatar/Initial */}
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            {user?.email && (
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile Link */}
            <Link
              href={`/${locale}/profile`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{locale === 'ar' ? 'الملف الشخصي' : locale === 'zh' ? '个人资料' : 'Profile'}</span>
            </Link>

            {/* Admin Dashboard Link (for ADMIN/FOUNDER) */}
            {showAdminLink && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{locale === 'ar' ? 'لوحة التحكم' : locale === 'zh' ? '控制面板' : 'Admin Dashboard'}</span>
              </Link>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onLogout) {
                  onLogout();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{locale === 'ar' ? 'تسجيل الخروج' : locale === 'zh' ? '退出' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
