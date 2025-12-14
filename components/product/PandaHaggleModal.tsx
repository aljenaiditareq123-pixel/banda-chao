'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';

interface PandaHaggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  originalPrice: number;
  currency?: string;
  locale?: string;
  onSuccess?: (haggledPrice: number) => void;
}

interface Message {
  id: string;
  type: 'panda' | 'user';
  text: string;
  timestamp: Date;
}

export default function PandaHaggleModal({
  isOpen,
  onClose,
  productId,
  productName,
  originalPrice,
  currency = 'USD',
  locale = 'en',
  onSuccess,
}: PandaHaggleModalProps) {
  const { addItem } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userOffer, setUserOffer] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  const translations = {
    ar: {
      title: 'مفاوضة مع الباندا 🐼',
      greeting: 'مرحباً! أنا الباندا المستشار. أريد أن أساعدك في الحصول على أفضل سعر لهذا المنتج.',
      askPrice: 'ما هو السعر الذي تريد دفعه؟',
      placeholder: 'أدخل السعر...',
      submit: 'إرسال',
      tooLow: 'آسف، هذا السعر منخفض جداً! 😅',
      tooLowMsg: 'لا يمكنني قبول أقل من 70% من السعر الأصلي. دعنا نتفاوض!',
      counterOffer: 'حسناً، دعني أفكر...',
      counterOfferMsg: 'أقترح عليك:',
      accept: 'ممتاز! 🎉',
      acceptMsg: 'قبلت عرضك! دعني أضيف المنتج إلى السلة بالسعر المتفق عليه.',
      addToCart: 'أضف إلى السلة',
      close: 'إغلاق',
      error: 'خطأ',
      invalidPrice: 'يرجى إدخال سعر صحيح',
    },
    zh: {
      title: '与熊猫讨价还价 🐼',
      greeting: '你好！我是熊猫顾问。我想帮你为这个产品争取最好的价格。',
      askPrice: '你想付多少钱？',
      placeholder: '输入价格...',
      submit: '发送',
      tooLow: '抱歉，这个价格太低了！😅',
      tooLowMsg: '我不能接受低于原价70%的价格。让我们讨价还价吧！',
      counterOffer: '好吧，让我想想...',
      counterOfferMsg: '我建议：',
      accept: '太好了！🎉',
      acceptMsg: '我接受你的报价！让我以商定的价格将产品添加到购物车。',
      addToCart: '添加到购物车',
      close: '关闭',
      error: '错误',
      invalidPrice: '请输入有效价格',
    },
    en: {
      title: 'Haggle with Panda 🐼',
      greeting: 'Hello! I\'m the Panda Advisor. I want to help you get the best price for this product.',
      askPrice: 'What price would you like to pay?',
      placeholder: 'Enter price...',
      submit: 'Send',
      tooLow: 'Sorry, that price is too low! 😅',
      tooLowMsg: 'I can\'t accept less than 70% of the original price. Let\'s negotiate!',
      counterOffer: 'Well, let me think...',
      counterOfferMsg: 'I suggest:',
      accept: 'Excellent! 🎉',
      acceptMsg: 'I accept your offer! Let me add the product to cart at the agreed price.',
      addToCart: 'Add to Cart',
      close: 'Close',
      error: 'Error',
      invalidPrice: 'Please enter a valid price',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with greeting
      const greeting: Message = {
        id: '1',
        type: 'panda',
        text: t.greeting,
        timestamp: new Date(),
      };
      const askPrice: Message = {
        id: '2',
        type: 'panda',
        text: t.askPrice,
        timestamp: new Date(),
      };
      setMessages([greeting, askPrice]);
      setIsNegotiating(false);
      setAgreedPrice(null);
      setUserOffer('');
    }
  }, [isOpen, t.greeting, t.askPrice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    const offer = parseFloat(userOffer);
    
    if (isNaN(offer) || offer <= 0) {
      alert(t.invalidPrice);
      return;
    }

    setIsNegotiating(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: formatPrice(offer),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate thinking delay
    setTimeout(() => {
      const percentage = (offer / originalPrice) * 100;
      let pandaResponse: Message;

      if (percentage < 70) {
        // Reject - too low
        pandaResponse = {
          id: (Date.now() + 1).toString(),
          type: 'panda',
          text: `${t.tooLow}\n\n${t.tooLowMsg}\n\n${t.askPrice}`,
          timestamp: new Date(),
        };
        setIsNegotiating(false);
      } else if (percentage >= 70 && percentage < 90) {
        // Counter-offer
        const counterPrice = Math.round(originalPrice * 0.85); // 85% counter
        pandaResponse = {
          id: (Date.now() + 1).toString(),
          type: 'panda',
          text: `${t.counterOffer}\n\n${t.counterOfferMsg} ${formatPrice(counterPrice)}\n\n${t.askPrice}`,
          timestamp: new Date(),
        };
        setIsNegotiating(false);
      } else {
        // Accept (>= 90%)
        setAgreedPrice(offer);
        pandaResponse = {
          id: (Date.now() + 1).toString(),
          type: 'panda',
          text: `${t.accept}\n\n${t.acceptMsg}`,
          timestamp: new Date(),
        };
        setIsNegotiating(false);
      }

      setMessages((prev) => [...prev, pandaResponse]);
      setUserOffer('');
    }, 1500);
  };

  const handleAddToCart = () => {
    if (agreedPrice) {
      addItem({
        productId,
        quantity: 1,
        price: agreedPrice,
        haggledPrice: agreedPrice,
      });
      
      if (onSuccess) {
        onSuccess(agreedPrice);
      }
      
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full h-[600px] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐼</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-600">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label={t.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type === 'panda' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🐼</span>
                    <span className="text-xs font-semibold opacity-75">Panda</span>
                  </div>
                )}
                <p className="whitespace-pre-line text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          {isNegotiating && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {agreedPrice ? (
          <div className="p-4 border-t border-gray-200 bg-green-50">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600 mb-2">
                {locale === 'ar' ? 'السعر المتفق عليه:' : locale === 'zh' ? '商定价格：' : 'Agreed Price:'}
              </p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(agreedPrice)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {locale === 'ar' 
                  ? `توفير ${formatPrice(originalPrice - agreedPrice)} من السعر الأصلي`
                  : locale === 'zh'
                  ? `比原价节省 ${formatPrice(originalPrice - agreedPrice)}`
                  : `Save ${formatPrice(originalPrice - agreedPrice)} from original price`}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {t.addToCart}
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="number"
                value={userOffer}
                onChange={(e) => setUserOffer(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isNegotiating}
              />
              <button
                onClick={handleSubmit}
                disabled={isNegotiating || !userOffer}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isNegotiating || !userOffer
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {t.submit}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {locale === 'ar' 
                ? `السعر الأصلي: ${formatPrice(originalPrice)}`
                : locale === 'zh'
                ? `原价：${formatPrice(originalPrice)}`
                : `Original Price: ${formatPrice(originalPrice)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
