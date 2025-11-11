import FounderAIAssistant from '@/components/FounderAIAssistant';

export const metadata = {
  title: 'مركز قيادة فريق الذكاء الاصطناعي المؤسس',
};

export default function FounderDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-16 text-right text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-3 self-end rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white/80 tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            فريق الذكاء الاصطناعي القيادي
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            مركز قيادة فريق الذكاء الاصطناعي المؤسس
          </h1>
          <p className="max-w-3xl text-sm text-white/70">
            هذه المساحة محجوزة لتوجيه Banda Chao من منظور قيادي شامل. ستة مساعدين متخصصين يعملون
            بتنسيق كامل: الرؤية، التقنية، الأمن، التجارة، المحتوى، واللوجستيات. اجمع آرائهم، وحوّلها
            إلى خطوات تنفيذية واضحة.
          </p>
        </header>

        <FounderAIAssistant />
      </div>
    </div>
  );
}
