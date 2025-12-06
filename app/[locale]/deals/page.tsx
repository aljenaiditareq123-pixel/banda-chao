import { notFound } from 'next/navigation';
import DailyDealsPageClient from './page-client';
import { productsAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function DailyDealsPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch products with deals/discounts
  // For now, we'll fetch all products and filter on frontend
  // In production, you'd have a dedicated deals endpoint
  let dealsProducts: any[] = [];

  try {
    const response = await productsAPI.getAll({ limit: 50 });
    // Filter products that might have discounts (you can add a discount field later)
    dealsProducts = (response.data || []).slice(0, 20); // Show top 20 as deals
  } catch (error) {
    console.error('Error fetching deals products:', error);
  }

  return <DailyDealsPageClient locale={locale} initialProducts={dealsProducts} />;
}

