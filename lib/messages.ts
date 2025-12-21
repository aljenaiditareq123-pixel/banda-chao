/**
 * Centralized Translation Messages
 * The Voice of Banda Chao - Single source of truth for all translations
 * 
 * This file contains all translatable text strings used across the application.
 * Languages supported: Arabic (ar), English (en), Chinese (zh)
 */

export type Language = 'ar' | 'en' | 'zh';

export interface Messages {
  // Navigation
  nav: {
    home: string;
    products: string;
    makers: string;
    videos: string;
    about: string;
    login: string;
    signup: string;
    profile: string;
    cart: string;
    orders: string;
    logout: string;
    search: string;
    searchPlaceholder: string;
  };

  // Common Actions
  actions: {
    view: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    submit: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    loading: string;
    error: string;
    success: string;
  };

  // Homepage
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroCTA: string;
    featuredMakers: string;
    latestProducts: string;
    howItWorks: string;
    howItWorksStep1: string;
    howItWorksStep2: string;
    howItWorksStep3: string;
    noContent: string;
  };

  // Products
  products: {
    title: string;
    addToCart: string;
    buyNow: string;
    viewProduct: string;
    price: string;
    outOfStock: string;
    inStock: string;
    description: string;
    specifications: string;
    reviews: string;
    relatedProducts: string;
    noProductsFound: string;
  };

  // Cart
  cart: {
    title: string;
    empty: string;
    emptyDescription: string;
    items: string;
    total: string;
    subtotal: string;
    shipping: string;
    checkout: string;
    continueShopping: string;
    remove: string;
    quantity: string;
  };

  // Authentication
  auth: {
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    forgotPassword: string;
    rememberMe: string;
    createAccount: string;
    alreadyHaveAccount: string;
    loginSuccess: string;
    signupSuccess: string;
    loginError: string;
    signupError: string;
  };

  // Errors
  errors: {
    generic: string;
    notFound: string;
    unauthorized: string;
    serverError: string;
    networkError: string;
    tryAgain: string;
    required: string;
    invalidEmail: string;
    invalidPassword: string;
    passwordsDoNotMatch: string;
  };

  // Success Messages
  success: {
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    sent: string;
  };
}

