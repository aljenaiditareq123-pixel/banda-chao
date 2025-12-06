import PostsFeed from '@/components/social/PostsFeed';

interface PostsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { locale } = await params;
  return <PostsFeed locale={locale} />;
}

