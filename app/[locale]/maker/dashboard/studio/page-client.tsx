'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import MakerLayout from '@/components/maker/MakerLayout';
import BandaStudio from '@/components/maker/BandaStudio';
import LoadingState from '@/components/common/LoadingState';

interface MakerStudioClientProps {
  locale: string;
}

export default function MakerStudioClient({ locale }: MakerStudioClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/${locale}/auth/login`);
        return;
      }
      if (user.role !== 'MAKER') {
        router.push(`/${locale}/maker/join`);
        return;
      }
    }
  }, [user, authLoading, locale, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!user || user.role !== 'MAKER') {
    return null;
  }

  const makerName = user.name || user.email?.split('@')[0] || 'Master Artisan';

  return (
    <MakerLayout locale={locale} makerName={makerName}>
      <BandaStudio locale={locale} />
    </MakerLayout>
  );
}
