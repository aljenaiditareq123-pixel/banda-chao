'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Maker, Product, Video } from '@/types';
import Button from '@/components/Button';

interface MakerOnboardingChecklistProps {
  locale: string;
  maker: Maker | null;
  products: Product[];
  videos: Video[];
}

export default function MakerOnboardingChecklist({ locale, maker, products, videos }: MakerOnboardingChecklistProps) {
  const { t } = useLanguage();
  
  // Define requirements for going live
  const requirements = [
    {
      id: 'profile',
      label: t('makerRequirementProfile') || 'إكمال معلومات الملف الشخصي',
      completed: !!maker && !!maker.name && !!maker.bio,
      action: maker ? 'edit' : 'create',
      description: t('makerRequirementProfileDesc') || 'أضف اسمك ونبذة مختصرة عنك',
    },
    {
      id: 'firstProduct',
      label: t('makerRequirementFirstProduct') || 'إضافة أول منتج',
      completed: products.length > 0,
      action: 'add_product',
      description: t('makerRequirementFirstProductDesc') || 'أضف منتجك الأول ليظهر في متجرك',
    },
    {
      id: 'firstVideo',
      label: t('makerRequirementFirstVideo') || 'إضافة أول فيديو',
      completed: videos.length > 0,
      action: 'add_video',
      description: t('makerRequirementFirstVideoDesc') || 'شارك فيديو يظهر مهاراتك أو منتجاتك',
    },
    {
      id: 'profilePicture',
      label: t('makerRequirementProfilePicture') || 'إضافة صورة شخصية',
      completed: !!maker?.profilePictureUrl || !!maker?.profilePicture,
      action: 'add_picture',
      description: t('makerRequirementProfilePictureDesc') || 'أضف صورة شخصية لملفك',
    },
    {
      id: 'story',
      label: t('makerRequirementStory') || 'إضافة قصة الحرفي',
      completed: !!maker?.story && maker.story.length > 50,
      action: 'add_story',
      description: t('makerRequirementStoryDesc') || 'شارك قصة حرفيتك (50 حرف على الأقل)',
    },
  ];

  const completedCount = requirements.filter(r => r.completed).length;
  const totalRequirements = requirements.length;
  const progressPercentage = (completedCount / totalRequirements) * 100;
  const isReadyToGoLive = completedCount >= 3; // At least 3 requirements completed

  if (completedCount === totalRequirements) {
    // All requirements met - show success state
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg p-6 md:p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">✅</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('makerReadyToGoLive') || 'جاهز للانطلاق! 🎉'}
            </h3>
            <p className="text-gray-700">
              {t('makerReadyToGoLiveDesc') || 'لقد أكملت جميع المتطلبات. متجرك جاهز للظهور للعملاء!'}
            </p>
          </div>
        </div>
        {maker && (
          <Link href={`/${locale}/makers/${maker.slug || maker.id}`}>
            <Button variant="primary" className="w-full sm:w-auto">
              {t('viewPublicProfile') || 'عرض الملف العام'} →
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-primary-200 shadow-lg p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('makerOnboardingChecklist') || 'قائمة متطلبات الحرفي'}
          </h3>
          <p className="text-sm text-gray-600">
            {t('makerOnboardingChecklistDesc') || 'أكمل المتطلبات التالية لبدء البيع على المنصة'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600">
            {completedCount}/{totalRequirements}
          </div>
          <div className="text-sm text-gray-600">{t('completed') || 'مكتمل'}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {t('progress') || 'التقدم'}: {Math.round(progressPercentage)}%
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {requirements.map((requirement) => (
          <div
            key={requirement.id}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition ${
              requirement.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {requirement.completed ? (
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              ) : (
                <div className="h-6 w-6 border-2 border-gray-400 rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold mb-1 ${
                  requirement.completed ? 'text-gray-700 line-through' : 'text-gray-900'
                }`}
              >
                {requirement.label}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
              {!requirement.completed && (
                <div className="flex gap-2 mt-2">
                  {requirement.action === 'edit' && (
                    <Link href={`/${locale}/maker/dashboard`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        {t('completeNow') || 'أكمل الآن'} →
                      </Button>
                    </Link>
                  )}
                  {requirement.action === 'create' && (
                    <Link href={`/${locale}/maker/dashboard`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        {t('becomeMaker') || 'ابدأ كحرفي'} →
                      </Button>
                    </Link>
                  )}
                  {requirement.action === 'add_product' && (
                    <Link href={`/${locale}/products/new`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        {t('addProduct') || 'إضافة منتج'} →
                      </Button>
                    </Link>
                  )}
                  {requirement.action === 'add_video' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Trigger video upload modal (handled by parent)
                        window.dispatchEvent(new CustomEvent('maker-dashboard-upload-video'));
                      }}
                    >
                      {t('uploadVideo') || 'رفع فيديو'} →
                    </Button>
                  )}
                  {requirement.action === 'add_picture' && (
                    <Link href={`/${locale}/maker/dashboard`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        {t('addPicture') || 'إضافة صورة'} →
                      </Button>
                    </Link>
                  )}
                  {requirement.action === 'add_story' && (
                    <Link href={`/${locale}/maker/dashboard`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        {t('addStory') || 'إضافة قصة'} →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Status Message */}
      {isReadyToGoLive && completedCount < totalRequirements && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">
            <span className="font-semibold">✨ {t('makerAlmostReady') || 'أنت تقريباً جاهز!'}</span>
            <br />
            {t('makerAlmostReadyDesc') || 'أكمل المتطلبات المتبقية لتحسين ملفك الشخصي'}
          </p>
        </div>
      )}

      {!isReadyToGoLive && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">⚠️ {t('makerNotReady') || 'ليس جاهزاً بعد'}</span>
            <br />
            {t('makerNotReadyDesc') || 'أكمل على الأقل 3 متطلبات لبدء البيع'}
          </p>
        </div>
      )}
    </div>
  );
}

