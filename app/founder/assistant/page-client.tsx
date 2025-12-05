'use client';

import FounderChatPanel from '@/components/founder/FounderChatPanel';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Button from '@/components/Button';

export default function FounderAssistantPageClient() {
  const { user, loading } = useAuth();

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐼</span>
          <h1 className="text-xl font-bold text-gray-900">الباندا المستشار</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/founder">
            <Button variant="secondary" className="text-sm">
              لوحة التحكم الرئيسية
            </Button>
          </Link>
          <Link href="/founder/dashboard">
            <Button variant="secondary" className="text-sm">
              لوحة العمليات
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <FounderChatPanel user={user} loading={loading} />
      </div>
    </div>
  );
}





