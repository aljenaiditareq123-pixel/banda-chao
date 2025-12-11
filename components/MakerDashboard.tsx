"use client";

import React, { useState } from 'react';
import { 
  Twitter, Mail, MessageCircle, DollarSign, 
  CreditCard, TrendingUp, PenTool, Video, Youtube, 
  Send, ExternalLink, Smartphone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

// أيقونات السوشيال ميديا الملونة
const SocialIcon = ({ icon: Icon, color, label, link }: any) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer mb-4 tooltip`}
    title={label}
  >
    <Icon size={24} />
  </a>
);

export default function MakerDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('posts'); // posts, shorts, videos
  const [postText, setPostText] = useState('');
  
  // بيانات وهمية للمحاكاة
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      text: language === 'ar' ? "وصلت دفعة جديدة من الكراسي! السعر 150 درهم" : language === 'zh' ? "新一批椅子到货！价格150迪拉姆" : "New batch of chairs arrived! Price 150 AED", 
      time: language === 'ar' ? "منذ ساعتين" : language === 'zh' ? "2小时前" : "2 hours ago" 
    },
    { 
      id: 2, 
      text: language === 'ar' ? "عرض خاص لنهاية الأسبوع 🔥" : language === 'zh' ? "周末特价 🔥" : "Weekend Special Offer 🔥", 
      time: language === 'ar' ? "أمس" : language === 'zh' ? "昨天" : "Yesterday" 
    }
  ]);

  const handlePost = () => {
    if (!postText) return;
    setPosts([{ 
      id: Date.now(), 
      text: postText, 
      time: language === 'ar' ? "الآن" : language === 'zh' ? "现在" : "Now" 
    }, ...posts]);
    setPostText('');
  };

  const texts = {
    ar: {
      welcome: "أهلاً يا معلم 🐼",
      subtitle: "هنا مكتبك الرقمي.. كل شيء تحت سيطرتك",
      connected: "متصل الآن",
      communicate: "تواصل",
      mySite: "موقعي",
      dailyPosts: "المنشورات اليومية",
      shortVideo: "فيديو قصير (TikTok)",
      longVideo: "فيديو طويل (YouTube)",
      whatNew: "شو جديدك اليوم؟ (اكتب السعر والمواصفات هنا..)",
      publish: "انشر",
      previousPosts: "منشوراتك السابقة",
      videoLibrary: "مكتبة الفيديو",
      addVideoLink: "+ أضف رابط فيديو جديد",
      expectedBalance: "الرصيد المتوقع",
      vipMember: "VIP Member",
      bankInfo: "بيانات البنك",
      storePerformance: "أداء المتجر",
      videoViews: "مشاهدات الفيديو",
      purchaseClicks: "نقرات الشراء",
    },
    zh: {
      welcome: "你好，师傅 🐼",
      subtitle: "这是你的数字办公室..一切都在你的掌控之中",
      connected: "现在在线",
      communicate: "沟通",
      mySite: "我的网站",
      dailyPosts: "每日帖子",
      shortVideo: "短视频 (TikTok)",
      longVideo: "长视频 (YouTube)",
      whatNew: "今天有什么新消息？(在这里写下价格和规格..)",
      publish: "发布",
      previousPosts: "你之前的帖子",
      videoLibrary: "视频库",
      addVideoLink: "+ 添加新视频链接",
      expectedBalance: "预期余额",
      vipMember: "VIP会员",
      bankInfo: "银行信息",
      storePerformance: "店铺表现",
      videoViews: "视频观看次数",
      purchaseClicks: "购买点击",
    },
    en: {
      welcome: "Welcome Master 🐼",
      subtitle: "This is your digital office.. everything is under your control",
      connected: "Online Now",
      communicate: "Connect",
      mySite: "My Site",
      dailyPosts: "Daily Posts",
      shortVideo: "Short Video (TikTok)",
      longVideo: "Long Video (YouTube)",
      whatNew: "What's new today? (Write price and specs here..)",
      publish: "Publish",
      previousPosts: "Your Previous Posts",
      videoLibrary: "Video Library",
      addVideoLink: "+ Add New Video Link",
      expectedBalance: "Expected Balance",
      vipMember: "VIP Member",
      bankInfo: "Bank Info",
      storePerformance: "Store Performance",
      videoViews: "Video Views",
      purchaseClicks: "Purchase Clicks",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800">{t.welcome}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-gray-600">{t.connected}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. SOCIAL DOCK (الجانب الأيمن - بوابة التواصل) */}
        <div className="lg:col-span-1 hidden lg:flex flex-col items-center bg-white py-6 rounded-3xl shadow-sm h-fit sticky top-8">
          <p className="text-xs font-bold text-gray-400 mb-4 rotate-90 origin-center whitespace-nowrap">{t.communicate}</p>
          <SocialIcon icon={Twitter} color="bg-blue-400" label="Twitter" link="https://twitter.com" />
          <SocialIcon icon={MessageCircle} color="bg-green-500" label="WeChat/WhatsApp" link="https://web.whatsapp.com" />
          <SocialIcon icon={Smartphone} color="bg-yellow-400" label="Snapchat" link="https://snapchat.com" />
          <SocialIcon icon={Mail} color="bg-purple-500" label="Hotmail/Email" link="https://outlook.live.com" />
          <div className="w-8 h-1 bg-gray-200 rounded-full my-2"></div>
          <SocialIcon icon={ExternalLink} color="bg-gray-800" label={t.mySite} link="#" />
        </div>

        {/* 2. MAIN CONTENT HUB (الوسط - ساحة العمل) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs */}
          <div className="flex bg-white p-2 rounded-2xl shadow-sm gap-2 overflow-x-auto">
            {[
              { id: 'posts', label: t.dailyPosts, icon: PenTool },
              { id: 'shorts', label: t.shortVideo, icon: Smartphone },
              { id: 'videos', label: t.longVideo, icon: Youtube },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-black text-yellow-400 shadow-md transform scale-105' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-3xl shadow-sm min-h-[500px] p-6 relative overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* POSTS SECTION */}
              {activeTab === 'posts' && (
                <motion.div 
                  key="posts"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-200">
                    <textarea
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder={t.whatNew}
                      className="w-full bg-transparent border-none focus:ring-0 resize-none text-lg min-h-[80px]"
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Smartphone size={20} />
                      </button>
                      <button 
                        onClick={handlePost}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition"
                      >
                        <Send size={16} /> {t.publish}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-400 text-sm">{t.previousPosts}</h3>
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="text-xs text-gray-500">{post.time}</div>
                        </div>
                        <p className="text-gray-800">{post.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* SHORTS & VIDEOS (Placeholders for now) */}
              {(activeTab === 'shorts' || activeTab === 'videos') && (
                <motion.div 
                  key="video-hub"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video size={40} />
                  </div>
                  <h3 className="text-xl font-bold">{t.videoLibrary}</h3>
                  <p className="text-gray-500 mb-6">
                    {language === 'ar' 
                      ? `هنا تظهر جميع فيديوهاتك من ${activeTab === 'shorts' ? 'تيك توك' : 'يوتيوب'}`
                      : language === 'zh'
                      ? `这里显示您所有的${activeTab === 'shorts' ? 'TikTok' : 'YouTube'}视频`
                      : `Here all your ${activeTab === 'shorts' ? 'TikTok' : 'YouTube'} videos appear`}
                  </p>
                  <button className="bg-black text-white px-6 py-3 rounded-xl font-bold">
                    {t.addVideoLink}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* 3. FINANCE & STATS (الجانب الأيسر - المال والأعمال) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 rounded-full blur-2xl opacity-20"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <CreditCard className="text-yellow-400" size={24} />
              <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">{t.vipMember}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1 relative z-10">{t.expectedBalance}</p>
            <h2 className="text-3xl font-bold mb-6 relative z-10">AED 1,250</h2>
            <div className="flex gap-2 relative z-10">
              <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold transition">
                {t.bankInfo}
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-xs font-bold transition">
                PayPal
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              {t.storePerformance}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{t.videoViews}</span>
                <span className="font-bold">12.5K</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[70%]"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{t.purchaseClicks}</span>
                <span className="font-bold">850</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[45%]"></div>
              </div>
            </div>
          </div>

          {/* Social Links for Mobile (visible only on small screens) */}
          <div className="lg:hidden flex justify-center gap-4 flex-wrap">
            <SocialIcon icon={Twitter} color="bg-blue-400" label="Twitter" link="https://twitter.com" />
            <SocialIcon icon={MessageCircle} color="bg-green-500" label="WeChat/WhatsApp" link="https://web.whatsapp.com" />
            <SocialIcon icon={Smartphone} color="bg-yellow-400" label="Snapchat" link="https://snapchat.com" />
            <SocialIcon icon={Mail} color="bg-purple-500" label="Email" link="https://outlook.live.com" />
          </div>
        </div>
      </div>
    </div>
  );
}
