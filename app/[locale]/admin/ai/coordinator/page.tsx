import { notFound } from 'next/navigation';
import VoiceInput from '@/components/ui/VoiceInput';

const validLocales = ['zh', 'en', 'ar'];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CoordinatorAIPage({ params }: PageProps) {
  let locale: string;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in coordinator page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <CoordinatorAIPageClient locale={locale} />;
}

function CoordinatorAIPageClient({ locale }: { locale: string }) {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المنسق (The Coordinator)</h1>
          <p className="text-gray-600 mb-6">الذكاء التشغيلي والأتمتة</p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <p className="text-gray-800 text-lg mb-4">
              مرحباً بك، أنا المنسق (The Coordinator). أنا متخصص في الذكاء التشغيلي والأتمتة.
            </p>
            <p className="text-gray-700 mb-2">يمكنني مساعدتك في:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>أتمتة الطلبات</li>
              <li>إدارة المخزون</li>
              <li>تنسيق الموردين</li>
              <li>مزامنة المحتوى</li>
            </ul>
          </div>

          {/* Voice Input Chat Interface */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">اسألني أي شيء 🎤</h2>
            <div className="space-y-4">
              <VoiceInput
                value=""
                onChange={(text) => {
                  console.log('User input:', text);
                  // TODO: Integrate with AI API
                }}
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
