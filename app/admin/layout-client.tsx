'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if user is authorized (founder@banda-chao.com or has ADMIN/FOUNDER role)
      if (!user) {
        router.push('/auth/signin?callbackUrl=/admin');
        return;
      }

      const isAuthorized = 
        user.email === 'founder@banda-chao.com' ||
        user.role === 'ADMIN' ||
        user.role === 'FOUNDER';

      if (!isAuthorized) {
        router.push('/');
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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/signin');
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

  return (
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
              <p className="text-sm font-semibold text-gray-900">{user.name || user.email}</p>
              <p className="text-xs text-gray-600 mt-1">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {user.role === 'FOUNDER' ? 'مؤسس' : user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
              </p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

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

        {/* Main Content */}
        <main className="flex-1 lg:mr-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
