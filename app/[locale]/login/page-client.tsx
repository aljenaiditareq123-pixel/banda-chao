'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { authAPI } from '@/lib/api';

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
    if (typeof window !== 'undefined' && !loading) {
      const isLoggedIn = localStorage.getItem('bandaChao_isLoggedIn');
      const token = localStorage.getItem('auth_token');
      if (isLoggedIn === 'true' && token) {
        // Already logged in, redirect to home
        router.push(`/${locale}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

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

    try {
      // Call the actual login API
      const response = await authAPI.login({ email: email.trim(), password });

      if (response.token && response.user) {
        // Store authentication data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('bandaChao_isLoggedIn', 'true');
          localStorage.setItem('bandaChao_userEmail', response.user.email);
          localStorage.setItem('bandaChao_userName', response.user.name || email.split('@')[0] || 'User');
          localStorage.setItem('bandaChao_userRole', response.user.role || 'BUYER');
          localStorage.setItem('bandaChao_user', JSON.stringify(response.user));
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Login] User logged in:', { 
              email: response.user.email, 
              role: response.user.role,
              token: response.token.substring(0, 20) + '...'
            });
          }
          
          // Trigger a custom event to notify other components (like Navbar) that auth state changed
          window.dispatchEvent(new Event('authStateChanged'));
          
          // Redirect based on role
          if (response.user.role === 'FOUNDER') {
            router.push('/founder');
          } else {
            router.push(`/${locale}`);
          }
          router.refresh();
        }
      } else {
        setError(
          locale === 'ar' 
            ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.'
            : locale === 'zh'
            ? '登录失败。请检查您的凭据。'
            : 'Login failed. Please check your credentials.'
        );
      }
    } catch (err: any) {
      console.error('[Login] Error:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      setError(
        errorMessage || (
          locale === 'ar' 
            ? 'حدث خطأ أثناء تسجيل الدخول'
            : locale === 'zh'
            ? '登录时出错'
            : 'Error during login'
        )
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
              disabled={loading}
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={loading}
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
