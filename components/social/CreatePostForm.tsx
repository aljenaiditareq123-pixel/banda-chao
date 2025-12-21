'use client';

import { useState, useRef, useEffect } from 'react';
import { postsAPI, productsAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';

interface CreatePostFormProps {
  locale: string;
  onPostCreated?: () => void;
  onCancel?: () => void;
}

interface Product {
  id: string;
  name: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
}

export default function CreatePostForm({
  locale,
  onPostCreated,
  onCancel,
}: CreatePostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    try {
      const response = await postsAPI.uploadImage(file);
      if (response.success && response.imageUrl) {
        setImages((prev) => [...prev, response.imageUrl!]);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to upload image');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (locale === 'ar' ? 'فشل رفع الصورة' : locale === 'zh' ? '上传图片失败' : 'Failed to upload image');
      console.error('Error uploading image:', err);
      setError(errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          handleImageUpload(file);
        }
      });
    }
  };

  // Fetch user's products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;
      
      setLoadingProducts(true);
      try {
        const response = await productsAPI.getAll({
          limit: 100, // Get user's products
          makerId: user.id,
        });
        if (response.products && Array.isArray(response.products)) {
          setAvailableProducts(response.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [user?.id]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0 && selectedProducts.length === 0) {
      setError(locale === 'ar' ? 'الرجاء إدخال محتوى أو رفع صورة أو اختيار منتج' : locale === 'zh' ? '请输入内容、上传图片或选择产品' : 'Please enter content, upload an image, or select a product');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await postsAPI.create({
        content: content.trim() || undefined,
        images: images.length > 0 ? images : undefined,
        productIds: selectedProducts.length > 0 ? selectedProducts : undefined,
      });

      if (response.success) {
        // Clear form
        setContent('');
        setImages([]);
        setSelectedProducts([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        throw new Error(response.error || (locale === 'ar' ? 'فشل إنشاء المنشور' : locale === 'zh' ? '创建帖子失败' : 'Failed to create post'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (locale === 'ar' ? 'فشل إنشاء المنشور' : locale === 'zh' ? '创建帖子失败' : 'Failed to create post');
      console.error('Error creating post:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const texts = {
    ar: {
      placeholder: 'ماذا تريد أن تشارك؟',
      addImage: 'إضافة صورة',
      addProduct: 'إضافة منتج',
      removeImage: 'إزالة',
      submit: 'نشر',
      submitting: 'جاري النشر...',
      cancel: 'إلغاء',
      selectProduct: 'اختر منتجاً',
      selectedProducts: 'المنتجات المحددة',
      noProducts: 'لا توجد منتجات',
      loadingProducts: 'جاري تحميل المنتجات...',
    },
    en: {
      placeholder: 'What do you want to share?',
      addImage: 'Add Image',
      addProduct: 'Tag Product',
      removeImage: 'Remove',
      submit: 'Post',
      submitting: 'Posting...',
      cancel: 'Cancel',
      selectProduct: 'Select a product',
      selectedProducts: 'Selected Products',
      noProducts: 'No products available',
      loadingProducts: 'Loading products...',
    },
    zh: {
      placeholder: '你想分享什么？',
      addImage: '添加图片',
      addProduct: '标记产品',
      removeImage: '删除',
      submit: '发布',
      submitting: '发布中...',
      cancel: '取消',
      selectProduct: '选择产品',
      selectedProducts: '选定的产品',
      noProducts: '没有可用产品',
      loadingProducts: '加载产品中...',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        placeholder={t.placeholder}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        disabled={isSubmitting}
      />

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product Selector */}
      {user && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowProductSelector(!showProductSelector)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            disabled={isSubmitting || loadingProducts}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            {t.addProduct}
            {selectedProducts.length > 0 && (
              <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs">
                {selectedProducts.length}
              </span>
            )}
          </button>

          {showProductSelector && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
              {loadingProducts ? (
                <p className="text-sm text-gray-500 text-center">{t.loadingProducts}</p>
              ) : availableProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">{t.noProducts}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t.selectProduct}</p>
                  {availableProducts.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border-2 transition-colors ${
                        selectedProducts.includes(product.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        disabled={isSubmitting}
                      />
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        {product.price && (
                          <p className="text-xs text-gray-500">
                            {product.price} {product.currency || 'USD'}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Products Preview */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((productId) => {
                const product = availableProducts.find((p) => p.id === productId);
                if (!product) return null;
                return (
                  <div
                    key={productId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm"
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span className="text-gray-900">{product.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleProduct(productId)}
                      className="text-gray-500 hover:text-red-500"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="post-image-upload"
            disabled={isSubmitting}
          />
          <label
            htmlFor="post-image-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t.addImage}
          </label>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || (!content.trim() && images.length === 0 && selectedProducts.length === 0)}
          >
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}

