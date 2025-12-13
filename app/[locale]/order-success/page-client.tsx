'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, Package, ArrowRight, Home } from 'lucide-react';
import Button from '@/components/Button';

interface OrderSuccessClientProps {
  locale: string;
  orderId?: string;
}

export default function OrderSuccessClient({ locale, orderId }: OrderSuccessClientProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  // Generate confetti effect
  useEffect(() => {
    if (showConfetti) {
      const confettiCount = 50;
      const confetti = [];

      for (let i = 0; i < confettiCount; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.position = 'fixed';
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.top = '-10px';
        confettiPiece.style.width = '10px';
        confettiPiece.style.height = '10px';
        confettiPiece.style.backgroundColor = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)];
        confettiPiece.style.borderRadius = '50%';
        confettiPiece.style.pointerEvents = 'none';
        confettiPiece.style.zIndex = '9999';
        confettiPiece.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear forwards`;
        document.body.appendChild(confettiPiece);
        confetti.push(confettiPiece);
      }

      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);

      // Cleanup after animation
      setTimeout(() => {
        confetti.forEach(piece => piece.remove());
        style.remove();
        setShowConfetti(false);
      }, 4000);
    }
  }, [showConfetti]);

  const texts = {
    ar: {
      title: 'تم تأكيد طلبك بنجاح! 🎉',
      message: 'شكراً لك على شرائك! سنقوم بمعالجة طلبك وإرساله في أقرب وقت ممكن.',
      orderNumber: 'رقم الطلب',
      estimatedDelivery: 'الوقت المتوقع للتسليم',
      days: 'أيام',
      backToShopping: 'العودة للتسوق',
      trackOrder: 'تتبع طلبي',
      whatNext: 'ماذا بعد؟',
      nextSteps: [
        'ستتلقى رسالة تأكيد على بريدك الإلكتروني',
        'سنقوم بتحديثك عند شحن الطلب',
        'يمكنك تتبع حالة الطلب من صفحة الطلبات',
      ],
    },
    en: {
      title: 'Order Confirmed Successfully! 🎉',
      message: 'Thank you for your purchase! We will process and ship your order as soon as possible.',
      orderNumber: 'Order Number',
      estimatedDelivery: 'Estimated Delivery',
      days: 'days',
      backToShopping: 'Back to Shopping',
      trackOrder: 'Track My Order',
      whatNext: 'What\'s Next?',
      nextSteps: [
        'You will receive a confirmation email',
        'We will update you when your order ships',
        'You can track your order status from the orders page',
      ],
    },
    zh: {
      title: '订单确认成功！🎉',
      message: '感谢您的购买！我们将尽快处理和发货您的订单。',
      orderNumber: '订单号',
      estimatedDelivery: '预计送达时间',
      days: '天',
      backToShopping: '返回购物',
      trackOrder: '跟踪我的订单',
      whatNext: '接下来是什么？',
      nextSteps: [
        '您将收到确认电子邮件',
        '订单发货时我们会通知您',
        '您可以从订单页面跟踪订单状态',
      ],
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const estimatedDays = Math.floor(Math.random() * 5) + 3; // 3-7 days

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t.title}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400 mb-8 text-lg"
          >
            {t.message}
          </motion.p>

          {/* Order ID Card */}
          {orderId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-700 rounded-xl p-6 mb-8"
            >
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t.orderNumber}
              </p>
              <p className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono">
                {orderId}
              </p>
            </motion.div>
          )}

          {/* Estimated Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8 text-gray-700 dark:text-gray-300"
          >
            <Package className="w-5 h-5" />
            <span className="font-semibold">
              {t.estimatedDelivery}: <span className="text-primary-600 dark:text-primary-400">{estimatedDays} {t.days}</span>
            </span>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 text-right"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t.whatNext}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {t.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={`/${locale}/products`} className="flex-1 sm:flex-none">
              <Button
                variant="secondary"
                className="w-full sm:w-auto min-w-[200px] border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                <Home className="w-4 h-4 inline-block me-2" />
                {t.backToShopping}
              </Button>
            </Link>
            <Link href={`/${locale}/profile/orders`} className="flex-1 sm:flex-none">
              <Button
                variant="primary"
                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                <ShoppingBag className="w-4 h-4 inline-block me-2" />
                {t.trackOrder}
                <ArrowRight className="w-4 h-4 inline-block ms-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
