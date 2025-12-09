/**
 * إعدادات الشحن لاستراتيجية Hub Model (الصين -> الإمارات -> العالم)
 * Shipping Rates Configuration for Hub Model (China -> UAE -> World)
 * 
 * الاستراتيجية:
 * 1. المرحلة الأولى: الشحن من الصين → مخازن رأس الخيمة (الإمارات)
 * 2. المرحلة الثانية: رسوم المناولة والتجهيز في الإمارات
 * 3. المرحلة الثالثة: الشحن من رأس الخيمة → العميل (حسب الدولة)
 * 
 * Domestic China Shipping (الصين -> الصين):
 * - شحن محلي مباشر من الحرفي إلى العميل داخل الصين
 * - بدون المرور عبر مخازن الإمارات
 * - أسعار منخفضة ومباشرة
 */

// الأسعار بالدرهم الإماراتي (AED)
export const SHIPPING_STRATEGY = {
  // تكلفة الشحن من الصين إلى مخازن الإمارات (بالدرهم لكل كيلوجرام)
  CHINA_TO_UAE_RATE_PER_KG: 15, // 15 درهم للكيلو

  // رسوم المناولة والتجهيز في مخازن رأس الخيمة (مبلغ ثابت لكل طلب)
  UAE_HANDLING_FEE: 25, // 25 درهم رسوم تشغيلية

  // أسعار الشحن من الإمارات إلى العالم (بالدرهم لكل كيلوجرام)
  UAE_TO_WORLD_RATES: {
    US: 40,      // أمريكا - 40 درهم للكيلو
    EU: 35,      // أوروبا - 35 درهم للكيلو
    GCC: 20,     // الخليج - 20 درهم للكيلو
    DEFAULT: 50, // باقي دول العالم - 50 درهم للكيلو
  },

  // أسعار الشحن المحلي داخل الصين (الصين -> الصين)
  // Domestic China shipping rates (flat rate or per kg)
  DOMESTIC_CN_RATE_PER_KG: 5, // 5 درهم للكيلو (شحن محلي مباشر)
  DOMESTIC_CN_FLAT_FEE: 10,   // 10 درهم رسوم ثابتة (أو يمكن استخدامها كحد أدنى)
} as const;

// قائمة الدول الأوروبية
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'UK',
];

// قائمة دول الخليج
const GCC_COUNTRIES = ['AE', 'SA', 'KW', 'QA', 'BH', 'OM'];

/**
 * تحديد منطقة الشحن بناءً على رمز الدولة
 */
function getShippingRegion(countryCode: string): 'US' | 'EU' | 'GCC' | 'DEFAULT' {
  const upperCode = countryCode.toUpperCase();

  if (upperCode === 'US') return 'US';
  if (EU_COUNTRIES.includes(upperCode)) return 'EU';
  if (GCC_COUNTRIES.includes(upperCode)) return 'GCC';

  return 'DEFAULT';
}

/**
 * واجهة تفاصيل حساب الشحن
 */
export interface ShippingCalculationDetails {
  chinaToUae: number;      // تكلفة المرحلة الأولى (الصين -> الإمارات) - 0 للشحن المحلي
  handling: number;         // رسوم المناولة في الإمارات - 0 للشحن المحلي
  uaeToCustomer: number;    // تكلفة المرحلة الثالثة (الإمارات -> العميل) - 0 للشحن المحلي
  total: number;           // المجموع الكلي
  region: 'US' | 'EU' | 'GCC' | 'DEFAULT' | 'DOMESTIC_CN'; // منطقة الشحن
  isDomestic: boolean;     // true إذا كان الشحن محلي (CN -> CN)
}

/**
 * حساب تكلفة الشحن المحلي داخل الصين (الصين -> الصين)
 * Domestic China shipping calculation (CN -> CN)
 * 
 * @param weightInKg - الوزن بالكيلوجرام
 * @returns تفاصيل حساب الشحن المحلي
 */
export function calculateDomesticChinaShipping(
  weightInKg: number
): ShippingCalculationDetails {
  // حساب الشحن المحلي: سعر ثابت + (الوزن × السعر لكل كيلو)
  const domesticCost = SHIPPING_STRATEGY.DOMESTIC_CN_FLAT_FEE + 
                       (weightInKg * SHIPPING_STRATEGY.DOMESTIC_CN_RATE_PER_KG);
  
  return {
    chinaToUae: 0,        // لا يوجد شحن إلى الإمارات
    handling: 0,          // لا توجد رسوم معالجة في الإمارات
    uaeToCustomer: 0,     // لا يوجد شحن من الإمارات
    total: Math.ceil(domesticCost), // تقريب للأعلى
    region: 'DOMESTIC_CN',
    isDomestic: true,
  };
}

/**
 * حساب تكلفة الشحن الكلية بناءً على استراتيجية Hub Model
 * 
 * @param destinationCountry - رمز الدولة (مثل: 'US', 'DE', 'SA', 'CN')
 * @param weightInKg - الوزن بالكيلوجرام
 * @param originCountry - رمز دولة المنشأ (افتراضي: 'CN' - الصين)
 * @returns تفاصيل حساب الشحن
 */
export function calculateHubShipping(
  destinationCountry: string,
  weightInKg: number,
  originCountry: string = 'CN'
): ShippingCalculationDetails {
  // التحقق من الشحن المحلي (الصين -> الصين)
  const isDomestic = originCountry.toUpperCase() === 'CN' && 
                     destinationCountry.toUpperCase() === 'CN';
  
  if (isDomestic) {
    return calculateDomesticChinaShipping(weightInKg);
  }

  // تحديد منطقة الشحن (للمبيعات الدولية)
  const region = getShippingRegion(destinationCountry);

  // 1. حساب تكلفة المرحلة الأولى (الصين -> الإمارات)
  const leg1Cost = weightInKg * SHIPPING_STRATEGY.CHINA_TO_UAE_RATE_PER_KG;

  // 2. حساب تكلفة المرحلة الثالثة (الإمارات -> العميل)
  const rateToCustomer = SHIPPING_STRATEGY.UAE_TO_WORLD_RATES[region];
  const leg2Cost = weightInKg * rateToCustomer;

  // 3. المجموع الكلي + رسوم المناولة
  const totalShipping = leg1Cost + leg2Cost + SHIPPING_STRATEGY.UAE_HANDLING_FEE;

  return {
    chinaToUae: Math.ceil(leg1Cost * 100) / 100,      // تقريب لرقمين عشريين
    handling: SHIPPING_STRATEGY.UAE_HANDLING_FEE,
    uaeToCustomer: Math.ceil(leg2Cost * 100) / 100,
    total: Math.ceil(totalShipping),                  // تقريب للأعلى
    region,
    isDomestic: false,
  };
}

/**
 * حساب تكلفة الشحن لعدة منتجات (مجموع الأوزان)
 * 
 * @param destinationCountry - رمز الدولة الوجهة
 * @param items - قائمة المنتجات مع أوزانها
 * @param originCountry - رمز دولة المنشأ (افتراضي: 'CN' - الصين)
 * @returns تفاصيل حساب الشحن
 */
export function calculateHubShippingForItems(
  destinationCountry: string,
  items: Array<{ weightInKg?: number; quantity: number }>,
  originCountry: string = 'CN'
): ShippingCalculationDetails {
  // حساب الوزن الإجمالي (الوزن الافتراضي 1 كجم إذا لم يحدد)
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = item.weightInKg || 1; // وزن افتراضي 1 كجم
    return sum + (itemWeight * item.quantity);
  }, 0);

  return calculateHubShipping(destinationCountry, totalWeight, originCountry);
}
