/**
 * Voice Settings and Enhancement
 * إعدادات وتحسينات الصوت
 */

export interface VoiceSettings {
  lang: string;
  rate: number; // سرعة القراءة (0.1 - 10)
  pitch: number; // نبرة الصوت (0 - 2)
  volume: number; // مستوى الصوت (0 - 1)
  voice?: SpeechSynthesisVoice;
}

// أفضل إعدادات الصوت للعربية
export const defaultArabicVoice: VoiceSettings = {
  lang: 'ar-SA',
  rate: 0.95, // أبطأ قليلاً لأفضل وضوح
  pitch: 1.1, // نبرة طبيعية
  volume: 1,
};

// إعدادات الصوت للصينية
export const defaultChineseVoice: VoiceSettings = {
  lang: 'zh-CN',
  rate: 0.9,
  pitch: 1.0,
  volume: 1,
};

// إعدادات الصوت للإنجليزية
export const defaultEnglishVoice: VoiceSettings = {
  lang: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 1,
};

// الحصول على أفضل صوت متاح
export function getBestVoice(lang: string = 'ar-SA'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  
  // البحث عن صوت يطابق اللغة المطلوبة
  let bestVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
  
  // إذا لم نجد، نبحث عن أي صوت بالعربية
  if (!bestVoice && lang.startsWith('ar')) {
    bestVoice = voices.find(voice => 
      voice.lang.includes('ar') || 
      voice.name.toLowerCase().includes('arabic')
    );
  }
  
  // إذا لم نجد، نستخدم أفضل صوت متاح
  if (!bestVoice && voices.length > 0) {
    // نفضل أصوات Google أو Microsoft
    bestVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft')
    ) || voices[0];
  }
  
  return bestVoice || null;
}

// تحسين النص قبل القراءة
export function optimizeTextForSpeech(text: string): string {
  // إزالة الرموز الإيموجي من النص المنطوق
  let optimized = text
    .replace(/🎤|🎯|📱|💰|🔧|💡|✅|❌|⚠️|🚀|📊|🤖|👋|😊|⭐|🔥|📈|💬|🎉|📋|🔗|🎥|🛍️|👤|🔍|🌍|📝|🔮|❓|💾|🔐|🗄️|📄|🧩|🌐|🔒|⏳|📦|🖼️|💳|🔔|🇨🇳|📊|🎭|🛠️|💰|🎨|💬|🔍|📊|🎯|🌐|🤝|🎭|🔌|📱|📹|💬|🔍|📊|🎯|🌐|🤝|🎭|🔌|📱|📹|💬|🔍|📊|🎯|🌐|🤝|🎭|🔌|📱|📹|💬|🔍|📊|🎯|🌐|🤝|🎭|🔌|📱|📹|💬|🔍|📊|🎯|🌐|🤝|🎭|🔌|📱|📹|💬|🔍|📊|🎯|🌐|🤝|🎭|🔌|📱|📹/g, '')
    .replace(/\n\n+/g, '\n') // تقليل المسافات الزائدة
    .replace(/\s+/g, ' ') // تقليل المسافات المتعددة
    .trim();

  // إضافة فواصل طبيعية
  optimized = optimized
    .replace(/\. /g, '. ')
    .replace(/، /g, '، ')
    .replace(/\?/g, '؟')
    .replace(/!/g, '.');

  return optimized;
}

// إنشاء utterance محسّن
export function createOptimizedUtterance(
  text: string,
  settings: VoiceSettings = defaultArabicVoice
): SpeechSynthesisUtterance {
  const optimizedText = optimizeTextForSpeech(text);
  const utterance = new SpeechSynthesisUtterance(optimizedText);
  
  // تطبيق الإعدادات
  utterance.lang = settings.lang;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;
  
  // استخدام أفضل صوت متاح
  if (settings.voice) {
    utterance.voice = settings.voice;
  } else {
    const bestVoice = getBestVoice(settings.lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

  return utterance;
}

// فئة محسّنة لإدارة الصوت
export class EnhancedVoiceManager {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private settings: VoiceSettings;
  private onStart?: () => void;
  private onEnd?: () => void;
  private onError?: () => void;

  constructor(settings: VoiceSettings = defaultArabicVoice) {
    this.synthesis = window.speechSynthesis;
    this.settings = settings;
    
    // انتظار تحميل الأصوات
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.updateVoice();
      });
    } else {
      this.updateVoice();
    }
  }

  private updateVoice() {
    const bestVoice = getBestVoice(this.settings.lang);
    if (bestVoice) {
      this.settings.voice = bestVoice;
    }
  }

  setSettings(settings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.updateVoice();
  }

  setCallbacks(callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }) {
    this.onStart = callbacks.onStart;
    this.onEnd = callbacks.onEnd;
    this.onError = callbacks.onError;
  }

  speak(text: string, immediate: boolean = false) {
    // إيقاف أي كلام سابق
    if (immediate) {
      this.stop();
    }

    const utterance = createOptimizedUtterance(text, this.settings);

    utterance.onstart = () => {
      this.onStart?.();
    };

    utterance.onend = () => {
      this.onEnd?.();
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.onError?.();
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  stop() {
    if (this.currentUtterance) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.onEnd?.();
    }
  }

  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis.speaking && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }
}

