export const dynamic = 'force-dynamic';

export default function MarketerAIPage() {
  return (
    <div dir="rtl" lang="ar">
      <MarketerAIPageClient />
    </div>
  );
}

function MarketerAIPageClient() {
  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">المسوق (The Marketer)</h1>
        <p className="text-gray-600 mb-6">ذكاء التسويق وتحسين النمو</p>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <p className="text-gray-800 text-lg">
            مرحباً بك، أنا المسوق (The Marketer). أنا متخصص في ذكاء التسويق وتحسين النمو.
          </p>
          <p className="text-gray-700 mt-4">
            يمكنني مساعدتك في:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>تحليل النمو</li>
            <li>تحليل الزوار</li>
            <li>تحليل سلوك العملاء</li>
            <li>تحسين الحملات</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 text-center">
            واجهة الشات التفاعلية قيد التطوير... 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
