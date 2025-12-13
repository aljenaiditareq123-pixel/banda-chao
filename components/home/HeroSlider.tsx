'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface HeroSliderProps {
  locale: string;
}

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop',
    title: {
      ar: 'عروض رائعة على الأزياء',
      en: 'Amazing Fashion Deals',
      zh: '时尚特惠',
    },
    subtitle: {
      ar: 'خصم يصل إلى 70%',
      en: 'Up to 70% Off',
      zh: '最高70%折扣',
    },
    link: '/products?category=fashion',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop',
    title: {
      ar: 'أحدث الأجهزة الإلكترونية',
      en: 'Latest Electronics',
      zh: '最新电子产品',
    },
    subtitle: {
      ar: 'تسوق الآن واحصل على أفضل الأسعار',
      en: 'Shop Now & Get Best Prices',
      zh: '立即购物，享受最佳价格',
    },
    link: '/products?category=electronics',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop',
    title: {
      ar: 'مجموعة التجميل المميزة',
      en: 'Premium Beauty Collection',
      zh: '优质美妆系列',
    },
    subtitle: {
      ar: 'عروض حصرية على منتجات التجميل',
      en: 'Exclusive Beauty Offers',
      zh: '独家美妆优惠',
    },
    link: '/products?category=beauty',
  },
];

export default function HeroSlider({ locale }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const t = {
    title: currentSlideData.title[locale as keyof typeof currentSlideData.title] || currentSlideData.title.en,
    subtitle: currentSlideData.subtitle[locale as keyof typeof currentSlideData.subtitle] || currentSlideData.subtitle.en,
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlideData.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center px-6 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4"
              >
                {t.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-white/90 mb-6"
              >
                {t.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href={`/${locale}${currentSlideData.link}`}
                  className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  {locale === 'ar' ? 'تسوق الآن →' : locale === 'zh' ? '立即购物 →' : 'Shop Now →'}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-900" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
