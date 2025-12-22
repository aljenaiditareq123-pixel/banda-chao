'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Upload, Video, XCircle } from 'lucide-react';
import VoiceInput from '@/components/ui/VoiceInput';
import VoiceTextarea from '@/components/ui/VoiceTextarea';
import { videoUploadAPI } from '@/lib/api';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);
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
    video_url: '',
    external_images: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    category: '',
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
        video_url: product.video_url || '',
        external_images: [],
        colors: [],
        sizes: [],
      });
      setVideoUrl(product.video_url || '');
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        video_url: videoUrl || formData.video_url,
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

  const handleAnalyzeWithAI = async () => {
    const imageUrl = formData.image_url || externalImageUrl;
    
    if (!imageUrl.trim()) {
      alert('يرجى إدخال رابط الصورة أولاً');
      return;
    }

    try {
      setAnalyzing(true);
      
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/v1/ai-content/analyze-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: imageUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'فشل التحليل');
      }

      const analysis = data.analysis;

      // Auto-fill form fields
      setFormData({
        ...formData,
        name: analysis.name || formData.name,
        name_ar: analysis.name_ar || formData.name_ar,
        name_zh: analysis.name_zh || formData.name_zh,
        description: analysis.description || formData.description,
        description_ar: analysis.description_ar || formData.description_ar,
        description_zh: analysis.description_zh || formData.description_zh,
        price: analysis.suggestedPrice ? analysis.suggestedPrice.toFixed(2) : formData.price,
        category: analysis.category || formData.category,
        // If image_url was empty, set it from the analyzed URL
        image_url: formData.image_url || imageUrl.trim(),
      });

      // Show success message
      alert(`✅ تم التحليل بنجاح!\nالثقة: ${analysis.confidence}%\nالفئة المقترحة: ${analysis.category}`);
    } catch (error: any) {
      console.error('Error analyzing with AI:', error);
      alert(`❌ فشل التحليل: ${error.message || 'حدث خطأ'}`);
    } finally {
      setAnalyzing(false);
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

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        alert('نوع الملف غير مدعوم. يرجى اختيار فيديو بصيغة MP4, WebM, MOV أو AVI');
        return;
      }

      // Validate file size (500MB max)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        alert('حجم الملف كبير جداً. الحد الأقصى 500MB');
        return;
      }

      setVideoFile(file);
      handleVideoUpload(file);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setUploadingVideo(true);
      setVideoUploadProgress(0);

      const result = await videoUploadAPI.uploadSimple(file, (progress) => {
        setVideoUploadProgress(progress);
      });

      if (result.success && result.videoUrl) {
        setVideoUrl(result.videoUrl);
        setFormData({ ...formData, video_url: result.videoUrl });
        alert('✅ تم رفع الفيديو بنجاح!');
      } else {
        throw new Error(result.error || 'فشل رفع الفيديو');
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      alert(`❌ فشل رفع الفيديو: ${error.message || 'حدث خطأ'}`);
      setVideoFile(null);
      setVideoUrl('');
    } finally {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
      // Reset file input
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoUrl('');
    setFormData({ ...formData, video_url: '' });
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
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
                    الاسم (الإنجليزية) * 🎤
                  </label>
                  <VoiceInput
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    placeholder="اسم المنتج بالإنجليزية..."
                    lang="en-US"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (العربية) 🎤
                  </label>
                  <VoiceInput
                    value={formData.name_ar}
                    onChange={(value) => setFormData({ ...formData, name_ar: value })}
                    placeholder="اسم المنتج بالعربية..."
                    lang="ar-SA"
                    className="w-full"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="سيتم اقتراحها تلقائياً"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف * 🎤
                </label>
                <VoiceTextarea
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="وصف المنتج بالعربية..."
                  lang="ar-SA"
                  rows={4}
                  className="w-full"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Main Image URL */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">رابط الصورة الرئيسية</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="أدخل رابط الصورة (مثال: https://alicdn.com/image.jpg)"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={analyzing || !formData.image_url.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحليل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>✨ Analyze with AI</span>
                      </>
                    )}
                  </button>
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">فيديو المنتج</h3>
              <div className="space-y-4">
                {/* Video Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={handleVideoFileSelect}
                    disabled={uploadingVideo}
                    className="hidden"
                    id="video-upload-input"
                  />
                  <label
                    htmlFor="video-upload-input"
                    className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Video className="w-12 h-12 text-gray-400" />
                    <div>
                      <span className="text-blue-600 font-medium">اضغط لرفع فيديو</span>
                      <span className="text-gray-500"> أو اسحب الملف هنا</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      MP4, WebM, MOV أو AVI (حد أقصى 500MB)
                    </p>
                  </label>

                  {/* Progress Bar */}
                  {uploadingVideo && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">جاري الرفع...</span>
                        <span className="text-sm font-medium text-blue-600">{videoUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Video Preview */}
                  {videoUrl && !uploadingVideo && (
                    <div className="mt-4 relative">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-w-md mx-auto rounded-lg"
                      >
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        ✅ تم رفع الفيديو بنجاح
                      </div>
                    </div>
                  )}

                  {/* Selected File Name (before upload) */}
                  {videoFile && !uploadingVideo && !videoUrl && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Video className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-700">{videoFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
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
