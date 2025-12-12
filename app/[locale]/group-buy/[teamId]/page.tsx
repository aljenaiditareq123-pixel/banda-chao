import { notFound } from 'next/navigation';
import GroupBuyLobbyClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
    teamId: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function GroupBuyLobbyPage({ params }: PageProps) {
  let locale: string;
  let teamId: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    teamId = resolvedParams.teamId;
  } catch (error) {
    console.error('Error resolving params in group buy lobby:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  if (!teamId || teamId === 'favicon.ico' || teamId.includes('.')) {
    notFound();
  }

  // In production, fetch team data from API
  // For now, use mock data
  const mockTeamData = {
    id: teamId,
    productId: 'product-1',
    productName: 'Premium Product',
    productImage: '/placeholder-product.jpg',
    soloPrice: 150,
    teamPrice: 90,
    currency: 'AED',
    leaderName: 'Wang',
    leaderAvatar: null,
    members: [
      { id: 'member-1', name: 'Wang', avatar: null },
    ],
    maxMembers: 3,
    expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes from now
  };

  return (
    <GroupBuyLobbyClient
      locale={locale}
      teamId={teamId}
      teamData={mockTeamData}
    />
  );
}
