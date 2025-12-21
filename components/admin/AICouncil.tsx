'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Brain, 
  DollarSign, 
  TrendingUp, 
  Package,
  MessageCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  href: string;
  status: 'active' | 'inactive' | 'beta';
  features: string[];
}

export default function AICouncil() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const agents: AIAgent[] = [
    {
      id: 'advisor',
      name: 'The Advisor',
      nameAr: 'المستشار',
      description: 'Strategic intelligence and market analysis',
      descriptionAr: 'الذكاء الاستراتيجي وتحليل السوق',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      href: `/${locale}/admin/ai/advisor`,
      status: 'active',
      features: [
        'تحليل الاتجاهات السوقية',
        'توصيات استراتيجية',
        'تحليل سلوك المستخدمين',
        'تنبؤات المبيعات'
      ],
    },
    {
      id: 'treasurer',
      name: 'The Treasurer',
      nameAr: 'الخازن',
      description: 'Financial intelligence and pricing optimization',
      descriptionAr: 'الذكاء المالي وتحسين التسعير',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      href: `/${locale}/admin/ai/treasurer`,
      status: 'active',
      features: [
        'التسعير الديناميكي',
        'تحليل الربحية',
        'تحسين الإيرادات',
        'إدارة المحفظة الذكية'
      ],
    },
    {
      id: 'marketer',
      name: 'The Marketer',
      nameAr: 'المسوق',
      description: 'Marketing intelligence and growth optimization',
      descriptionAr: 'ذكاء التسويق وتحسين النمو',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      href: `/${locale}/admin/ai/marketer`,
      status: 'beta',
      features: [
        'تحليل النمو',
        'تحليل الزوار',
        'تحليل سلوك العملاء',
        'تحسين الحملات'
      ],
    },
    {
      id: 'coordinator',
      name: 'The Coordinator',
      nameAr: 'المنسق',
      description: 'Operational intelligence and automation',
      descriptionAr: 'الذكاء التشغيلي والأتمتة',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      href: `/${locale}/admin/ai/coordinator`,
      status: 'active',
      features: [
        'أتمتة الطلبات',
        'إدارة المخزون',
        'تنسيق الموردين',
        'مزامنة المحتوى'
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            نشط
          </span>
        );
      case 'beta':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            تجريبي
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            غير نشط
          </span>
        );
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-600" />
            مجلس الذكاء الاصطناعي
          </h2>
          <p className="text-gray-600 mt-2">
            فريق من الوكلاء الأذكياء لإدارة وتشغيل المنصة بكفاءة
          </p>
        </div>
      </div>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isHovered = hoveredAgent === agent.id;

          return (
            <Link
              key={agent.id}
              href={agent.href}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              className="group relative block"
            >
              <div
                className={`
                  ${agent.bgColor}
                  border-2 border-gray-200 group-hover:border-gray-300
                  rounded-xl p-6 transition-all duration-300
                  transform group-hover:scale-[1.02] group-hover:shadow-lg
                  h-full cursor-pointer
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${agent.color} p-3 rounded-lg bg-white shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{agent.nameAr}</h3>
                      <p className="text-sm text-gray-600">{agent.name}</p>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {agent.descriptionAr}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-gray-900">المميزات:</p>
                  <ul className="space-y-1">
                    {agent.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    التفاعل مع الوكيل
                  </span>
                  <MessageCircle className={`w-5 h-5 ${agent.color} transition-transform group-hover:translate-x-[-4px]`} />
                </div>

                {/* Hover Effect Indicator */}
                {isHovered && (
                  <div className="absolute top-4 left-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              حول مجلس الذكاء الاصطناعي
            </p>
            <p className="text-sm text-gray-700">
              كل وكيل متخصص في مجال محدد ويعمل بشكل مستقل ومتزامن مع باقي الوكلاء لتحقيق أقصى أداء للمنصة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
