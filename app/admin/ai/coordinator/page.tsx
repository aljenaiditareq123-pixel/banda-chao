export const dynamic = 'force-dynamic';

export default function CoordinatorAIPage() {
  return (
    <div dir="rtl" lang="ar">
      <CoordinatorAIPageClient />
    </div>
  );
}

function CoordinatorAIPageClient() {
  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">المنسق (The Coordinator)</h1>
        <p className="text-gray-600 mb-6">الذكاء التشغيلي والأتمتة</p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <p className="text-gray-800 text-lg">
            مرحباً بك، أنا المنسق (The Coordinator). أنا متخصص في الذكاء التشغيلي والأتمتة.
          </p>
          <p className="text-gray-700 mt-4">
            يمكنني مساعدتك في:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>أتمتة الطلبات</li>
            <li>إدارة المخزون</li>
            <li>تنسيق الموردين</li>
            <li>مزامنة المحتوى</li>
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
