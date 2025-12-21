import { notFound } from 'next/navigation';
import VoiceInput from '@/components/ui/VoiceInput';

const validLocales = ['zh', 'en', 'ar'];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export default async function MarketerAIPage({ params }: PageProps) {
  let locale: string;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in marketer page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <MarketerAIPageClient locale={locale} />;
}

'use client';

import { useState } from 'react';

function MarketerAIPageClient({ locale }: { locale: string }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المسوق (The Marketer)</h1>
          <p className="text-gray-600 mb-6">ذكاء التسويق وتحسين النمو</p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
            <p className="text-gray-800 text-lg mb-4">
              مرحباً بك، أنا المسوق (The Marketer). أنا متخصص في ذكاء التسويق وتحسين النمو.
            </p>
            <p className="text-gray-700 mb-2">يمكنني مساعدتك في:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>تحليل النمو</li>
              <li>تحليل الزوار</li>
              <li>تحليل سلوك العملاء</li>
              <li>تحسين الحملات</li>
            </ul>
          </div>

          {/* Voice Input Chat Interface */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">اسألني أي شيء 🎤</h2>
            <div className="space-y-4">
              <VoiceInput
                value={inputValue}
                onChange={setInputValue}
                placeholder="اضغط على الميكروفون للتحدث أو اكتب سؤالك هنا..."
                lang="ar-SA"
                onTranscriptionStart={() => console.log('Started listening...')}
                onTranscriptionEnd={() => console.log('Stopped listening...')}
                onError={(error) => console.error('Voice error:', error)}
              />
              <div className="text-sm text-gray-500 text-center">
                💡 نصيحة: اضغط على زر الميكروفون 🎤 واتركه يستمع، ثم ابدأ بالتحدث بشكل واضح.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
