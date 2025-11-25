'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

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
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('bandaChao_isLoggedIn');
      if (isLoggedIn === 'true') {
        router.push(`/${locale}`);
      }
    }
  }, [locale, router]);

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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock signup - save to localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bandaChao_isLoggedIn', 'true');
        localStorage.setItem('bandaChao_userEmail', email);
        localStorage.setItem('bandaChao_userName', name);
        // Default role is BUYER (can be upgraded to MAKER via /maker/join)
        localStorage.setItem('bandaChao_userRole', 'BUYER');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Signup] User created:', { email, name, role: 'BUYER' });
        }
        
        // Redirect to login (or home)
        router.push(`/${locale}/login`);
      }
    } catch (err) {
      setError(
        locale === 'ar' 
          ? 'حدث خطأ أثناء إنشاء الحساب'
          : locale === 'zh'
          ? '创建账户时出错'
          : 'Error creating account'
      );
    } finally {
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              minLength={6}
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
