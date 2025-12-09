/**
 * إعدادات الشحن لاستراتيجية Hub Model (الصين -> الإمارات -> العالم)
 * Shipping Rates Configuration for Hub Model (China -> UAE -> World)
 * 
 * الاستراتيجية:
 * 1. المرحلة الأولى: الشحن من الصين → مخازن رأس الخيمة (الإمارات)
 * 2. المرحلة الثانية: رسوم المناولة والتجهيز في الإمارات
 * 3. المرحلة الثالثة: الشحن من رأس الخيمة → العميل (حسب الدولة)
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
  chinaToUae: number;      // تكلفة المرحلة الأولى (الصين -> الإمارات)
  handling: number;        // رسوم المناولة في الإمارات
  uaeToCustomer: number;   // تكلفة المرحلة الثالثة (الإمارات -> العميل)
  total: number;           // المجموع الكلي
  region: 'US' | 'EU' | 'GCC' | 'DEFAULT'; // منطقة الشحن
}

/**
 * حساب تكلفة الشحن الكلية بناءً على استراتيجية Hub Model
 * 
 * @param destinationCountry - رمز الدولة (مثل: 'US', 'DE', 'SA')
 * @param weightInKg - الوزن بالكيلوجرام
 * @returns تفاصيل حساب الشحن
 */
export function calculateHubShipping(
  destinationCountry: string,
  weightInKg: number
): ShippingCalculationDetails {
  // تحديد منطقة الشحن
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
  };
}

/**
 * حساب تكلفة الشحن لعدة منتجات (مجموع الأوزان)
 * 
 * @param destinationCountry - رمز الدولة
 * @param items - قائمة المنتجات مع أوزانها
 * @returns تفاصيل حساب الشحن
 */
export function calculateHubShippingForItems(
  destinationCountry: string,
  items: Array<{ weightInKg?: number; quantity: number }>
): ShippingCalculationDetails {
  // حساب الوزن الإجمالي (الوزن الافتراضي 1 كجم إذا لم يحدد)
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = item.weightInKg || 1; // وزن افتراضي 1 كجم
    return sum + (itemWeight * item.quantity);
  }, 0);

  return calculateHubShipping(destinationCountry, totalWeight);
}
