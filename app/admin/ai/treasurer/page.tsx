export const dynamic = 'force-dynamic';

export default function TreasurerAIPage() {
  return (
    <div dir="rtl" lang="ar">
      <TreasurerAIPageClient />
    </div>
  );
}

function TreasurerAIPageClient() {
  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الخازن (The Treasurer)</h1>
        <p className="text-gray-600 mb-6">الذكاء المالي وتحسين التسعير</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <p className="text-gray-800 text-lg">
            مرحباً بك، أنا الخازن (The Treasurer). أنا متخصص في الذكاء المالي وتحسين التسعير.
          </p>
          <p className="text-gray-700 mt-4">
            يمكنني مساعدتك في:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>التسعير الديناميكي</li>
            <li>تحليل الربحية</li>
            <li>تحسين الإيرادات</li>
            <li>إدارة المحفظة الذكية</li>
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
