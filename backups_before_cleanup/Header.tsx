'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/start" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">Banda Chao</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition">
              首页
            </Link>
            <Link href="/videos/short" className="text-gray-700 hover:text-red-600 transition">
              短视频
            </Link>
            <Link href="/videos/long" className="text-gray-700 hover:text-red-600 transition">
              长视频
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-red-600 transition">
              商品
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-red-600 transition">
              搜索
            </Link>
            {user && (
              <>
                <Link href="/chat" className="text-gray-700 hover:text-red-600 transition">
                  聊天
                </Link>
                <Link href="/feed" className="text-gray-700 hover:text-red-600 transition">
                  动态
                </Link>
                <Link href="/videos/new" className="text-gray-700 hover:text-red-600 transition">
                  上传视频
                </Link>
                <Link href="/products/new" className="text-gray-700 hover:text-red-600 transition">
                  添加商品
                </Link>
              </>
            )}
            <Link href="/ai/dashboard" className="text-gray-700 hover:text-red-600 transition">
              🤖 AI助手
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm">
                      {(user.name || user.email)?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.name || '我的账户'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
