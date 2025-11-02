import ProfilePageClient from './page-client';

export const dynamic = 'force-dynamic';

export default function ProfilePage({ params }: { params: { id: string } }) {
  return <ProfilePageClient userId={params.id} />;
}
