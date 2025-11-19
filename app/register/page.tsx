'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getApiBaseUrl } from '@/lib/api-utils';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { t, language } = useLanguage();
  
  // Get redirect parameter from URL, default to home page
  const redirectTo = searchParams.get('redirect') || `/${language || 'ar'}`;
  
  // RTL support for Arabic
  const isRTL = language === 'ar';

  const handleGoogleSignup = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get API base URL using centralized helper
      const baseUrl = getApiBaseUrl();

      // Call backend OAuth endpoint - backend will handle all validation
      const res = await fetch(`${baseUrl}/oauth/google`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        let message = 'Google OAuth failed';
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
          else if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const data = await res.json();

      // Backend returns { authUrl, callbackUrl }
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Google OAuth URL not returned from backend');
      }
    } catch (err: any) {
      console.error('[Register] Google OAuth error:', err);
      setError(err?.message || t('registerGoogleError') || 'Google OAuth error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate password match
    if (password !== confirmPassword) {
      setError(t('registerPasswordMismatch'));
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(t('registerPasswordTooShort'));
      setLoading(false);
      return;
    }

    try {
      // إنشاء حساب جديد باستخدام Express API
      await register(email, password, name || undefined);

      // After successful registration, redirect to redirect URL or homepage
      setSuccess(true);
      
      // Wait a bit then go to redirect URL or homepage
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1200);
    } catch (error: any) {
      // Better error handling for different error types
      let errorMessage = t('registerError') || 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى';
      
      if (error.response) {
        const status = error.response.status;
        const backendError = error.response.data?.error || error.response.data?.message;
        
        if (status === 404) {
          errorMessage = 'خادم الواجهة الخلفية غير متاح. يرجى المحاولة لاحقاً.';
        } else if (status === 400) {
          if (backendError?.includes('already exists') || backendError?.includes('User already exists')) {
            errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
          } else {
            errorMessage = backendError || 'بيانات غير صحيحة. يرجى التحقق من المعلومات.';
          }
        } else if (status >= 500) {
          errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          errorMessage = backendError || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.request) {
        errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? 'rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`max-w-md w-full ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t('registerTitle') || 'إنشاء حساب جديد'}
            </h2>
            <p className="text-gray-600">
              {t('registerSubtitle') || 'لديك حساب بالفعل؟'}{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700 transition">
                {t('registerLoginLink') || 'تسجيل الدخول'}
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>{t('registerSuccessMessage') || 'تم إنشاء الحساب بنجاح!'}</span>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('registerNameLabel') || 'الاسم'}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={t('registerNamePlaceholder') || 'أدخل اسمك'}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('registerEmailLabel') || 'البريد الإلكتروني'}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={t('registerEmailPlaceholder') || 'example@email.com'}
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('registerPasswordLabel') || 'كلمة المرور'}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={t('registerPasswordPlaceholder') || '••••••••'}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('registerConfirmPasswordLabel') || 'تأكيد كلمة المرور'}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={t('registerConfirmPasswordPlaceholder') || '••••••••'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('registerButtonLoading') || 'جاري الإنشاء...'}
                  </>
                ) : success ? (
                  t('registerButtonSuccess') || 'تم الإنشاء!'
                ) : (
                  t('registerButton') || 'إنشاء حساب'
                )}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">{t('registerOr') || 'أو'}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading || success}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('registerGoogleButton') || 'التسجيل بواسطة Google'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

