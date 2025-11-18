'use client';

import React from 'react';

export default function UploadPagePlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="max-w-xl w-full bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4 text-center">
        <h1 className="text-2xl font-bold">لوحة رفع الفيديوهات والمنتجات</h1>
        <p className="text-sm text-slate-300">
          هذه الصفحة قيد إعادة البناء حالياً لتعمل بالكامل مع الـ Express API.
        </p>
        <p className="text-sm text-slate-300">
          يمكنك استخدام المنصة حالياً لتصفح الفيديوهات والمنتجات. سيتم تفعيل الرفع في إصدار قادم.
        </p>
      </div>
    </div>
  );
}
