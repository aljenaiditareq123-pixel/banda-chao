'use client';

import PostsFeed from '@/components/social/PostsFeed';

interface PostsPageClientProps {
  locale: string;
}

export default function PostsPageClient({ locale }: PostsPageClientProps) {
  return <PostsFeed locale={locale} />;
}

