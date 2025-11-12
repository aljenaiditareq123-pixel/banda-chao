'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UploadType = 'video' | 'product';

export default function UploadPage() {
  const [uploadType, setUploadType] = useState<UploadType>('video');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Video form state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoType, setVideoType] = useState<'short' | 'long'>('short');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productTaobaoLink, setProductTaobaoLink] = useState('');
  const [productJdLink, setProductJdLink] = useState('');
  const [productUploadProgress, setProductUploadProgress] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Video handlers
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const getVideoDuration = (videoElement: HTMLVideoElement): Promise<number> => {
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(Math.round(videoElement.duration));
      };
    });
  };

  // Product handlers
  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const url = URL.createObjectURL(file);
      setProductImagePreview(url);
    }
  };

  // Video submit
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setVideoUploadProgress(0);

    try {
      if (!user) {
        throw new Error('请先登录');
      }

      if (!videoFile) {
        throw new Error('请选择视频文件');
      }

      if (!thumbnailFile) {
        throw new Error('请选择缩略图');
      }

      // Get video duration
      let duration = 0;
      if (videoRef.current && videoPreview) {
        try {
          duration = await getVideoDuration(videoRef.current);
        } catch (err) {
          console.error('Error getting duration:', err);
          duration = 60; // Default duration
        }
      }

      // Upload video file to Supabase Storage
      setVideoUploadProgress(20);
      const videoExt = videoFile.name.split('.').pop();
      const videoFileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${videoExt}`;
      const videoFilePath = `videos/${videoFileName}`;

      const { error: videoUploadError } = await supabase.storage
        .from('avatars') // Using avatars bucket (can be changed to 'videos' bucket if created)
        .upload(videoFilePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (videoUploadError) throw videoUploadError;

      const { data: videoUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(videoFilePath);

      setVideoUploadProgress(60);

      // Upload thumbnail to Supabase Storage
      const thumbnailExt = thumbnailFile.name.split('.').pop();
      const thumbnailFileName = `${user.id}-${Date.now()}-thumb-${Math.random().toString(36).substring(7)}.${thumbnailExt}`;
      const thumbnailFilePath = `thumbnails/${thumbnailFileName}`;

      const { error: thumbnailUploadError } = await supabase.storage
        .from('avatars')
        .upload(thumbnailFilePath, thumbnailFile);

      if (thumbnailUploadError) throw thumbnailUploadError;

      const { data: thumbnailUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(thumbnailFilePath);

      setVideoUploadProgress(80);

      // Add video to database
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: videoTitle,
          description: videoDescription || null,
          video_url: videoUrlData.publicUrl,
          thumbnail_url: thumbnailUrlData.publicUrl,
          duration,
          type: videoType,
        })
        .select()
        .single();

      if (videoError) throw videoError;

      setVideoUploadProgress(100);
      setSuccessMessage('视频上传成功！');

      // Redirect after 2 seconds
      setTimeout(() => {
        setRedirecting(true);
        router.push(`/videos/${video.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || '上传失败，请重试');
      setVideoUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  // Product submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setProductUploadProgress(0);

    try {
      if (!user) {
        throw new Error('请先登录');
      }

      // Create product in database first
      setProductUploadProgress(30);
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: productName,
          description: productDescription,
          price: parseFloat(productPrice),
          category: productCategory,
          taobao_link: productTaobaoLink || null,
          jd_link: productJdLink || null,
          image_url: null, // Will be set after image upload
        })
        .select()
        .single();

      if (productError) throw productError;

      setProductUploadProgress(60);

      // Upload product image to Supabase Storage
      if (productImage && product) {
        const fileExt = productImage.name.split('.').pop();
        const fileName = `${product.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: imageUploadError } = await supabase.storage
          .from('avatars') // Using avatars bucket (can be changed to 'products' bucket if created)
          .upload(filePath, productImage);

        if (imageUploadError) throw imageUploadError;

        const { data: imageUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update product with image URL
        await supabase
          .from('products')
          .update({ image_url: imageUrlData.publicUrl })
          .eq('id', product.id);
      }

      setProductUploadProgress(100);
      setSuccessMessage('商品创建成功！');

      // Redirect after 2 seconds
      setTimeout(() => {
        setRedirecting(true);
        router.push(`/products/${product.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || '创建失败，请重试');
      setProductUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">上传内容</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <span>{successMessage}</span>
            {redirecting && (
              <span className="text-sm">正在跳转...</span>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setUploadType('video')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                uploadType === 'video'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              上传视频
            </button>
            <button
              onClick={() => setUploadType('product')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                uploadType === 'product'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              添加商品
            </button>
          </div>
        </div>

        {/* Video Upload Form */}
        {uploadType === 'video' && (
          <form onSubmit={handleVideoSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">上传视频</h2>

            {/* Video Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频类型 *
              </label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value as 'short' | 'long')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="short">短视频 (&lt; 3分钟)</option>
                <option value="long">长视频 (&gt; 3分钟)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="输入视频标题"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="描述您的视频..."
              />
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频文件 *
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              {videoPreview && (
                <div className="mt-4">
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    controls
                    className="w-full max-w-md rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缩略图 *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              {thumbnailPreview && (
                <div className="mt-4">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full max-w-md rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {submitting && videoUploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>上传进度</span>
                  <span>{videoUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? '上传中...' : '上传视频'}
              </button>
            </div>
          </form>
        )}

        {/* Product Upload Form */}
        {uploadType === 'product' && (
          <form onSubmit={handleProductSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">添加商品</h2>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品名称 *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="输入商品名称"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述 *
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="描述您的商品..."
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格 (¥) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">选择分类</option>
                  <option value="电子产品">电子产品</option>
                  <option value="时尚">时尚</option>
                  <option value="家居">家居</option>
                  <option value="运动">运动</option>
                  <option value="美食">美食</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品图片 *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageChange}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              {productImagePreview && (
                <div className="mt-4">
                  <img
                    src={productImagePreview}
                    alt="Product preview"
                    className="w-full max-w-md rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  淘宝链接
                </label>
                <input
                  type="url"
                  value={productTaobaoLink}
                  onChange={(e) => setProductTaobaoLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="https://www.taobao.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  京东链接
                </label>
                <input
                  type="url"
                  value={productJdLink}
                  onChange={(e) => setProductJdLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="https://item.jd.com/..."
                />
              </div>
            </div>

            {/* Upload Progress */}
            {submitting && productUploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>上传进度</span>
                  <span>{productUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${productUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? '创建中...' : '创建商品'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


