'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

interface LoginPageClientProps {
  locale: string;
}

export default function LoginPageClient({ locale }: LoginPageClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('bandaChao_isLoggedIn');
      if (isLoggedIn === 'true') {
        // Already logged in, redirect to home
        router.push(`/${locale}`);
      }
    }
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError(
        locale === 'ar' 
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
          : locale === 'zh'
          ? '请输入电子邮件和密码'
          : 'Please enter email and password'
      );
      setLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock login - save to localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bandaChao_isLoggedIn', 'true');
        localStorage.setItem('bandaChao_userEmail', email);
        localStorage.setItem('bandaChao_userName', email.split('@')[0] || 'User');
        // Default role is BUYER (can be upgraded to MAKER via /maker/join)
        localStorage.setItem('bandaChao_userRole', 'BUYER');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Login] User logged in:', { email, role: 'BUYER' });
        }
        
        // Redirect to home or products
        router.push(`/${locale}/products`);
        router.refresh();
      }
    } catch (err) {
      setError(
        locale === 'ar' 
          ? 'حدث خطأ أثناء تسجيل الدخول'
          : locale === 'zh'
          ? '登录时出错'
          : 'Error during login'
      );
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    ar: {
      title: 'تسجيل الدخول',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      noAccount: 'ليس لديك حساب؟',
      signUp: 'إنشاء حساب',
    },
    en: {
      title: 'Log In',
      email: 'Email',
      password: 'Password',
      submit: 'Log In',
      noAccount: "Don&apos;t have an account?",
      signUp: 'Sign Up',
    },
    zh: {
      title: '登录',
      email: '电子邮件',
      password: '密码',
      submit: '登录',
      noAccount: '没有账户？',
      signUp: '注册',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t.title}</h1>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t.email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t.password}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (locale === 'ar' ? 'جاري المعالجة...' : locale === 'zh' ? '处理中...' : 'Processing...') : t.submit}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t.noAccount}{' '}
            <Link href={`/${locale}/signup`} className="text-primary hover:underline">
              {t.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
