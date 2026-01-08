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
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // During SSR or before mount, show logged out state to match server output
  if (!mounted || authLoading) {
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

  // Safety check: if isLoggedIn but user is null, show logged out state
  if (isLoggedIn && !user && typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('bandaChao_user');
    if (!storedUser) {
      // User logged out, show logged out state
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
  }

  // Logged in state - show user dropdown menu
  // Safe fallback for displayName with null protection
  const displayName = userName || user?.name || (locale === 'ar' ? 'مستخدم' : locale === 'zh' ? '用户' : 'User') || 'U';
  const safeInitial = displayName && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : 'U';
  
  // Get user image from user object or localStorage
  const userImage = user?.image || (typeof window !== 'undefined' ? localStorage.getItem('bandaChao_userImage') : null);
  
  // Get user role from multiple sources (user object, localStorage fallback)
  const userRoleFromHook = user?.role || null;
  const userRoleFromStorage = typeof window !== 'undefined' 
    ? localStorage.getItem('bandaChao_userRole') 
    : null;
  const userRole = userRoleFromHook || userRoleFromStorage || null;
  
  // Debug: Log user role to console for troubleshooting (only in dev, with null safety)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthButtons] User role debug:', {
        fromHook: userRoleFromHook,
        fromStorage: userRoleFromStorage,
        final: userRole,
        userExists: !!user,
        userRoleFromObject: user?.role
      });
    }
  }, [userRoleFromHook, userRoleFromStorage, userRole]); // Removed 'user' from deps to prevent infinite loops
  
  // Show admin link for ADMIN, FOUNDER, and MERCHANT roles (with null safety)
  const showAdminLink = userRole === 'ADMIN' || userRole === 'FOUNDER' || userRole === 'MERCHANT';

  return (
    <div className="relative z-[9999] pointer-events-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
      >
        {/* User Avatar/Image or Initial */}
        {userImage ? (
          <img 
            src={userImage} 
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border-2 border-primary"
            onError={(e) => {
              // Fallback to initial if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm';
                fallback.textContent = safeInitial;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
            {safeInitial}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{displayName || 'User'}</p>
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
