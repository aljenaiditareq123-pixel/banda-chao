'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewVideoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'short' | 'long'>('short');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const supabase = createClient();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
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

      // Upload video file
      setUploadProgress(20);
      const videoExt = videoFile.name.split('.').pop();
      const videoFileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${videoExt}`;
      const videoFilePath = `videos/${videoFileName}`;

      const { error: videoUploadError } = await supabase.storage
        .from('avatars') // Using avatars bucket for now
        .upload(videoFilePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (videoUploadError) throw videoUploadError;

      const { data: videoUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(videoFilePath);

      setUploadProgress(60);

      // Upload thumbnail
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

      setUploadProgress(80);

      // Create video record in database
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          video_url: videoUrlData.publicUrl,
          thumbnail_url: thumbnailUrlData.publicUrl,
          duration,
          type,
        })
        .select()
        .single();

      if (videoError) throw videoError;

      setUploadProgress(100);
      router.push(`/videos/${video.id}`);
    } catch (err: any) {
      setError(err.message || '上传失败');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">上传视频</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Video Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频类型 *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'short' | 'long')}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          {loading && uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>上传进度</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? '上传中...' : '上传视频'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

