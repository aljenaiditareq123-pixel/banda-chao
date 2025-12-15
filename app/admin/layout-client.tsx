'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentPathname, setCurrentPathname] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hooks must be called unconditionally (React requirement)
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname for active link highlighting
  const { user: jwtUser, loading: jwtLoading } = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    // Only set mounted to true after browser loads
    // This ensures all client-side only code runs after hydration
    setMounted(true);
    
    // Store pathname after mounting to prevent hydration mismatch
    // This is critical - pathname should only be used after mount
    try {
      if (pathname && typeof pathname === 'string') {
        setCurrentPathname(pathname);
      }
    } catch (error) {
      console.warn('[AdminLayout] Error setting pathname:', error);
      setCurrentPathname(null);
    }
  }, [pathname]);

  // Show loading until mounted (prevents SSR/hydration issues)
  if (!mounted) {
    return <LoadingState fullScreen />;
  }

  // Merge user data from both JWT and NextAuth
  const user = jwtUser || (session?.user ? {
    id: (session.user as any).id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    role: (session.user as any).role || 'BUYER',
  } : null);
  
  const loading = jwtLoading || sessionStatus === 'loading';

  useEffect(() => {
    if (!loading && router) {
      // Check if user is authorized (founder@banda-chao.com or has ADMIN/FOUNDER role)
      if (!user) {
        try {
          router.push('/auth/signin?callbackUrl=/admin');
        } catch (error) {
          console.warn('[AdminLayout] Error redirecting to signin:', error);
        }
        return;
      }

      const isAuthorized = 
        user.email === 'founder@banda-chao.com' ||
        user.role === 'ADMIN' ||
        user.role === 'FOUNDER';

      if (!isAuthorized) {
        try {
          router.push('/');
        } catch (error) {
          console.warn('[AdminLayout] Error redirecting to home:', error);
        }
        return;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingState fullScreen />;
  }

  if (!user) {
    return null;
  }

  const isAuthorized = 
    user.email === 'founder@banda-chao.com' ||
    user.role === 'ADMIN' ||
    user.role === 'FOUNDER';

  if (!isAuthorized) {
    return null;
  }

  const handleLogout = async () => {
    try {
      // Clear JWT auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('bandaChao_user');
      }
      
      // Sign out from NextAuth if session exists
      if (session) {
        try {
          const { signOut } = await import('next-auth/react');
          await signOut({ redirect: false });
        } catch (error) {
          console.warn('[AdminLayout] Error signing out from NextAuth:', error);
        }
      }
      
      if (router) {
        router.push('/auth/signin');
      } else {
        // Fallback: use window.location if router is not available
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
      }
    } catch (error) {
      console.error('[AdminLayout] Error during logout:', error);
    }
  };

  const menuItems = [
    {
      label: 'المنتجات',
      icon: Package,
      href: '/admin/products',
      key: 'products',
    },
    {
      label: 'الطلبات',
      icon: ShoppingCart,
      href: '/admin/orders',
      key: 'orders',
    },
    {
      label: 'المستخدمين',
      icon: Users,
      href: '/admin/users',
      key: 'users',
    },
  ];

  // Hydration-safe active link check (only after mounted)
  // Bulletproof: Always returns false if anything fails to prevent crashes
  const isActive = (href: string): boolean => {
    try {
      if (!mounted || !currentPathname || !href) return false;
      if (typeof currentPathname !== 'string' || typeof href !== 'string') return false;
      return currentPathname === href || currentPathname.startsWith(href + '/');
    } catch (error) {
      // If anything fails, default to false (non-active) to prevent crash
      console.warn('[AdminLayout] Error checking active link:', error);
      return false;
    }
  };

  // Wrap everything in ErrorBoundary for extra safety
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:static inset-y-0 right-0 z-50
              w-64 bg-white border-l border-gray-200
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              h-screen overflow-y-auto
            `}
          >
            <div className="p-6">
              {/* Logo/Title */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Banda Chao</h1>
                <p className="text-sm text-gray-600">لوحة التحكم الإدارية</p>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-600 mt-1">{user?.email || ''}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {user?.role === 'FOUNDER' ? 'مؤسس' : user?.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                </p>
              </div>

              {/* Navigation - Wrapped in Suspense for extra safety */}
              <Suspense fallback={
                <nav className="space-y-2">
                  <div className="px-4 py-3 text-gray-400 text-sm">جاري التحميل...</div>
                </nav>
              }>
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    try {
                      const Icon = item.icon;
                      // Safe active check with fallback - only after mounted
                      const active = mounted ? isActive(item.href || '') : false;
                      return (
                        <Link
                          key={item.key || item.href}
                          href={item.href || '#'}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            active
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label || ''}</span>
                        </Link>
                      );
                    } catch (error) {
                      // If rendering a menu item fails, render a safe fallback
                      console.warn('[AdminLayout] Error rendering menu item:', error);
                      return (
                        <div key={item.key || item.href} className="px-4 py-3 text-gray-500 text-sm">
                          {item.label || 'Menu Item'}
                        </div>
                      );
                    }
                  })}
                </nav>
              </Suspense>

              {/* Logout Button */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content - Wrap children in ErrorBoundary too */}
          <main className="flex-1 lg:mr-64">
            <div className="p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
