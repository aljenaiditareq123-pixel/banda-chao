'use client';

type ContactChannel = {
  id: string;
  label: string;
  handle: string;
  hint: string;
};

const defaultChannels: ContactChannel[] = [
  {
    id: 'wechat',
    label: 'WeChat',
    handle: '@panda-chao-artisan',
    hint: 'أرسل رسالة فورية للتنسيق الفوري مع فريق الصانع.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '+8613-8000-0000',
    hint: 'رقم أعمال مخصص للاستفسارات السريعة وتأكيد الطلبات.',
  },
  {
    id: 'email',
    label: 'Email',
    handle: 'creator@bandachao.com',
    hint: 'استخدم البريد الإلكتروني لإرسال عروض التعاون أو الملفات الكبيرة.',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@bandachao.creator',
    hint: 'تابع القصة المرئية اليومية للحرف اليدوية وروح الصانع.',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@panda.story',
    hint: 'اكتشف محتوى الفيديو القصير الذي يعرّف الجمهور على خبرة الصانع.',
  },
];

const ContactAggregator: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-right text-white shadow-[0_30px_80px_-40px_rgba(2,6,23,0.9)] backdrop-blur">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-emerald-200">
          شبكة العلاقات
        </p>
        <h3 className="text-xl font-bold text-white">
          روابط الاتصال والتعاون
        </h3>
        <p className="text-sm text-white/70">
          اجعل قصة الحرفي حاضرة عبر كل قناة. حدّث بياناتك وشاركها مع فرق Banda Chao التسويقية
          والشركاء المحتملين.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {defaultChannels.map((channel) => (
          <li
            key={channel.id}
            className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 shadow-[0_15px_35px_-30px_rgba(255,255,255,0.6)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">{channel.label}</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                قناة أساسية
              </span>
            </div>
            <p className="text-sm font-mono text-white">{channel.handle}</p>
            <p className="text-xs leading-relaxed text-white/60">{channel.hint}</p>
          </li>
        ))}
      </ul>

      <footer className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
        <p>حدّث قنواتك شهرياً لضمان استمرارية الثقة والتواصل مع العملاء.</p>
        <button
          type="button"
          className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          جدولة مراجعة الروابط
        </button>
      </footer>
    </div>
  );
};

export default ContactAggregator;
