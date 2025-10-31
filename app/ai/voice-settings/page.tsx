'use client';

import { useState, useEffect } from 'react';
import { EnhancedVoiceManager, getBestVoice, defaultArabicVoice, defaultChineseVoice, defaultEnglishVoice } from '@/lib/ai/voice';
import Link from 'next/link';

export default function VoiceSettingsPage() {
  const [voiceManager, setVoiceManager] = useState<EnhancedVoiceManager | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedLang, setSelectedLang] = useState('ar-SA');
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.1);
  const [volume, setVolume] = useState(1);
  const [testText, setTestText] = useState('مرحباً، هذه تجربة لتحسين جودة الصوت');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      const manager = new EnhancedVoiceManager(defaultArabicVoice);
      setVoiceManager(manager);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        manager.stop();
      };
    }
  }, []);

  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    if (voiceManager) {
      const settings = 
        lang.startsWith('ar') ? defaultArabicVoice :
        lang.startsWith('zh') ? defaultChineseVoice :
        defaultEnglishVoice;
      
      voiceManager.setSettings({
        ...settings,
        rate,
        pitch,
        volume,
      });
    }
  };

  const handleTest = () => {
    if (voiceManager) {
      const settings = 
        selectedLang.startsWith('ar') ? defaultArabicVoice :
        selectedLang.startsWith('zh') ? defaultChineseVoice :
        defaultEnglishVoice;
      
      voiceManager.setSettings({
        ...settings,
        rate,
        pitch,
        volume,
      });
      
      voiceManager.speak(testText || 'تجربة صوتية', true);
    }
  };

  const availableVoices = voices.filter(v => 
    selectedLang.startsWith('ar') ? v.lang.includes('ar') :
    selectedLang.startsWith('zh') ? v.lang.includes('zh') :
    v.lang.includes('en')
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/ai/chat" className="text-red-600 hover:text-red-700 mb-4 inline-block">
            ← العودة للدردشة
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎚️ إعدادات الصوت</h1>
          <p className="text-gray-600">حسّن جودة الصوت لجعل المحادثة أكثر طبيعية</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اللغة / Language
            </label>
            <select
              value={selectedLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ar-SA">العربية (Arabic)</option>
              <option value="zh-CN">中文 (Chinese)</option>
              <option value="en-US">English</option>
            </select>
          </div>

          {/* Rate (Speed) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السرعة (Rate): {rate.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={rate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setRate(newRate);
                if (voiceManager) {
                  voiceManager.setSettings({ rate: newRate });
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>بطيء</span>
              <span>طبيعي</span>
              <span>سريع</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              النبرة (Pitch): {pitch.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => {
                const newPitch = parseFloat(e.target.value);
                setPitch(newPitch);
                if (voiceManager) {
                  voiceManager.setSettings({ pitch: newPitch });
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>منخفض</span>
              <span>طبيعي</span>
              <span>عالي</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مستوى الصوت (Volume): {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (voiceManager) {
                  voiceManager.setSettings({ volume: newVolume });
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>منخفض</span>
              <span>متوسط</span>
              <span>عالٍ</span>
            </div>
          </div>

          {/* Test */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نص التجربة / Test Text
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="اكتب نصاً للتجربة..."
            />
            <button
              onClick={handleTest}
              className="mt-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🔊 تجربة الصوت
            </button>
          </div>

          {/* Available Voices */}
          {availableVoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأصوات المتاحة ({availableVoices.length})
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {availableVoices.map((voice, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 py-1"
                  >
                    {voice.name} ({voice.lang}) {voice.default && '⭐'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t">
            <button
              onClick={() => {
                // Save to localStorage
                localStorage.setItem('voiceSettings', JSON.stringify({
                  lang: selectedLang,
                  rate,
                  pitch,
                  volume,
                }));
                alert('تم حفظ الإعدادات!');
              }}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              💾 حفظ الإعدادات
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 نصائح لجودة صوت أفضل:</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
            <li>استخدم Chrome أو Edge للحصول على أفضل جودة صوت</li>
            <li>السرعة 0.9-1.0 هي الأفضل للوضوح</li>
            <li>النبرة 1.0-1.2 تبدو أكثر طبيعية</li>
            <li>جرب أصوات Google أو Microsoft - عادة ما تكون أفضل</li>
            <li>تأكد من أن مستوى الصوت في المتصفح مناسب</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