export const messages: Record<Language, Messages> = {
  ar: {
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      makers: 'الحرفيون',
      videos: 'الفيديوهات',
      about: 'من نحن',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      profile: 'الملف الشخصي',
      cart: 'السلة',
      orders: 'الطلبات',
      logout: 'تسجيل الخروج',
      search: 'بحث',
      searchPlaceholder: 'ابحث عن منتجات، حرفيين...',
    },
    actions: {
      view: 'عرض',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      submit: 'إرسال',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
    },
    home: {
      heroTitle: 'اكتشف جمال الحرف اليدوية الصينية',
      heroSubtitle: 'ربط الحرفيين بالمشترين العالميين، استكشف المنتجات الثقافية الصينية الفريدة',
      heroCTA: 'تصفح المنتجات',
      featuredMakers: 'الحرفيون المميزون',
      latestProducts: 'أحدث المنتجات',
      howItWorks: 'كيف يعمل',
      howItWorksStep1: 'تصفح المنتجات',
      howItWorksStep2: 'اتصل بالحرفيين',
      howItWorksStep3: 'تقديم الطلبات',
      noContent: 'لا يوجد محتوى',
    },
    products: {
      title: 'المنتجات',
      addToCart: 'أضف إلى السلة',
      buyNow: 'اشتري الآن',
      viewProduct: 'عرض المنتج',
      price: 'السعر',
      outOfStock: 'غير متوفر',
      inStock: 'متوفر',
      description: 'الوصف',
      specifications: 'المواصفات',
      reviews: 'التقييمات',
      relatedProducts: 'منتجات ذات صلة',
      noProductsFound: 'لم يتم العثور على منتجات',
    },
    cart: {
      title: 'السلة',
      empty: 'سلة التسوق فارغة',
      emptyDescription: 'ابدأ بإضافة المنتجات إلى سلة التسوق',
      items: 'العناصر',
      total: 'الإجمالي',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      checkout: 'إتمام الطلب',
      continueShopping: 'متابعة التسوق',
      remove: 'إزالة',
      quantity: 'الكمية',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      name: 'الاسم',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      createAccount: 'إنشاء حساب جديد',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      signupSuccess: 'تم إنشاء الحساب بنجاح',
      loginError: 'فشل تسجيل الدخول',
      signupError: 'فشل إنشاء الحساب',
    },
    errors: {
      generic: 'حدث خطأ ما',
      notFound: 'الصفحة غير موجودة',
      unauthorized: 'غير مصرح',
      serverError: 'خطأ في الخادم',
      networkError: 'خطأ في الشبكة',
      tryAgain: 'حاول مرة أخرى',
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      invalidPassword: 'كلمة المرور غير صحيحة',
      passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    },
    success: {
      saved: 'تم الحفظ بنجاح',
      deleted: 'تم الحذف بنجاح',
      updated: 'تم التحديث بنجاح',
      created: 'تم الإنشاء بنجاح',
      sent: 'تم الإرسال بنجاح',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      makers: 'Makers',
      videos: 'Videos',
      about: 'About',
      login: 'Login',
      signup: 'Sign Up',
      profile: 'Profile',
      cart: 'Cart',
      orders: 'Orders',
      logout: 'Logout',
      search: 'Search',
      searchPlaceholder: 'Search for products, makers...',
    },
    actions: {
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    home: {
      heroTitle: 'Discover the Beauty of Chinese Handicrafts',
      heroSubtitle: 'Connect artisans with global buyers, explore unique Chinese cultural products',
      heroCTA: 'Browse Products',
      featuredMakers: 'Featured Artisans',
      latestProducts: 'Latest Products',
      howItWorks: 'How It Works',
      howItWorksStep1: 'Browse Products',
      howItWorksStep2: 'Contact Artisans',
      howItWorksStep3: 'Place Orders',
      noContent: 'No content available',
    },
    products: {
      title: 'Products',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      viewProduct: 'View Product',
      price: 'Price',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      relatedProducts: 'Related Products',
      noProductsFound: 'No products found',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyDescription: 'Start adding products to your cart',
      items: 'Items',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      quantity: 'Quantity',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      loginSuccess: 'Login successful',
      signupSuccess: 'Account created successfully',
      loginError: 'Login failed',
      signupError: 'Sign up failed',
    },
    errors: {
      generic: 'Something went wrong',
      notFound: 'Page not found',
      unauthorized: 'Unauthorized',
      serverError: 'Server error',
      networkError: 'Network error',
      tryAgain: 'Try again',
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      invalidPassword: 'Invalid password',
      passwordsDoNotMatch: 'Passwords do not match',
    },
    success: {
      saved: 'Saved successfully',
      deleted: 'Deleted successfully',
      updated: 'Updated successfully',
      created: 'Created successfully',
      sent: 'Sent successfully',
    },
  },
  zh: {
    nav: {
      home: '首页',
      products: '产品',
      makers: '手工艺人',
      videos: '视频',
      about: '关于我们',
      login: '登录',
      signup: '注册',
      profile: '个人资料',
      cart: '购物车',
      orders: '订单',
      logout: '登出',
      search: '搜索',
      searchPlaceholder: '搜索产品、手工艺人...',
    },
    actions: {
      view: '查看',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      submit: '提交',
      confirm: '确认',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
    home: {
      heroTitle: '发现中国手工艺之美',
      heroSubtitle: '连接手工艺人与全球买家，探索独特的中国文化产品',
      heroCTA: '浏览产品',
      featuredMakers: '精选手工艺人',
      latestProducts: '最新产品',
      howItWorks: '如何使用',
      howItWorksStep1: '浏览产品',
      howItWorksStep2: '联系手工艺人',
      howItWorksStep3: '下单购买',
      noContent: '暂无内容',
    },
    products: {
      title: '产品',
      addToCart: '加入购物车',
      buyNow: '立即购买',
      viewProduct: '查看产品',
      price: '价格',
      outOfStock: '缺货',
      inStock: '有货',
      description: '描述',
      specifications: '规格',
      reviews: '评价',
      relatedProducts: '相关产品',
      noProductsFound: '未找到产品',
    },
    cart: {
      title: '购物车',
      empty: '购物车为空',
      emptyDescription: '开始添加产品到购物车',
      items: '商品',
      total: '总计',
      subtotal: '小计',
      shipping: '运费',
      checkout: '结账',
      continueShopping: '继续购物',
      remove: '移除',
      quantity: '数量',
    },
    auth: {
      login: '登录',
      signup: '注册',
      logout: '登出',
      email: '电子邮件',
      password: '密码',
      confirmPassword: '确认密码',
      name: '姓名',
      forgotPassword: '忘记密码？',
      rememberMe: '记住我',
      createAccount: '创建账户',
      alreadyHaveAccount: '已有账户？',
      loginSuccess: '登录成功',
      signupSuccess: '账户创建成功',
      loginError: '登录失败',
      signupError: '注册失败',
    },
    errors: {
      generic: '出了点问题',
      notFound: '页面未找到',
      unauthorized: '未授权',
      serverError: '服务器错误',
      networkError: '网络错误',
      tryAgain: '重试',
      required: '此字段为必填项',
      invalidEmail: '无效的电子邮件地址',
      invalidPassword: '无效的密码',
      passwordsDoNotMatch: '密码不匹配',
    },
    success: {
      saved: '保存成功',
      deleted: '删除成功',
      updated: '更新成功',
      created: '创建成功',
      sent: '发送成功',
    },
  },
};

/**
 * Get translated message by key path
 * Example: t('nav.home') returns 'Home' in English, 'الرئيسية' in Arabic
 */
export function getMessage(language: Language, keyPath: string): string {
  const keys = keyPath.split('.');
  let value: any = messages[language];
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key as keyof typeof value];
    } else {
      // Fallback to English if key not found
      value = messages.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey as keyof typeof value];
        } else {
          return keyPath; // Return key path if not found anywhere
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : keyPath;
}
