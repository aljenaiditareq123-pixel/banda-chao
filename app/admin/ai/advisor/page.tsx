export const dynamic = 'force-dynamic';

export default function AdvisorAIPage() {
  return (
    <div dir="rtl" lang="ar">
      <AdvisorAIPageClient />
    </div>
  );
}

function AdvisorAIPageClient() {
  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">المستشار (The Advisor)</h1>
        <p className="text-gray-600 mb-6">الذكاء الاستراتيجي وتحليل السوق</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-gray-800 text-lg">
            مرحباً بك، أنا المستشار (The Advisor). أنا متخصص في التحليل الاستراتيجي وتحليل السوق.
          </p>
          <p className="text-gray-700 mt-4">
            يمكنني مساعدتك في:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>تحليل الاتجاهات السوقية</li>
            <li>توصيات استراتيجية</li>
            <li>تحليل سلوك المستخدمين</li>
            <li>تنبؤات المبيعات</li>
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
