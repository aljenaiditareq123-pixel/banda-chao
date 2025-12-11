"use client";

import React, { useState } from 'react';

export default function RedEnvelope() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  // إذا تم إغلاق الظرف نهائياً
  if (isOpened && !isOpen) return null;

  return (
    <div className="fixed bottom-10 right-5 z-50 flex flex-col items-end">
      
      {/* الظرف المغلق - يظهر في البداية */}
      {!isOpen && !isOpened && (
        <button
          onClick={() => setIsOpen(true)}
          className="animate-bounce bg-red-600 hover:bg-red-700 text-yellow-300 border-2 border-yellow-400 p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
        >
          <div className="text-2xl">🧧</div>
          <div className="text-xs font-bold mt-1">افتح الحظ</div>
        </button>
      )}

      {/* النافذة المنبثقة عند فتح الظرف */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-red-600 w-full max-w-sm rounded-2xl p-6 text-center border-4 border-yellow-400 shadow-2xl relative overflow-hidden">
            
            {/* زر الإغلاق */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white w-6 h-6 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* الديكورات الصينية */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-400/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-400/20 rounded-full translate-x-1/2 translate-y-1/2"></div>

            <h2 className="text-yellow-300 text-3xl font-bold mb-2">مبارك لك!</h2>
            <p className="text-white mb-6">لقد حصلت على هدية "باندا تشاو"</p>
            
            <div className="bg-white rounded-lg p-4 mb-6 transform rotate-1">
              <p className="text-gray-500 text-sm">كود الخصم الخاص بك</p>
              <div className="text-3xl font-black text-red-600 tracking-wider my-2">PANDA88</div>
              <p className="text-red-500 text-xs font-bold">خصم 20% لفترة محدودة</p>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsOpened(true); // إخفاء الظرف بعد الاستخدام
                // يمكن إضافة redirect إلى صفحة المنتجات أو الكوبونات هنا
                // window.location.href = `/${locale}/products?coupon=PANDA88`;
              }}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-700 font-bold py-3 rounded-xl shadow-md transition-colors text-lg"
            >
              تسوق الآن واستخدم الكود
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
