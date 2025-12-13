'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ProductFormModalProps {
  product?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function ProductFormModal({
  product,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_zh: '',
    description: '',
    description_ar: '',
    description_zh: '',
    price: '',
    stock: '',
    image_url: '',
    external_images: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
  });

  const [externalImageUrl, setExternalImageUrl] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        name_ar: product.name_ar || '',
        name_zh: product.name_zh || '',
        description: product.description || '',
        description_ar: product.description_ar || '',
        description_zh: product.description_zh || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        image_url: product.image_url || '',
        external_images: [],
        colors: [],
        sizes: [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const addExternalImage = () => {
    if (externalImageUrl.trim()) {
      setFormData({
        ...formData,
        external_images: [...formData.external_images, externalImageUrl.trim()],
      });
      setExternalImageUrl('');
    }
  };

  const removeExternalImage = (index: number) => {
    setFormData({
      ...formData,
      external_images: formData.external_images.filter((_, i) => i !== index),
    });
  };

  const addColor = () => {
    const color = prompt('أدخل اللون:');
    if (color) {
      setFormData({
        ...formData,
        colors: [...formData.colors, color],
      });
    }
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const addSize = () => {
    const size = prompt('أدخل المقاس:');
    if (size) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, size],
      });
    }
  };

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (الإنجليزية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (العربية)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (الصينية)
                  </label>
                  <input
                    type="text"
                    value={formData.name_zh}
                    onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">التسعير والمخزون</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر الأساسي ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الكمية المتوفرة *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Mirror Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">صور المرآة (روابط خارجية)</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="أدخل رابط الصورة الخارجية (مثال: https://alicdn.com/image.jpg)"
                    value={externalImageUrl}
                    onChange={(e) => setExternalImageUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addExternalImage();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addExternalImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    إضافة
                  </button>
                </div>
                {formData.external_images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {formData.external_images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExternalImage(index)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Attributes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الخصائص</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الألوان</label>
                  <div className="space-y-2">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{color}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addColor}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + إضافة لون
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المقاسات</label>
                  <div className="space-y-2">
                    {formData.sizes.map((size, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{size}</span>
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSize}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + إضافة مقاس
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
