'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

interface OnboardingSectionProps {
  locale: string;
}

export default function OnboardingSection({ locale }: OnboardingSectionProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Check if user has seen onboarding
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('banda_chao_onboarding_seen');
      const isNewVisitor = !hasSeenOnboarding && !user;
      
      // Show onboarding for new visitors or if explicitly requested
      if (isNewVisitor) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('banda_chao_onboarding_seen', 'true');
    }
    setShowOnboarding(false);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  const handleSkip = () => {
    handleDismiss();
  };

  if (!showOnboarding) {
    // Show "Getting Started" banner for returning users who haven't seen it
    if (user && typeof window !== 'undefined' && !localStorage.getItem('banda_chao_getting_started_seen')) {
      return (
        <section className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 rounded-2xl border-2 border-primary-200 p-6 md:p-8 mb-12">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-right">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('gettingStartedTitle') || 'مرحباً بك في Banda Chao!'}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('gettingStartedDescription') || 'اكتشف كيف يمكنك الاستفادة من المنصة: تصفح الحرفيين، استكشف المنتجات، شاهد الفيديوهات، واتبع المبدعين'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link href={`/${locale}/makers`}>
                  <Button variant="secondary" className="text-sm">
                    {t('exploreMakers') || 'استكشف الحرفيين'}
                  </Button>
                </Link>
                <Link href={`/${locale}/products`}>
                  <Button variant="secondary" className="text-sm">
                    {t('browseProducts') || 'تصفح المنتجات'}
                  </Button>
                </Link>
                <Link href={`/${locale}/videos`}>
                  <Button variant="secondary" className="text-sm">
                    {t('watchVideos') || 'شاهد الفيديوهات'}
                  </Button>
                </Link>
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('banda_chao_getting_started_seen', 'true');
                }
                setShowOnboarding(false);
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
              aria-label={t('close') || 'إغلاق'}
            >
              ×
            </button>
          </div>
        </section>
      );
    }
    return null;
  }

  // Full onboarding flow for new visitors
  const steps = [
    {
      title: t('onboardingStep1Title') || 'What is Banda Chao?',
      description: t('onboardingStep1Description') || 'Banda Chao is a social-commerce home for independent artisans, connecting makers with buyers who love handmade and artisanal products.',
      icon: '🎨',
      action: null,
    },
    {
      title: t('onboardingStep2Title') || 'Fair for Makers',
      description: t('onboardingStep2Description') || 'We put makers first with transparent fees, simple tools to set fair prices, and direct access to global customers.',
      icon: '⚖️',
      action: null,
    },
    {
      title: t('onboardingStep3Title') || 'Safe for Buyers',
      description: t('onboardingStep3Description') || 'Buy with confidence from verified makers, with clear shipping, reviews, and support when you need it.',
      icon: '🛡️',
      action: null,
    },
    {
      title: t('onboardingStep4Title') || 'Powered by AI Pandas',
      description: t('onboardingStep4Description') || 'Friendly AI assistants — the Banda Chao Pandas — help you plan, translate, and grow your business in multiple languages.',
      icon: '🤖',
      action: {
        label: t('getStarted') || 'Get Started',
        href: `/${locale}/products`,
      },
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStep.icon}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentStep.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index + 1 === step
                    ? 'w-8 bg-primary-600'
                    : index + 1 < step
                    ? 'w-2 bg-primary-300'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800 font-medium transition"
            >
              {t('skip') || 'تخطي'}
            </button>
            <div className="flex gap-4">
              {currentStep.action && (
                <Link href={currentStep.action.href}>
                  <Button variant="primary" className="px-6 py-3">
                    {currentStep.action.label}
                  </Button>
                </Link>
              )}
              <Button
                variant={step === steps.length ? 'primary' : 'secondary'}
                onClick={handleNext}
                className="px-6 py-3"
              >
                {step === steps.length
                  ? t('getStarted') || 'ابدأ الآن'
                  : t('next') || 'التالي'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

