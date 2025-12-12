'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface UploadButtonProps {
  locale: string;
  isLoggedIn: boolean;
  userRole?: string;
}

export default function UploadButton({ locale, isLoggedIn, userRole }: UploadButtonProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Defensive logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[UploadButton] Component mounted. isLoggedIn:', isLoggedIn, 'role:', userRole);
    }
  }, [isLoggedIn, userRole]);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (process.env.NODE_ENV === 'development') {
      console.log('[UploadButton] Upload button clicked');
    }

    // 1. Check if the user is authenticated (session/user exists)
    const isAuthenticated = user !== null && user !== undefined;
    const isMaker = user?.role === 'MAKER' || userRole === 'MAKER';

    // 2. IF NOT authenticated -> Redirect to '/auth/signin'
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    // 3. IF authenticated -> Check if the user is a "Maker"
    if (isMaker) {
      // If YES (is Maker) -> Redirect to '/maker/dashboard'
      router.push(`/${locale}/maker/dashboard`);
    } else {
      // If NO (not Maker yet) -> Redirect to '/maker/join'
      router.push(`/${locale}/maker/join`);
    }
  };

  const texts = {
    ar: {
      upload: 'رفع المنتجات',
    },
    en: {
      upload: 'Upload',
    },
    zh: {
      upload: '上传',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <button
      onClick={handleUploadClick}
      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 relative z-[100] transition-colors"
      type="button"
    >
      {t.upload}
    </button>
  );
}
