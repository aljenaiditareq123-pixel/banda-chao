import AICouncil from '@/components/admin/AICouncil';

export const dynamic = 'force-dynamic';

export default function AICouncilPage() {
  return (
    <div dir="rtl" lang="ar">
      <AICouncilPageClient />
    </div>
  );
}

function AICouncilPageClient() {
  return (
    <div className="space-y-6">
      <AICouncil />
    </div>
  );
}
