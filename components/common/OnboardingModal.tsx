'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import Link from 'next/link';

interface OnboardingModalProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ locale, isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: {
        ar: 'مرحباً بك في Banda Chao',
        en: 'Welcome to Banda Chao',
        zh: '欢迎来到 Banda Chao',
      },
      content: {
        ar: 'منصة عالمية للحرفيين المستقلين. اكتشف منتجات يدوية فريدة من حرفيين موهوبين حول العالم.',
        en: 'A global platform for independent makers. Discover unique handmade products from talented artisans worldwide.',
        zh: '全球独立手工艺人的平台。发现来自世界各地才华横溢的手工艺人制作的独特手工产品。',
      },
    },
    {
      title: {
        ar: 'استكشف الحرفيين',
        en: 'Explore Makers',
        zh: '探索手工艺人',
      },
      content: {
        ar: 'تصفح ملفات الحرفيين، شاهد منتجاتهم، وتواصل معهم مباشرة.',
        en: 'Browse maker profiles, view their products, and connect with them directly.',
        zh: '浏览手工艺人资料，查看他们的产品，并直接与他们联系。',
      },
    },
    {
      title: {
        ar: 'اكتشف المنتجات',
        en: 'Discover Products',
        zh: '发现产品',
      },
      content: {
        ar: 'استخدم الفلاتر والبحث للعثور على المنتجات التي تهمك.',
        en: 'Use filters and search to find products that interest you.',
        zh: '使用筛选和搜索来找到您感兴趣的产品。',
      },
    },
  ];

  const texts = {
    ar: {
      next: 'التالي',
      previous: 'السابق',
      skip: 'تخطي',
      getStarted: 'ابدأ',
      close: 'إغلاق',
    },
    en: {
      next: 'Next',
      previous: 'Previous',
      skip: 'Skip',
      getStarted: 'Get Started',
      close: 'Close',
    },
    zh: {
      next: '下一步',
      previous: '上一步',
      skip: '跳过',
      getStarted: '开始',
      close: '关闭',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;
  const currentStepData = steps[currentStep];
  const stepTitle = currentStepData.title[locale as keyof typeof currentStepData.title] || currentStepData.title.en;
  const stepContent = currentStepData.content[locale as keyof typeof currentStepData.content] || currentStepData.content.en;

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      firstElement?.focus();
      document.addEventListener('keydown', handleTab);

      return () => {
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    onClose();
    // Optionally scroll to a section or navigate
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto" 
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 md:p-8 relative pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        onClick={(e) => {
          // Prevent clicks inside modal from closing it
          e.stopPropagation();
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label={t.close}
        >
          <span className="text-2xl">×</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">
              {currentStep === 0 ? '👋' : currentStep === 1 ? '👥' : '🛍️'}
            </span>
          </div>
          <h2 id="onboarding-title" className="text-2xl font-bold text-gray-900 mb-2">
            {stepTitle}
          </h2>
          <p className="text-gray-600">{stepContent}</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? 'bg-primary w-8' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={handlePrevious} className="flex-1">
              {t.previous}
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <>
              <Button variant="text" onClick={onClose} className="flex-1">
                {t.skip}
              </Button>
              <Button variant="primary" onClick={handleNext} className="flex-1">
                {t.next}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleGetStarted} className="flex-1 w-full">
              {t.getStarted}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

