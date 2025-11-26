import HomePageClient from '@/components/home/HomePageClient';

export default function HomePage() {
  // Mock products data - in production, fetch from API
  const products: any[] = [];

  return <HomePageClient locale="zh" products={products} />;
}



