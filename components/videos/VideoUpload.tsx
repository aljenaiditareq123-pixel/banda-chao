'use client';

import { useState, useRef, useEffect } from 'react';
import { videosAPI, productsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Product } from '@/types';

interface VideoUploadProps {
  type?: 'short' | 'long';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VideoUpload({ type: initialType, onSuccess, onCancel }: VideoUploadProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [type, setType] = useState<'short' | 'long'>(initialType || 'short');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's products
  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    try {
      const response = await productsAPI.getProducts();
      const products = response.data?.data || response.data || [];
      setAvailableProducts(products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // Get video duration
  const getVideoDuration = (videoElement: HTMLVideoElement): Promise<number> => {
    return new Promise((resolve, reject) => {
      videoElement.addEventListener('loadedmetadata', () => {
        resolve(videoElement.duration);
      });
      videoElement.addEventListener('error', reject);
    });
  };

  // Handle video file selection
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError(t('selectVideoFileError') || 'Please select a video file');
      return;
    }

    // Validate duration based on type
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      const fileDuration = video.duration;
      const maxDuration = type === 'short' ? 60 : 600; // 60s for short, 600s (10min) for long
      
      if (fileDuration > maxDuration) {
        setError(
          type === 'short' 
            ? t('shortVideoMaxDuration') || 'Short video cannot exceed 60 seconds'
            : t('longVideoMaxDuration') || 'Long video cannot exceed 10 minutes'
        );
        URL.revokeObjectURL(video.src);
        return;
      }

      setVideoFile(file);
      setDuration(Math.floor(fileDuration));
      setVideoPreview(URL.createObjectURL(file));
      URL.revokeObjectURL(video.src);
    };
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('selectImageFileError') || 'Please select an image file');
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // Upload file to backend (simplified - assumes backend handles file upload)
  const uploadFile = async (file: File, type: 'video' | 'thumbnail'): Promise<string> => {
    // In a real implementation, you would upload to your backend/storage
    // For now, we'll use a placeholder URL
    // You should replace this with actual file upload logic
    return new Promise((resolve) => {
      // Simulate upload
      setTimeout(() => {
        // In production, this should be the actual uploaded file URL
        const url = URL.createObjectURL(file);
        resolve(url);
      }, 1000);
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (!user) {
        throw new Error(t('pleaseLogin') || 'Please log in first');
      }

      if (!videoFile || !thumbnailFile) {
        throw new Error(t('selectVideoAndThumbnail') || 'Please select video and thumbnail');
      }

      if (!title.trim()) {
        throw new Error(t('enterVideoTitle') || 'Please enter video title');
      }

      if (duration === 0) {
        throw new Error(t('cannotGetDuration') || 'Cannot get video duration');
      }

      // Validate duration limits
      const maxDuration = type === 'short' ? 60 : 600;
      if (duration > maxDuration) {
        throw new Error(
          type === 'short' 
            ? t('shortVideoMaxDuration') || 'Short video cannot exceed 60 seconds'
            : t('longVideoMaxDuration') || 'Long video cannot exceed 10 minutes'
        );
      }

      setUploadProgress(20);

      // Upload video file
      const videoUrl = await uploadFile(videoFile, 'video');
      setUploadProgress(50);

      // Upload thumbnail file
      const thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnail');
      setUploadProgress(70);

      // Create video record
      const videoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        videoUrl,
        thumbnailUrl,
        duration,
        type,
        productIds: selectedProducts.length > 0 ? selectedProducts : undefined,
      };

      setUploadProgress(80);
      const response = await videosAPI.createVideo(videoData);
      setUploadProgress(100);

      // Reset form
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview(null);
      setThumbnailPreview(null);
      setDuration(0);
      setSelectedProducts([]);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t('uploadFailed') || 'Upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isRTL = language === 'ar';

  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {initialType && (
        <h2 className="text-2xl font-semibold text-gray-900">
          {type === 'short' ? t('uploadShortVideo') : t('uploadLongVideo')}
        </h2>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#2E7D32] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Type Selection - Only show if type not pre-selected */}
        {!initialType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('videoType') || 'Video Type'} *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setType('short');
                  setVideoFile(null);
                  setVideoPreview(null);
                  setDuration(0);
                  setError(null);
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                  type === 'short'
                    ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{t('shortVideos')}</div>
                <div className="text-xs mt-1">{t('maxDurationShort') || t('shortVideoDescription')}</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('long');
                  setVideoFile(null);
                  setVideoPreview(null);
                  setDuration(0);
                  setError(null);
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                  type === 'long'
                    ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{t('longVideos')}</div>
                <div className="text-xs mt-1">{t('maxDurationLong') || t('longVideoDescription')}</div>
              </button>
            </div>
          </div>
        )}

        {/* Video File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('videoFile') || 'Video File'} *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            {videoPreview ? (
              <video
                ref={videoRef}
                src={videoPreview}
                controls
                className="max-h-44 rounded"
              />
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">{t('selectVideoFile') || 'Click to select video file'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {type === 'short' ? t('maxDurationShort') || t('shortVideoDescription') : t('maxDurationLong') || t('longVideoDescription')}
                </p>
              </>
            )}
          </label>
          {duration > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {t('duration') || 'Duration'}: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('thumbnail') || 'Thumbnail'} *
          </label>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="max-h-28 rounded"
              />
            ) : (
              <>
                <svg
                  className="w-10 h-10 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">{t('selectThumbnail') || 'Click to select thumbnail'}</p>
              </>
            )}
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('videoTitle') || 'Title'} *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('videoTitlePlaceholder') || 'Enter video title'}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('videoDescription') || 'Description'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
            placeholder={t('videoDescriptionPlaceholder') || 'Describe your video...'}
          />
        </div>

        {/* Product Selection */}
        {availableProducts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('linkProducts') || 'Link Products (Optional)'}
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {availableProducts.map((product) => {
                const productPrice = product.price 
                  ? new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : language === 'zh' ? 'zh-CN' : 'en-US', {
                      style: 'currency',
                      currency: language === 'ar' ? 'AED' : language === 'en' ? 'USD' : 'CNY',
                      maximumFractionDigits: 2,
                    }).format(product.price!)
                  : t('priceTBD');
                return (
                  <label
                    key={product.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="w-4 h-4 text-[#2E7D32] border-gray-300 rounded focus:ring-[#2E7D32]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {productPrice}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedProducts.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {t('selectedProductsCount')?.replace('{count}', selectedProducts.length.toString()) || `${selectedProducts.length} products selected`}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              {t('cancel') || 'Cancel'}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={loading || !videoFile || !thumbnailFile || !title.trim()}
          >
            {loading ? (t('uploading') || 'Uploading...') : t('uploadVideo')}
          </Button>
        </div>
      </form>
    </div>
  );
}

