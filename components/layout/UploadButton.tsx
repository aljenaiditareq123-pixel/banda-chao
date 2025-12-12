'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UploadButtonProps {
  locale: string;
  isLoggedIn: boolean;
  userRole?: string;
}

export default function UploadButton({ locale, isLoggedIn, userRole }: UploadButtonProps) {
  const router = useRouter();

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

    // If not logged in, redirect to signin
    if (!isLoggedIn) {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    // If logged in but not a maker, redirect to maker join
    if (userRole !== 'MAKER') {
      router.push(`/${locale}/maker/join`);
      return;
    }

    // If logged in as maker, go to dashboard (where they can upload)
    router.push(`/${locale}/maker/dashboard`);
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

