'use client';

import React, { useState } from 'react';
import { Wechat, Twitter, MessageCircle, Phone, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode.react';

interface SocialHubProps {
  locale: string;
  socialLinks?: {
    wechat?: string;
    twitter?: string;
    phone?: string;
    whatsapp?: string;
  };
}

export default function SocialHub({ locale, socialLinks = {} }: SocialHubProps) {
  // Mock social data
  const mockWeChatMoment = {
    text: locale === 'ar' 
      ? 'جديد! منتج فاخر من ورشتي الخاصة 🎨'
      : locale === 'zh'
      ? '新品！来自我工作室的豪华产品 🎨'
      : 'New! Premium product from my workshop 🎨',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    time: '2 hours ago',
  };

  const mockTweet = {
    text: locale === 'ar'
      ? 'سعيد بمشاركة تجربتي في صناعة المنتجات اليدوية مع مجتمع بندا تشاو! 🌟'
      : locale === 'zh'
      ? '很高兴与 Banda Chao 社区分享我的手工艺经验！🌟'
      : 'Excited to share my handcrafting journey with the Banda Chao community! 🌟',
    likes: 42,
    retweets: 8,
    time: '5 hours ago',
  };
  const [showWeChatQR, setShowWeChatQR] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState<'phone' | 'whatsapp' | 'wechat'>('phone');

  const openContactModal = (method: 'phone' | 'whatsapp' | 'wechat') => {
    setContactMethod(method);
    setShowContactModal(true);
  };

  return (
    <div className="space-y-4">
      {/* WeChat Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-600/20 to-emerald-700/20 backdrop-blur-sm rounded-2xl border-2 border-green-500/30 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
            <Wechat className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              WeChat
              <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                {locale === 'ar' ? 'متصل' : locale === 'zh' ? '已连接' : 'Connected'}
              </span>
            </h3>
            <p className="text-sm text-gray-300 mb-3">{mockWeChatMoment.text}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowWeChatQR(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 transition-colors text-sm font-medium"
              >
                <QrCode className="w-4 h-4" />
                {locale === 'ar' ? 'عرض QR' : locale === 'zh' ? '显示二维码' : 'Show QR'}
              </button>
              <span className="text-xs text-gray-400">{mockWeChatMoment.time}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Twitter/X Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-600/20 to-cyan-700/20 backdrop-blur-sm rounded-2xl border-2 border-blue-500/30 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
            <Twitter className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              Twitter / X
              <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                {locale === 'ar' ? 'آخر تغريدة' : locale === 'zh' ? '最新推文' : 'Latest Tweet'}
              </span>
            </h3>
            <p className="text-sm text-gray-300 mb-3">{mockTweet.text}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>❤️ {mockTweet.likes}</span>
              <span>🔄 {mockTweet.retweets}</span>
              <span>{mockTweet.time}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Direct Contact Floating Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openContactModal('phone')}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Phone className="w-5 h-5" />
          {locale === 'ar' ? 'اتصل' : locale === 'zh' ? '电话' : 'Call'}
        </button>
        <button
          onClick={() => openContactModal('whatsapp')}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>
        <button
          onClick={() => openContactModal('wechat')}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Wechat className="w-5 h-5" />
          WeChat
        </button>
      </div>

      {/* WeChat QR Modal */}
      <AnimatePresence>
        {showWeChatQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowWeChatQR(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-green-500/30 p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">WeChat QR Code</h3>
                <button
                  onClick={() => setShowWeChatQR(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <QRCode value={socialLinks.wechat || 'wechat://add?username=example'} size={200} />
                </div>
                <p className="text-gray-300 text-center text-sm">
                  {locale === 'ar' 
                    ? 'امسح رمز QR للاتصال على WeChat'
                    : locale === 'zh'
                    ? '扫描二维码在微信上联系'
                    : 'Scan QR code to connect on WeChat'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-amber-500/30 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {contactMethod === 'phone' 
                    ? (locale === 'ar' ? 'اتصال هاتفي' : locale === 'zh' ? '电话' : 'Phone Call')
                    : contactMethod === 'whatsapp'
                    ? 'WhatsApp'
                    : 'WeChat'}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {contactMethod === 'phone' && (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      {locale === 'ar' ? 'رقم الهاتف:' : locale === 'zh' ? '电话号码：' : 'Phone Number:'}
                    </p>
                    <p className="text-2xl font-bold text-amber-400 mb-6">
                      {socialLinks.phone || '+971 50 123 4567'}
                    </p>
                    <a
                      href={`tel:${socialLinks.phone || '+971501234567'}`}
                      className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-bold text-center transition-all"
                    >
                      {locale === 'ar' ? 'اتصل الآن' : locale === 'zh' ? '立即拨打' : 'Call Now'}
                    </a>
                  </div>
                )}

                {contactMethod === 'whatsapp' && (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      {locale === 'ar' ? 'رابط WhatsApp:' : locale === 'zh' ? 'WhatsApp 链接：' : 'WhatsApp Link:'}
                    </p>
                    <p className="text-sm text-gray-400 mb-6 break-all">
                      {socialLinks.whatsapp || 'https://wa.me/971501234567'}
                    </p>
                    <a
                      href={socialLinks.whatsapp || 'https://wa.me/971501234567'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-white font-bold text-center transition-all"
                    >
                      {locale === 'ar' ? 'فتح WhatsApp' : locale === 'zh' ? '打开 WhatsApp' : 'Open WhatsApp'}
                    </a>
                  </div>
                )}

                {contactMethod === 'wechat' && (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      {locale === 'ar' ? 'WeChat ID:' : locale === 'zh' ? '微信ID：' : 'WeChat ID:'}
                    </p>
                    <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                      <QRCode value={socialLinks.wechat || 'wechat://add?username=example'} size={200} />
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {locale === 'ar' 
                        ? 'امسح رمز QR أو ابحث عن ID'
                        : locale === 'zh'
                        ? '扫描二维码或搜索ID'
                        : 'Scan QR code or search for ID'}
                    </p>
                    <p className="text-lg font-bold text-amber-400">
                      {socialLinks.wechat || 'wechat_example'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
