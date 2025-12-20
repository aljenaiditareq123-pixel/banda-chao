'use client';

import { useState, useRef } from 'react';
import Button from '@/components/Button';
import { productsAPI, CreateProductData, UpdateProductData } from '@/lib/api';
import Card from '@/components/common/Card';

interface AddProductFormProps {
  locale: string;
  onSuccess: () => void;
  onCancel: () => void;
  product?: {
    id: string;
    name: string;
    description: string;
    price?: number;
    category?: string;
    image_url?: string;
    external_link?: string;
  } | null;
}

export default function AddProductForm({ locale, onSuccess, onCancel, product }: AddProductFormProps) {
  const isEditing = !!product;
  
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState(product?.category || '');
  const [externalLink, setExternalLink] = useState(product?.external_link || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'CNY', label: 'CNY (¥)' },
    { value: 'SAR', label: 'SAR (ر.س)' },
    { value: 'AED', label: 'AED (د.إ)' },
  ];

  const categories = [
    { value: '', label: '' },
    { value: 'handmade', label: 'Handmade' },
    { value: 'art', label: 'Art' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Decor' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'other', label: 'Other' },
  ];

  const texts = {
    ar: {
      title: isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد',
      name: 'اسم المنتج',
      namePlaceholder: 'أدخل اسم المنتج',
      description: 'الوصف',
      descriptionPlaceholder: 'وصف المنتج...',
      price: 'السعر',
      pricePlaceholder: '0.00',
      currency: 'العملة',
      category: 'الفئة',
      categoryPlaceholder: 'اختر الفئة',
      externalLink: 'رابط خارجي (اختياري)',
      externalLinkPlaceholder: 'https://...',
      image: 'صورة المنتج',
      imagePlaceholder: 'اختر صورة',
      imageChange: 'تغيير الصورة',
      submit: isEditing ? 'حفظ التغييرات' : 'إضافة المنتج',
      cancel: 'إلغاء',
      success: isEditing ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!',
      nameRequired: 'اسم المنتج مطلوب',
      descriptionRequired: 'الوصف مطلوب',
      priceInvalid: 'السعر يجب أن يكون رقماً صحيحاً',
      imageRequired: 'صورة المنتج مطلوبة',
      submitting: isEditing ? 'جاري الحفظ...' : 'جاري الإضافة...',
      generateDescription: 'اكتب الوصف بالذكاء الاصطناعي',
      generatingDescription: 'جاري الكتابة...',
      nameRequiredForAI: 'يرجى كتابة اسم المنتج أولاً',
      analyzeImage: '👁️ تحليل الصورة وتعبئة البيانات',
      analyzingImage: 'جاري التحليل...',
    },
    en: {
      title: isEditing ? 'Edit Product' : 'Add New Product',
      name: 'Product Name',
      namePlaceholder: 'Enter product name',
      description: 'Description',
      descriptionPlaceholder: 'Product description...',
      price: 'Price',
      pricePlaceholder: '0.00',
      currency: 'Currency',
      category: 'Category',
      categoryPlaceholder: 'Select category',
      externalLink: 'External Link (optional)',
      externalLinkPlaceholder: 'https://...',
      image: 'Product Image',
      imagePlaceholder: 'Choose image',
      imageChange: 'Change Image',
      submit: isEditing ? 'Save Changes' : 'Add Product',
      cancel: 'Cancel',
      success: isEditing ? 'Product updated successfully!' : 'Product added successfully!',
      nameRequired: 'Product name is required',
      descriptionRequired: 'Description is required',
      priceInvalid: 'Price must be a valid number',
      imageRequired: 'Product image is required',
      submitting: isEditing ? 'Saving...' : 'Adding...',
      generateDescription: 'Write Description with AI',
      generatingDescription: 'Generating...',
      nameRequiredForAI: 'Please enter product name first',
      analyzeImage: '👁️ Analyze Image & Fill Data',
      analyzingImage: 'Analyzing...',
    },
    zh: {
      title: isEditing ? '编辑产品' : '添加新产品',
      name: '产品名称',
      namePlaceholder: '输入产品名称',
      description: '描述',
      descriptionPlaceholder: '产品描述...',
      price: '价格',
      pricePlaceholder: '0.00',
      currency: '货币',
      category: '类别',
      categoryPlaceholder: '选择类别',
      externalLink: '外部链接（可选）',
      externalLinkPlaceholder: 'https://...',
      image: '产品图片',
      imagePlaceholder: '选择图片',
      imageChange: '更改图片',
      submit: isEditing ? '保存更改' : '添加产品',
      cancel: '取消',
      success: isEditing ? '产品更新成功！' : '产品添加成功！',
      nameRequired: '产品名称是必需的',
      descriptionRequired: '描述是必需的',
      priceInvalid: '价格必须是有效数字',
      imageRequired: '产品图片是必需的',
      submitting: isEditing ? '保存中...' : '添加中...',
      generateDescription: '使用AI编写描述',
      generatingDescription: '生成中...',
      nameRequiredForAI: '请先输入产品名称',
      analyzeImage: '👁️ 分析图片并填充数据',
      analyzingImage: '分析中...',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select an image file' });
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 10MB' });
        return;
      }
      setImageFile(file);
      setErrors({ ...errors, image: '' });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imagePreview && !imageFile) {
      setErrors({ ...errors, image: locale === 'ar' ? 'يرجى رفع صورة أولاً' : locale === 'zh' ? '请先上传图片' : 'Please upload an image first' });
      return;
    }

    try {
      setAnalyzingImage(true);
      setErrors({ ...errors, image: '' });

      // Convert image to base64
      let imageBase64: string | null = null;

      if (imageFile) {
        // Convert file to base64
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } else if (imagePreview) {
        // Use preview as base64 (it's already base64)
        imageBase64 = imagePreview;
      }

      if (!imageBase64) {
        throw new Error('Failed to convert image to base64');
      }

      // Send to API
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();

      // Fill empty fields only (don't overwrite existing data)
      if (data.name && !name.trim()) {
        setName(data.name);
      }
      if (data.category && !category) {
        setCategory(data.category);
      }
      if (data.description && !description.trim()) {
        setDescription(data.description);
      }

      // Note: We're not storing the color in the form, but we could add it later if needed
      console.log('Image analysis result:', data);
    } catch (error: unknown) {
      console.error('Error analyzing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
      setErrors({ ...errors, image: errorMessage });
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleGenerateDescription = async () => {
    // Check if product name is filled
    if (!name.trim()) {
      setErrors({ ...errors, name: t.nameRequiredForAI });
      return;
    }

    try {
      setGeneratingDescription(true);
      setErrors({ ...errors, description: '' });

      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: name.trim(),
          category: category || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const data = await response.json();
      if (data.description) {
        setDescription(data.description);
      } else {
        throw new Error('No description received');
      }
    } catch (error: unknown) {
      console.error('Error generating description:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate description';
      setErrors({ ...errors, description: errorMessage });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!description.trim()) {
      newErrors.description = t.descriptionRequired;
    }

    if (price && isNaN(parseFloat(price)) || (price && parseFloat(price) < 0)) {
      newErrors.price = t.priceInvalid;
    }

    if (!isEditing && !imageFile && !imagePreview) {
      newErrors.image = t.imageRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const productData: CreateProductData | UpdateProductData = {
        name: name.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : undefined,
        currency,
        category: category || undefined,
        external_link: externalLink || undefined,
        ...(imageFile && { image: imageFile }),
      };

      let result;
      if (isEditing && product) {
        result = await productsAPI.update(product.id, productData);
      } else {
        result = await productsAPI.create(productData as CreateProductData);
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setGlobalError(result.error || 'Failed to save product');
      }
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product';
      setGlobalError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.title}</h2>

          {globalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {globalError}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-medium">{t.success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: '' });
                }}
                placeholder={t.namePlaceholder}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t.description} *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription || !name.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 border border-purple-200 disabled:border-gray-200"
                >
                  {generatingDescription ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>{t.generatingDescription}</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>{t.generateDescription}</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: '' });
                }}
                placeholder={t.descriptionPlaceholder}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.price}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors({ ...errors, price: '' });
                  }}
                  placeholder={t.pricePlaceholder}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.currency}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {currencies.map((curr) => (
                    <option key={curr.value} value={curr.value}>
                      {curr.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label || (locale === 'ar' ? 'بدون فئة' : locale === 'zh' ? '无类别' : 'No category')}
                  </option>
                ))}
              </select>
            </div>

            {/* External Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.externalLink}
              </label>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder={t.externalLinkPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.image} {!isEditing && '*'}
              </label>
              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAnalyzeImage}
                      disabled={analyzingImage}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 border border-blue-200 disabled:border-gray-200"
                    >
                      {analyzingImage ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>{t.analyzingImage}</span>
                        </>
                      ) : (
                        <span>{t.analyzeImage}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {t.imageChange}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-sm text-gray-600">{t.imagePlaceholder}</p>
                    </div>
                  </label>
                </div>
              )}
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || success}
                className="flex-1"
              >
                {submitting ? t.submitting : t.submit}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                {t.cancel}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

