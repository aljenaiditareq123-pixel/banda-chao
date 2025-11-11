import FounderAIAssistant from '@/components/FounderAIAssistant';

export const metadata = {
  title: 'مركز قيادة الباندا المؤسس',
};

export default function FounderDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-4 py-16 text-right text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            مركز قيادة الباندا المؤسس
          </h1>
          <p className="max-w-2xl text-sm text-gray-300">
            لوحة قيادة خاصة لمتابعة القرارات المصيرية، حيث يجتمع الذكاء الاصطناعي مع خبرتك لتوجيه
            نمو Banda Chao بخطوات استراتيجية.
          </p>
        </header>

        <FounderAIAssistant />
      </div>
    </div>
  );
}
