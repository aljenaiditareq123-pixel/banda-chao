'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  locale?: string;
  onSuccess?: () => void;
}

type PaymentMethod = 'wechat' | 'alipay' | 'wallet' | null;
type PaymentState = 'selecting' | 'processing' | 'success';

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency = 'AED',
  locale = 'en',
  onSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('selecting');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMethod(null);
      setPaymentState('selecting');
    }
  }, [isOpen]);

  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentState('processing');

    // Simulate payment processing (2 seconds)
    setTimeout(() => {
      setPaymentState('success');

      // After success, wait 2 more seconds then close and redirect
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        // Redirect to home after closing
        if (typeof window !== 'undefined') {
          window.location.href = `/${locale}`;
        }
      }, 2000);
    }, 2000);
  };

  const texts = {
    ar: {
      choosePaymentMethod: 'اختر طريقة الدفع',
      total: 'المجموع',
      wechatPay: 'WeChat Pay',
      alipay: 'Alipay',
      wallet: 'رصيد بندا',
      processing: 'جاري المعالجة...',
      paymentSuccessful: 'تم الدفع بنجاح!',
      joinedTeam: 'لقد انضممت للفريق.',
    },
    zh: {
      choosePaymentMethod: '选择支付方式',
      total: '总计',
      wechatPay: '微信支付',
      alipay: '支付宝',
      wallet: 'Banda余额',
      processing: '处理中...',
      paymentSuccessful: '支付成功！',
      joinedTeam: '您已加入团队。',
    },
    en: {
      choosePaymentMethod: 'Choose Payment Method',
      total: 'Total',
      wechatPay: 'WeChat Pay',
      alipay: 'Alipay',
      wallet: 'Banda Balance',
      processing: 'Processing...',
      paymentSuccessful: 'Payment Successful!',
      joinedTeam: 'You joined the team.',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={paymentState === 'selecting' ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border-2 border-amber-500/30"
        >
          {/* Close Button (only show when selecting) */}
          {paymentState === 'selecting' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 mb-2">
              {t.choosePaymentMethod}
            </h2>
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-1">{t.total}</p>
              <p className="text-4xl font-black text-white">
                {formatPrice(amount)}
              </p>
            </div>
          </div>

          {/* Payment State Content */}
          <AnimatePresence mode="wait">
            {paymentState === 'selecting' && (
              <motion.div
                key="selecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* WeChat Pay */}
                <button
                  onClick={() => handlePaymentMethodSelect('wechat')}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-green-500/50"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💚</span>
                  </div>
                  <span className="text-white font-bold text-lg flex-1 text-left">
                    {t.wechatPay}
                  </span>
                  <div className="w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </button>

                {/* Alipay */}
                <button
                  onClick={() => handlePaymentMethodSelect('alipay')}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-blue-500/50"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💙</span>
                  </div>
                  <span className="text-white font-bold text-lg flex-1 text-left">
                    {t.alipay}
                  </span>
                  <div className="w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </button>

                {/* Wallet / Banda Balance */}
                <button
                  onClick={() => handlePaymentMethodSelect('wallet')}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-amber-400/50"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-white font-bold text-lg flex-1 text-left">
                    {t.wallet}
                  </span>
                  <div className="w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </button>
              </motion.div>
            )}

            {paymentState === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-16 h-16 text-amber-400 animate-spin mb-4" />
                <p className="text-white text-xl font-semibold">{t.processing}</p>
              </motion.div>
            )}

            {paymentState === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-12"
              >
                {/* Success Checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-2xl"
                >
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
                </motion.div>

                {/* Success Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-green-400 mb-2 text-center"
                >
                  {t.paymentSuccessful}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-center"
                >
                  {t.joinedTeam}
                </motion.p>

                {/* Confetti Effect (CSS-based) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'][Math.floor(Math.random() * 4)],
                      }}
                      initial={{ opacity: 0, y: -20, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [0, 100],
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 0.5,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
