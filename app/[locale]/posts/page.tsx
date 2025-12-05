import PostsFeed from '@/components/social/PostsFeed';

interface PostsPageProps {
  params: {
    locale: string;
  };
}

export default function PostsPage({ params }: PostsPageProps) {
  return <PostsFeed locale={params.locale} />;
}

