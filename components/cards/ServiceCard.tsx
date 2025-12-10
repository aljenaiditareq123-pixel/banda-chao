import Link from 'next/link';
import Card from '@/components/common/Card';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER';
  created_at?: string;
  makers?: {
    id: string;
    displayName: string;
    country?: string;
    avatarUrl?: string;
  };
}

interface ServiceCardProps {
  service: Service;
  href: string;
  locale?: string;
}

export default function ServiceCard({ service, href, locale = 'en' }: ServiceCardProps) {
  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'DRIVER':
        return '🚚';
      case 'AGENT':
        return '🤝';
      case 'ARTISAN':
        return '🎨';
      case 'TECH':
        return '💻';
      case 'MEDIA':
        return '📸';
      case 'EDUCATION':
        return '📚';
      case 'OTHER':
        return '📦';
      default:
        return '📦';
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const labels = {
      ar: {
        DRIVER: 'خدمة النقل',
        AGENT: 'خدمة الوكيل',
        ARTISAN: 'خدمة الحرفي',
        TECH: 'خدمة تقنية/برمجة',
        MEDIA: 'خدمة إعلامية/تصوير',
        EDUCATION: 'خدمة تعليمية/ترجمة',
        OTHER: 'خدمة أخرى',
      },
      en: {
        DRIVER: 'Transport Service',
        AGENT: 'Agent Service',
        ARTISAN: 'Artisan Service',
        TECH: 'Technology/Programming',
        MEDIA: 'Media/Photography',
        EDUCATION: 'Education/Translation',
        OTHER: 'Other Service',
      },
      zh: {
        DRIVER: '运输服务',
        AGENT: '代理服务',
        ARTISAN: '手工艺服务',
        TECH: '技术/编程',
        MEDIA: '媒体/摄影',
        EDUCATION: '教育/翻译',
        OTHER: '其他服务',
      },
    };
    return labels[locale as keyof typeof labels]?.[type as keyof typeof labels.ar] || type;
  };

  return (
    <Link href={href} className="block">
      <Card hover>
        <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
          <span className="text-6xl">{getServiceTypeIcon(service.type)}</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {getServiceTypeLabel(service.type)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {service.title}
          </h3>
          {service.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            {service.price && (
              <p className="text-lg font-bold text-primary">
                {formatPrice(service.price, 'USD')}
              </p>
            )}
            {service.makers?.displayName && (
              <p className="text-sm text-gray-500 truncate">
                {locale === 'ar' ? 'بواسطة' : locale === 'zh' ? '由' : 'By'} {service.makers.displayName}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
