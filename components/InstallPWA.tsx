'use client';

import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed (iOS)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    
    if (isIOS && !isStandalone) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS instructions
      alert('لتثبيت التطبيق على iPhone/iPad:\n\n1. اضغط زر المشاركة (Share)\n2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">📱 تثبيت التطبيق</h3>
            <p className="text-sm opacity-90">
              ثبت Banda Chao على هاتفك للوصول السريع!
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="ml-4 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
          >
            تثبيت
          </button>
        </div>
      </div>
    </div>
  );
}


