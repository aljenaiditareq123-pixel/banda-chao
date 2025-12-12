"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MapPin, Package, CreditCard, ChevronRight, Award, Zap, Crown, Users, LogIn, ShoppingBag, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserStats, getUserProducts } from '@/app/actions/productActions';

export default function GamifiedProfile() {
  const { language } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real user stats and products
  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setLoading(true);
        try {
          // Use email if available, otherwise use id
          const userIdentifier = session.user.email || session.user.id as string;
          
          const [statsResult, productsResult] = await Promise.all([
            getUserStats(session.user.id as string),
            getUserProducts(userIdentifier),
          ]);

          if (statsResult.success) {
            setUserStats(statsResult.user);
          }

          if (productsResult.success) {
            setUserProducts(productsResult.products);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  // Use real data or fallback to demo data
  const user = {
    name: userStats?.name || session?.user?.name || (language === 'ar' ? "أحمد الباندا" : language === 'zh' ? "熊猫阿明" : "Ahmed Panda"),
    level: userStats?.level || 1,
    levelName: language === 'ar' 
      ? userStats?.level === 3 ? "باندا ذهبي" : userStats?.level === 2 ? "باندا فضي" : "باندا برونزي"
      : language === 'zh'
      ? userStats?.level === 3 ? "金熊猫" : userStats?.level === 2 ? "银熊猫" : "铜熊猫"
      : userStats?.level === 3 ? "Golden Panda" : userStats?.level === 2 ? "Silver Panda" : "Bronze Panda",
    xp: userStats ? Math.min((userStats.points / (userStats.level * 500)) * 100, 100) : 75,
    nextLevel: language === 'ar' 
      ? userStats?.level === 3 ? "مستوى 4" : `مستوى ${(userStats?.level || 1) + 1}`
      : language === 'zh'
      ? userStats?.level === 3 ? "4级" : `${(userStats?.level || 1) + 1}级`
      : userStats?.level === 3 ? "Level 4" : `Level ${(userStats?.level || 1) + 1}`,
    points: userStats?.points || 0,
    coupons: 3,
    balance: language === 'ar' ? "450 درهم" : language === 'zh' ? "450迪拉姆" : "AED 450",
    productCount: userStats?.productCount || userProducts.length || 0,
  };

  const badges = [
    { 
      icon: Award, 
      label: language === 'ar' ? "موثوق" : language === 'zh' ? "可信" : "Trusted", 
      active: true, 
      color: "text-blue-400" 
    },
    { 
      icon: Zap, 
      label: language === 'ar' ? "سريع" : language === 'zh' ? "快速" : "Fast", 
      active: true, 
      color: "text-yellow-400" 
    },
    { 
      icon: Crown, 
      label: "VIP", 
      active: false, 
      color: "text-gray-500" 
    },
    { 
      icon: Users, 
      label: language === 'ar' ? "سفير" : language === 'zh' ? "大使" : "Ambassador", 
      active: false, 
      color: "text-gray-500" 
    },
  ];

  const texts = {
    ar: {
      currentXP: "الخبرة الحالية",
      next: "القادم:",
      remaining: "باقي 250 نقطة للترقية!",
      points: "النقاط",
      coupons: "الكوبونات",
      wallet: "المحفظة",
      myBadges: "أوسمتي",
      myOrders: "طلباتي",
      ordersSub: "2 قيد التوصيل",
      addresses: "عناويني",
      addressesSub: "المنزل، العمل",
      payment: "طرق الدفع",
      paymentSub: "Visa **4242",
    },
    zh: {
      currentXP: "当前经验",
      next: "下一个：",
      remaining: "还需250点升级！",
      points: "积分",
      coupons: "优惠券",
      wallet: "钱包",
      myBadges: "我的徽章",
      myOrders: "我的订单",
      ordersSub: "2个配送中",
      addresses: "我的地址",
      addressesSub: "家，工作",
      payment: "支付方式",
      paymentSub: "Visa **4242",
    },
    en: {
      currentXP: "Current XP",
      next: "Next:",
      remaining: "250 points to level up!",
      points: "Points",
      coupons: "Coupons",
      wallet: "Wallet",
      myBadges: "My Badges",
      myOrders: "My Orders",
      ordersSub: "2 in delivery",
      addresses: "My Addresses",
      addressesSub: "Home, Work",
      payment: "Payment Methods",
      paymentSub: "Visa **4242",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  // If not authenticated, show sign-in prompt
  if (mounted && status === 'unauthenticated') {
    const signInTexts = {
      ar: {
        title: 'قم بتسجيل الدخول',
        subtitle: 'سجل دخولك للوصول إلى بروفايلك وإحصائياتك',
        button: 'تسجيل الدخول',
      },
      en: {
        title: 'Sign in required',
        subtitle: 'Sign in to access your profile and statistics',
        button: 'Sign in',
      },
      zh: {
        title: '需要登录',
        subtitle: '登录以访问您的个人资料和统计信息',
        button: '登录',
      },
    };
    const signInT = signInTexts[language as keyof typeof signInTexts] || signInTexts.en;

    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="text-7xl mb-6">🐼</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{signInT.title}</h1>
          <p className="text-gray-600 mb-8">{signInT.subtitle}</p>
          <Link href={`/${language}/auth/signin?callbackUrl=/${language}/profile`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg text-lg"
            >
              <LogIn size={24} />
              <span>{language === 'ar' ? 'تسجيل الدخول لعرض مستواك' : language === 'zh' ? '登录查看您的等级' : 'Login to see your Level'}</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header - منطقة المكانة والتباهي */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        
        {/* تأثيرات خلفية */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-20 h-20 rounded-full border-4 border-yellow-500 p-1 relative">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user?.image || '/default-avatar.png'}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-3xl">
                🐼
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-900 shadow-lg">
              Lv.3
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="text-yellow-400 text-sm font-medium flex items-center gap-1">
              <Crown size={14} />
              {user.levelName}
            </div>
            {session?.user?.email && (
              <div className="text-gray-400 text-xs mt-1 truncate">{session.user.email}</div>
            )}
          </div>
          <button className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
            <Settings size={20} />
          </button>
        </div>

        {/* شريط التقدم */}
        <div className="mb-2 relative z-10">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{t.currentXP}</span>
            <span>{t.next} {user.nextLevel}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${user.xp}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"
            />
          </div>
          <p className="text-[10px] text-right mt-1 text-yellow-500/80">{t.remaining}</p>
        </div>
      </div>

      {/* Stats - إحصائيات الثروة */}
      <div className="grid grid-cols-3 gap-4 px-4 -mt-8 relative z-20">
        {[
          { label: t.points, value: user.points, color: "text-purple-600", bg: "bg-purple-50" },
          { label: t.coupons, value: user.coupons, color: "text-red-500", bg: "bg-red-50" },
          { label: t.wallet, value: user.balance, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} p-3 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center`}
          >
            <span className={`font-black text-lg ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-gray-600 font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Badges - لوحة الشرف */}
      <div className="px-4 mt-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Award className="text-yellow-500" size={20} />
          {t.myBadges}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                badge.active 
                  ? 'bg-white border-yellow-100 shadow-sm hover:shadow-md' 
                  : 'bg-gray-100 border-transparent opacity-60 grayscale'
              }`}
            >
              <badge.icon size={24} className={`mb-1 ${badge.color}`} />
              <span className="text-[10px] font-bold text-center">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* My Products Section */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <ShoppingBag className="text-primary-600" size={20} />
            {language === 'ar' ? 'منتجاتي' : language === 'zh' ? '我的产品' : 'My Products'}
          </h3>
          {userProducts.length > 0 && (
            <span className="text-sm text-gray-500">{userProducts.length}</span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'ar' ? 'جاري التحميل...' : language === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        ) : userProducts.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 text-center border-2 border-dashed border-primary-200">
            <ShoppingBag className="mx-auto mb-4 text-primary-400" size={48} />
            <h4 className="font-bold text-gray-800 mb-2">
              {language === 'ar' ? 'لا توجد منتجات بعد' : language === 'zh' ? '还没有产品' : 'No products yet'}
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              {language === 'ar' ? 'ابدأ ببيع منتجاتك الآن!' : language === 'zh' ? '开始销售您的产品！' : 'Start selling your products now!'}
            </p>
            <Link href={`/${language}/maker/studio`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                <span>{language === 'ar' ? 'ابدأ البيع' : language === 'zh' ? '开始销售' : 'Start Selling'}</span>
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userProducts.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/${language}/products/${product.id}`}
                className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{product.title}</h4>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' 
                        ? `بيع ${product.soldCount} قطعة` 
                        : language === 'zh' 
                        ? `已售出 ${product.soldCount} 件`
                        : `${product.soldCount} sold`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      AED {product.price?.toFixed(0) || 0}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {userProducts.length > 5 && (
              <Link
                href={`/${language}/products?user=${session?.user?.id}`}
                className="block text-center text-primary-600 font-medium py-2"
              >
                {language === 'ar' ? `عرض الكل (${userProducts.length})` : language === 'zh' ? `查看全部 (${userProducts.length})` : `View All (${userProducts.length})`}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Menu - القائمة التقليدية */}
      <div className="px-4 mt-6 space-y-3">
        {[
          { icon: Package, label: t.myOrders, sub: t.ordersSub, href: '/orders' },
          { icon: MapPin, label: t.addresses, sub: t.addressesSub, href: '/addresses' },
          { icon: CreditCard, label: t.payment, sub: t.paymentSub, href: '/payment' },
        ].map((item, i) => (
          <Link key={i} href={item.href || '#'}>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition active:scale-98"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                  <item.icon size={20} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 [dir=rtl]:rotate-180" />
            </motion.button>
          </Link>
        ))}
      </div>
    </div>
  );
}
