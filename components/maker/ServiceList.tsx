'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import { formatCurrency } from '@/lib/formatCurrency';
import { servicesAPI } from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER';
  created_at?: string;
}

interface ServiceListProps {
  locale: string;
  onRefresh?: () => void;
}

export default function ServiceList({ locale, onRefresh }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'DRIVER' as 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.getAll();
      if (response.success && response.services) {
        setServices(response.services);
      } else {
        setError(response.error || 'Failed to load services');
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({ title: '', description: '', price: '', type: 'DRIVER' });
    setShowForm(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      type: service.type,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      setError(locale === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError(locale === 'ar' ? 'السعر غير صحيح' : 'Invalid price');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price,
        type: formData.type as 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER',
      };

      let response;
      if (editingService) {
        response = await servicesAPI.update(editingService.id, serviceData);
      } else {
        response = await servicesAPI.create(serviceData);
      }

      if (response.success) {
        setShowForm(false);
        setEditingService(null);
        await fetchServices();
        if (onRefresh) onRefresh();
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل الحفظ' : 'Failed to save'));
      }
    } catch (err: any) {
      console.error('Error saving service:', err);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving service'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      setDeletingId(serviceId);
      setError(null);

      const response = await servicesAPI.delete(serviceId);
      if (response.success) {
        await fetchServices();
        if (onRefresh) onRefresh();
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل الحذف' : 'Failed to delete'));
      }
    } catch (err: any) {
      console.error('Error deleting service:', err);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting service'));
    } finally {
      setDeletingId(null);
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

  const texts = {
    ar: {
      title: 'خدماتي',
      addNew: 'إضافة خدمة جديدة',
      noServices: 'لا توجد خدمات بعد',
      description: 'عرض خدماتك غير الملموسة (النقل، الوكالة، الحرف)',
      emptyDescription: 'ابدأ بإضافة خدماتك الأولى مثل خدمات النقل أو الوكالة',
      edit: 'تعديل',
      delete: 'حذف',
      deleting: 'جاري الحذف...',
    },
    en: {
      title: 'My Services',
      addNew: 'Add New Service',
      noServices: 'No services yet',
      description: 'Showcase your intangible services (Transport, Agency, Artisan)',
      emptyDescription: 'Start by adding your first service like transport or agency services',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
    },
    zh: {
      title: '我的服务',
      addNew: '添加新服务',
      noServices: '还没有服务',
      description: '展示您的无形服务（运输、代理、手工艺）',
      emptyDescription: '开始添加您的第一项服务，如运输或代理服务',
      edit: '编辑',
      delete: '删除',
      deleting: '删除中...',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {error && !showForm && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.description}</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={handleAdd}>
            {t.addNew}
          </Button>
        )}
      </div>

      {showForm ? (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingService 
                ? (locale === 'ar' ? 'تعديل الخدمة' : locale === 'zh' ? '编辑服务' : 'Edit Service')
                : (locale === 'ar' ? 'إضافة خدمة جديدة' : locale === 'zh' ? '添加新服务' : 'Add New Service')}
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'العنوان' : locale === 'zh' ? '标题' : 'Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={locale === 'ar' ? 'مثال: خدمة النقل السريع' : 'e.g., Fast Transport Service'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'الوصف' : locale === 'zh' ? '描述' : 'Description'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={locale === 'ar' ? 'وصف الخدمة...' : 'Describe your service...'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'السعر' : locale === 'zh' ? '价格' : 'Price'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'النوع' : locale === 'zh' ? '类型' : 'Type'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="DRIVER">{getServiceTypeLabel('DRIVER')}</option>
                    <option value="AGENT">{getServiceTypeLabel('AGENT')}</option>
                    <option value="ARTISAN">{getServiceTypeLabel('ARTISAN')}</option>
                    <option value="TECH">{getServiceTypeLabel('TECH')}</option>
                    <option value="MEDIA">{getServiceTypeLabel('MEDIA')}</option>
                    <option value="EDUCATION">{getServiceTypeLabel('EDUCATION')}</option>
                    <option value="OTHER">{getServiceTypeLabel('OTHER')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="text"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  {locale === 'ar' ? 'إلغاء' : locale === 'zh' ? '取消' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? (locale === 'ar' ? 'جاري الحفظ...' : locale === 'zh' ? '保存中...' : 'Saving...')
                    : (locale === 'ar' ? 'حفظ' : locale === 'zh' ? '保存' : 'Save')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noServices}</h3>
            <p className="text-gray-500 mb-6">{t.emptyDescription}</p>
            <Button variant="primary" onClick={handleAdd}>
              {t.addNew}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getServiceTypeIcon(service.type)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{service.title}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getServiceTypeLabel(service.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(service.price, 'USD', locale)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="text"
                      className="text-sm"
                      onClick={() => handleEdit(service)}
                    >
                      {t.edit}
                    </Button>
                    <Button
                      variant="text"
                      className="text-sm text-red-600 hover:text-red-700"
                      disabled={deletingId === service.id}
                      onClick={() => {
                        if (confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
                          handleDelete(service.id);
                        }
                      }}
                    >
                      {deletingId === service.id ? t.deleting : t.delete}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
