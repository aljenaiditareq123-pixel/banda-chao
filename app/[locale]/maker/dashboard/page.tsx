'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import VideoUpload from '@/components/videos/VideoUpload';
import Button from '@/components/Button';
import { videosAPI, productsAPI, makersAPI } from '@/lib/api';
import { Video, Product, Maker } from '@/types';

interface MakerDashboardPageProps {
  params: {
    locale: string;
  };
}

export default function MakerDashboardPage({ params }: MakerDashboardPageProps) {
  const { locale } = params;
  const { user, loading: authLoading } = useAuth();
  const { t, setLanguage } = useLanguage();
  const router = useRouter();
  
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'short' | 'long' | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [maker, setMaker] = useState<Maker | null>(null);
  const [loading, setLoading] = useState(true);
  const [makerLoading, setMakerLoading] = useState(true);
  
  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formProfilePictureUrl, setFormProfilePictureUrl] = useState('');
  const [formCoverPictureUrl, setFormCoverPictureUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchMakerData();
    } else if (!authLoading) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading]);

  const fetchMakerData = async () => {
    if (!user) return;
    
    try {
      setMakerLoading(true);
      const response = await makersAPI.getMyMaker();
      const makerData = response.data?.maker;
      if (makerData) {
        setMaker({
          id: makerData.id,
          userId: makerData.userId,
          slug: makerData.slug,
          name: makerData.name,
          bio: makerData.bio,
          story: makerData.story,
          profilePictureUrl: makerData.profilePictureUrl,
          coverPictureUrl: makerData.coverPictureUrl,
          createdAt: makerData.createdAt,
          updatedAt: makerData.updatedAt,
          user: makerData.user,
          profilePicture: makerData.profilePictureUrl || makerData.user?.profilePicture,
          coverImage: makerData.coverPictureUrl,
        });
      } else {
        setMaker(null);
      }
    } catch (error) {
      console.error('Failed to fetch maker data:', error);
      setMaker(null);
    } finally {
      setMakerLoading(false);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user's videos
      const videosResponse = await videosAPI.getVideos();
      const videosData = videosResponse.data?.data || videosResponse.data || [];
      setVideos(videosData.filter((v: Video) => v.userId === user.id));
      
      // Fetch user's products
      const productsResponse = await productsAPI.getProducts();
      const productsData = productsResponse.data?.data || productsResponse.data || [];
      setProducts(productsData.filter((p: Product) => p.userId === user.id));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowVideoUpload(false);
    setUploadType(null);
    fetchData();
  };

  const handleCreateMaker = async () => {
    if (!formName.trim()) {
      alert(t('nameRequired') || 'الاسم مطلوب');
      return;
    }

    try {
      setFormSubmitting(true);
      const response = await makersAPI.createMaker({
        name: formName.trim(),
        bio: formBio.trim() || undefined,
        story: formStory.trim() || undefined,
        profilePictureUrl: formProfilePictureUrl.trim() || undefined,
        coverPictureUrl: formCoverPictureUrl.trim() || undefined,
      });

      const makerData = response.data?.maker;
      if (makerData) {
        setMaker({
          id: makerData.id,
          userId: makerData.userId,
          slug: makerData.slug,
          name: makerData.name,
          bio: makerData.bio,
          story: makerData.story,
          profilePictureUrl: makerData.profilePictureUrl,
          coverPictureUrl: makerData.coverPictureUrl,
          createdAt: makerData.createdAt,
          updatedAt: makerData.updatedAt,
          user: makerData.user,
          profilePicture: makerData.profilePictureUrl || makerData.user?.profilePicture,
          coverImage: makerData.coverPictureUrl,
        });
        setIsCreating(false);
        // Reset form
        setFormName('');
        setFormBio('');
        setFormStory('');
        setFormProfilePictureUrl('');
        setFormCoverPictureUrl('');
        alert(t('makerCreatedSuccess') || 'تم إنشاء ملف الحرفي بنجاح!');
      }
    } catch (error: any) {
      console.error('Failed to create maker:', error);
      alert(error.response?.data?.error || t('createMakerFailed') || 'فشل في إنشاء ملف الحرفي');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateMaker = async () => {
    try {
      setFormSubmitting(true);
      const response = await makersAPI.updateMyMaker({
        name: formName.trim() || undefined,
        bio: formBio.trim() || undefined,
        story: formStory.trim() || undefined,
        profilePictureUrl: formProfilePictureUrl.trim() || undefined,
        coverPictureUrl: formCoverPictureUrl.trim() || undefined,
      });

      const makerData = response.data?.maker;
      if (makerData) {
        setMaker({
          id: makerData.id,
          userId: makerData.userId,
          slug: makerData.slug,
          name: makerData.name,
          bio: makerData.bio,
          story: makerData.story,
          profilePictureUrl: makerData.profilePictureUrl,
          coverPictureUrl: makerData.coverPictureUrl,
          createdAt: makerData.createdAt,
          updatedAt: makerData.updatedAt,
          user: makerData.user,
          profilePicture: makerData.profilePictureUrl || makerData.user?.profilePicture,
          coverImage: makerData.coverPictureUrl,
        });
        setIsEditing(false);
        alert(t('makerUpdatedSuccess') || 'تم تحديث ملف الحرفي بنجاح!');
      }
    } catch (error: any) {
      console.error('Failed to update maker:', error);
      alert(error.response?.data?.error || t('updateMakerFailed') || 'فشل في تحديث ملف الحرفي');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setFormName('');
    setFormBio('');
    setFormStory('');
    setFormProfilePictureUrl('');
    setFormCoverPictureUrl('');
  };

  const handleStartEditing = () => {
    if (!maker) return;
    setIsEditing(true);
    setFormName(maker.name);
    setFormBio(maker.bio || '');
    setFormStory(maker.story || '');
    setFormProfilePictureUrl(maker.profilePictureUrl || '');
    setFormCoverPictureUrl(maker.coverPictureUrl || '');
  };

  if (authLoading || loading || makerLoading) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('makerDashboard') || 'لوحة تحكم الحرفي'}
            </h1>
            <p className="text-gray-600">
              {t('manageYourMakerProfile') || 'إدارة ملفك الحرفي ومحتواك'}
            </p>
          </div>

          {/* Maker Profile Status */}
          {maker ? (
            <>
              <div className="bg-white rounded-xl border-2 border-primary-200 shadow-lg p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-6">
                    {maker.profilePicture && (
                      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-primary-200 shadow-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={maker.profilePicture}
                          alt={maker.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{maker.name}</h2>
                      {maker.bio && (
                        <p className="text-base text-gray-600 mb-3">{maker.bio}</p>
                      )}
                      <Link
                        href={`/${locale}/makers/${maker.slug || maker.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <span>👁️</span>
                        <span>{t('viewPublicProfile') || 'عرض الملف العام'}</span>
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="primary" 
                      onClick={handleStartEditing} 
                      disabled={isEditing}
                      className="px-6"
                    >
                      {t('editProfile') || 'تعديل الملف'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="bg-white rounded-xl border-2 border-primary-300 shadow-lg p-6 md:p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <span className="text-2xl">✏️</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t('editMakerProfile') || 'تعديل ملف الحرفي'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('name') || 'الاسم'} *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('bio') || 'نبذة مختصرة'}
                      </label>
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t('makerBioPlaceholder') || 'اكتب نبذة مختصرة عنك...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('story') || 'القصة'}
                      </label>
                      <textarea
                        value={formStory}
                        onChange={(e) => setFormStory(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t('makerStoryPlaceholder') || 'اكتب قصة الحرفي...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profilePictureUrl') || 'رابط صورة الشخصية'}
                      </label>
                      <input
                        type="url"
                        value={formProfilePictureUrl}
                        onChange={(e) => setFormProfilePictureUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coverPictureUrl') || 'رابط صورة الغلاف'}
                      </label>
                      <input
                        type="url"
                        value={formCoverPictureUrl}
                        onChange={(e) => setFormCoverPictureUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={handleUpdateMaker}
                        disabled={formSubmitting}
                      >
                        {formSubmitting ? (t('saving') || 'جاري الحفظ...') : (t('saveChanges') || 'حفظ التعديلات')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormName('');
                          setFormBio('');
                          setFormStory('');
                          setFormProfilePictureUrl('');
                          setFormCoverPictureUrl('');
                        }}
                        disabled={formSubmitting}
                      >
                        {t('cancel') || 'إلغاء'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 shadow-lg p-8 md:p-12 mb-8 text-center">
                <div className="text-7xl mb-6">🎨</div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {t('notRegisteredAsMaker') || 'لم تقم بإنشاء ملف حرفي بعد'}
                </h2>
                <p className="text-base md:text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                  {t('becomeMakerDescription') || 'سجّل كحرفي لعرض منتجاتك ومحتواك على المنصة. شارك قصة حرفيتك مع العالم واجذب عملاء جدد.'}
                </p>
                <Button 
                  variant="primary" 
                  onClick={handleStartCreating} 
                  disabled={isCreating}
                  className="px-8 py-3 text-base font-semibold"
                >
                  {t('becomeMaker') || 'ابدأ كحرفي'}
                </Button>
              </div>

              {/* Create Form */}
              {isCreating && (
                <div className="bg-white rounded-xl border-2 border-primary-300 shadow-lg p-6 md:p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t('createMakerProfile') || 'إنشاء ملف حرفي'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('name') || 'الاسم'} *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                        placeholder={t('makerNamePlaceholder') || 'اسم الحرفي'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('bio') || 'نبذة مختصرة'}
                      </label>
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t('makerBioPlaceholder') || 'اكتب نبذة مختصرة عنك...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('story') || 'القصة'}
                      </label>
                      <textarea
                        value={formStory}
                        onChange={(e) => setFormStory(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t('makerStoryPlaceholder') || 'اكتب قصة الحرفي...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profilePictureUrl') || 'رابط صورة الشخصية'}
                      </label>
                      <input
                        type="url"
                        value={formProfilePictureUrl}
                        onChange={(e) => setFormProfilePictureUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coverPictureUrl') || 'رابط صورة الغلاف'}
                      </label>
                      <input
                        type="url"
                        value={formCoverPictureUrl}
                        onChange={(e) => setFormCoverPictureUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={handleCreateMaker}
                        disabled={formSubmitting || !formName.trim()}
                      >
                        {formSubmitting ? (t('creating') || 'جاري الإنشاء...') : (t('create') || 'إنشاء')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreating(false);
                          setFormName('');
                          setFormBio('');
                          setFormStory('');
                          setFormProfilePictureUrl('');
                          setFormCoverPictureUrl('');
                        }}
                        disabled={formSubmitting}
                      >
                        {t('cancel') || 'إلغاء'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('totalVideos') || 'إجمالي الفيديوهات'}</p>
                  <p className="text-3xl font-bold text-gray-900">{videos.length}</p>
                </div>
                <div className="h-14 w-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('totalProducts') || 'إجمالي المنتجات'}</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="h-14 w-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('totalViews') || 'إجمالي المشاهدات'}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {videos.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-14 w-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('totalLikes') || 'إجمالي الإعجابات'}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {videos.reduce((sum, v) => sum + (v.likes || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-14 w-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">❤️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Buttons */}
          {!showVideoUpload && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => {
                  setUploadType('short');
                  setShowVideoUpload(true);
                }}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-primary-600 hover:bg-primary-50 transition"
              >
                <div className="text-4xl mb-3">🎬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">上传短视频</h3>
                <p className="text-sm text-gray-600">最多60秒，用于吸引注意力</p>
              </button>
              <button
                onClick={() => {
                  setUploadType('long');
                  setShowVideoUpload(true);
                }}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-primary-600 hover:bg-primary-50 transition"
              >
                <div className="text-4xl mb-3">📹</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">上传长视频</h3>
                <p className="text-sm text-gray-600">最多10分钟，用于记录制作过程</p>
              </button>
            </div>
          )}

          {/* Video Upload Form */}
          {showVideoUpload && uploadType && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {uploadType === 'short' ? '上传短视频' : '上传长视频'}
                </h2>
                <Button
                  variant="text"
                  onClick={() => {
                    setShowVideoUpload(false);
                    setUploadType(null);
                  }}
                >
                  取消
                </Button>
              </div>
              <VideoUpload
                type={uploadType}
                onSuccess={handleUploadSuccess}
                onCancel={() => {
                  setShowVideoUpload(false);
                  setUploadType(null);
                }}
              />
            </div>
          )}

          {/* Videos List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">我的视频</h2>
            {videos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">还没有上传视频</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{video.type === 'short' ? '短视频' : '长视频'}</span>
                        <span>{video.views} 次观看</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">我的产品</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">还没有添加产品</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <div className="aspect-square bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-primary-600">
                        {product.price ? `¥${product.price.toFixed(2)}` : '价格待定'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

