'use client';

/**
 * SIMPLIFIED ADMIN LAYOUT - STEP-BY-STEP RESTORATION
 * Restored sidebar and navigation, but WITHOUT complex logic:
 * - NO useAuth checks
 * - NO session management
 * - Static navigation links only
 * - Simple logout button (console.log for now)
 */
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Static menu items - no auth checks
  const menuItems = [
    { 
      href: '/admin', 
      label: 'لوحة التحكم', 
      icon: LayoutDashboard,
      exact: true 
    },
    { 
      href: '/admin/products', 
      label: 'المنتجات', 
      icon: Package 
    },
    { 
      href: '/admin/orders', 
      label: 'الطلبات', 
      icon: ShoppingCart 
    },
    { 
      href: '/admin/users', 
      label: 'المستخدمين', 
      icon: Users 
    },
  ];

  // Simple active link check - no complex logic
  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Simple logout - just console.log for now
  const handleLogout = () => {
    console.log('[AdminLayout] Logout clicked (simplified mode)');
    // TODO: Add actual logout logic later
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
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

            {/* User Info - Simplified (static) */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600 mt-1">admin@banda-chao.com</p>
              <p className="text-xs text-gray-500 mt-1">مدير</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    }`}
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
