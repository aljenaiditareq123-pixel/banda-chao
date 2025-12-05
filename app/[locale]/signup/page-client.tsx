'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { authAPI } from '@/lib/api';

interface SignupPageClientProps {
  locale: string;
}

export default function SignupPageClient({ locale }: SignupPageClientProps) {
  const router = useRouter();
  const [name, setName] = useState('');
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
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(
        locale === 'ar' 
          ? 'يرجى ملء جميع الحقول'
          : locale === 'zh'
          ? '请填写所有字段'
          : 'Please fill all fields'
      );
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        locale === 'ar' 
          ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
          : locale === 'zh'
          ? '密码必须至少6个字符'
          : 'Password must be at least 6 characters'
      );
      setLoading(false);
      return;
    }

    try {
      // Call the actual register API
      const response = await authAPI.register({
        email: email.trim(),
        password,
        name: name.trim(),
        role: 'BUYER', // Default role
      });

      if (response.token && response.user) {
        // Store authentication data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('bandaChao_isLoggedIn', 'true');
          localStorage.setItem('bandaChao_userEmail', response.user.email);
          localStorage.setItem('bandaChao_userName', response.user.name || name);
          localStorage.setItem('bandaChao_userRole', response.user.role || 'BUYER');
          localStorage.setItem('bandaChao_user', JSON.stringify(response.user));
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Signup] User created and logged in:', { 
              email: response.user.email, 
              name: response.user.name,
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
            ? 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.'
            : locale === 'zh'
            ? '创建账户失败。请重试。'
            : 'Failed to create account. Please try again.'
        );
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[Signup] Error:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      setError(
        errorMessage || (
          locale === 'ar' 
            ? 'حدث خطأ أثناء إنشاء الحساب'
            : locale === 'zh'
            ? '创建账户时出错'
            : 'Error creating account'
        )
      );
      setLoading(false);
    }
  };

  const texts = {
    ar: {
      title: 'إنشاء حساب',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'إنشاء حساب',
      haveAccount: 'لديك حساب بالفعل؟',
      logIn: 'تسجيل الدخول',
    },
    en: {
      title: 'Sign Up',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      submit: 'Sign Up',
      haveAccount: 'Already have an account?',
      logIn: 'Log In',
    },
    zh: {
      title: '注册',
      name: '姓名',
      email: '电子邮件',
      password: '密码',
      submit: '注册',
      haveAccount: '已有账户？',
      logIn: '登录',
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
              {t.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              autoComplete="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={t.name}
            />
          </div>

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
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
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
            {t.haveAccount}{' '}
            <Link href={`/${locale}/login`} className="text-primary hover:underline">
              {t.logIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
