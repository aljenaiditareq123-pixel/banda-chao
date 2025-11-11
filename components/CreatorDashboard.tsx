'use client';

import { ChangeEvent, useRef, useState } from 'react';

import ContactAggregator from '@/components/ContactAggregator';

const CreatorDashboard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleShortVideoClick = () => {
    if (uploadStatus === 'uploading') {
      return;
    }
    fileInputRef.current?.click();
  };

  const uploadVideo = async (file: File) => {
    try {
      setUploadStatus('uploading');
      setUploadMessage('جارٍ رفع الفيديو... يرجى الانتظار.');

      const presignResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
        }),
      });

      if (!presignResponse.ok) {
        throw new Error(`Failed to request upload URL (${presignResponse.status})`);
      }

      const { uploadUrl } = (await presignResponse.json()) as { uploadUrl: string };

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      setUploadStatus('success');
      setUploadMessage('تم رفع الفيديو بنجاح! سيتم ربطه بقصتك فور المعالجة.');
    } catch (error) {
      console.error('Short video upload failed', error);
      setUploadStatus('error');
      setUploadMessage('تعذر رفع الفيديو. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleVideoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type || !file.type.startsWith('video/')) {
      setUploadStatus('error');
      setUploadMessage('يرجى اختيار ملف فيديو صالح.');
      event.target.value = '';
      return;
    }

    await uploadVideo(file);

    event.target.value = '';
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = uploadStatus === 'uploading';

  type UploadAction = {
    id: string;
    label: string;
    description: string;
    accent: string;
    emoji: string;
    onClick?: () => void;
    isDisabled?: boolean;
  };

  const actions: UploadAction[] = [
    {
      id: 'short',
      label: 'إضافة فيديو قصير',
      description: '60 ثانية لأسر قلوب الجمهور.',
      accent: 'from-rose-500 to-rose-400',
      emoji: '🎬',
      onClick: handleShortVideoClick,
      isDisabled: isUploading,
    },
    {
      id: 'long',
      label: 'إضافة فيديو طويل',
      description: 'شرح مفصّل لرحلة المنتج.',
      accent: 'from-violet-500 to-indigo-400',
      emoji: '📹',
    },
    {
      id: 'post',
      label: 'إضافة منشور سردي',
      description: 'لقطات وصور تدعم القصة.',
      accent: 'from-amber-500 to-orange-400',
      emoji: '📝',
    },
  ];

  const uploadMessageClassName =
    uploadStatus === 'success'
      ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-100'
      : uploadStatus === 'error'
      ? 'border-rose-400/60 bg-rose-500/15 text-rose-100'
      : 'border-amber-300/60 bg-amber-500/15 text-amber-100';

  return (
    <section className="flex flex-col gap-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-black/60 via-black/40 to-black/30 p-8 text-right text-white shadow-[0_45px_120px_-60px_rgba(2,6,23,0.95)] backdrop-blur">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 self-end rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold tracking-widest text-white/75">
          نبض الحرف اليدوية · Banda Chao
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black leading-relaxed">
            لوحة تحكم الحرفي · احكِ قصتك، وزّع إبداعك، وابنِ مجتمعك
          </h2>
          <p className="max-w-3xl text-sm text-white/70">
            تم تصميم هذه الواجهة لتقدم كل ما يحتاجه صانع Banda Chao: من إطلاق الفيديو الأول إلى تفعيل
            قنوات البيع والتواصل. ركّز على الحرفة، ودع المنصة تتولّى تنظيم التجربة.
          </p>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        {/* واجهة رفع المحتوى */}
        <section className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_90px_-55px_rgba(59,130,246,0.65)]">
          <header className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-sky-200">واجهة رفع المحتوى</p>
            <h3 className="text-2xl font-bold text-white">الحكاية تبدأ من الفيديو الأول</h3>
            <p className="text-sm text-white/70">
              شارك مراحل صناعة المنتج، خلف الكواليس، أو رسائل الشكر من العملاء. كل فيديو يبني ثقة
              ويزيد ولاء المجتمع.
            </p>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoSelected}
            disabled={isUploading}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {actions.map((action) => {
              const disabled = Boolean(action.isDisabled);
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => action.onClick?.()}
                  disabled={disabled}
                  className={`group flex flex-col gap-2 rounded-2xl border border-white/10 bg-gradient-to-br ${action.accent} px-4 py-3 text-right text-white shadow-[0_20px_45px_-35px_rgba(255,255,255,0.8)] transition focus:outline-none focus:ring-2 focus:ring-white/60 ${
                    disabled
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(255,255,255,0.85)]'
                  }`}
                >
                  <span className="flex items-center justify-between text-sm font-semibold">
                    {action.label}
                    <span aria-hidden className="text-lg transition-transform group-hover:scale-110">
                      {action.emoji}
                    </span>
                  </span>
                  <span className="text-xs text-white/80">{action.description}</span>
                </button>
              );
            })}
          </div>

          {uploadMessage ? (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${uploadMessageClassName}`}
            >
              {uploadMessage}
            </div>
          ) : null}

          <div className="rounded-2xl border border-dashed border-white/20 bg-black/40 px-5 py-6 text-sm text-white/70">
            <p>
              لم تصنع محتوى اليوم؟ شارك لحظة بسيطة من الورشة أو رسالة من عميل. الاستمرارية هي سر
              بناء الجمهور في Banda Chao.
            </p>
          </div>
        </section>

        {/* منطقة المنتجات */}
        <section className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-50px_rgba(16,185,129,0.65)]">
          <header className="space-y-1">
            <p className="text-xs font-semibold tracking-widest text-emerald-200">منطقة المنتجات</p>
            <h3 className="text-xl font-bold text-white">حوّل شغفك إلى منتجات محبوبة</h3>
          </header>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm leading-relaxed text-white/70">
            <p>
              أضف منتجاتك المميزة، حدّث المخزون، واضبط التسعير حسب الأسواق المستهدفة. نتولى ربطها
              بمحتواك المرفوع على التطبيق.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-white/80">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
              <div>
                <p className="font-semibold text-white">Earrings · مجموعة ألوان الخريف</p>
                <p className="text-xs text-white/60">جاهز للشحن · تحديث المخزون خلال 3 أيام</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                تحديث التفاصيل
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
              <div>
                <p className="font-semibold text-white">Teaware · طقم شاي يدوي</p>
                <p className="text-xs text-white/60">قيد الإنتاج · فيديو توضيحي جاهز للنشر</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                تنشيط البيع
              </button>
            </div>
          </div>

          <button
            type="button"
            className="self-start rounded-xl border border-emerald-300/50 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-200/70"
          >
            إضافة منتج جديد
          </button>
        </section>
      </div>

      {/* منطقة الروابط والتواصل */}
      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_-55px_rgba(147,197,253,0.7)]">
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-blue-200">منطقة الروابط والتواصل</p>
          <h3 className="text-2xl font-bold text-white">
            أبقِ فريق Banda Chao والجمهور على اتصال مباشر معك
          </h3>
          <p className="text-sm text-white/70">
            اجمع كل وسائل التواصل في مكان واحد. حين ينشر فريق المحتوى قصة جديدة أو يتم إطلاق حملة
            تسويق، يمكنهم الوصول إلى أحدث بيانات الاتصال فوراً.
          </p>
        </header>

        <ContactAggregator />
      </section>
    </section>
  );
};

export default CreatorDashboard;
