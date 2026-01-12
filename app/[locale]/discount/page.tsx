import DiscountPageClient from './page-client';

interface LocaleDiscountPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    code?: string;
  };
}

export default function LocaleDiscountPage({ params, searchParams }: LocaleDiscountPageProps) {
  const { locale } = params;
  const code = searchParams.code;

  return <DiscountPageClient locale={locale} initialCode={code} />;
}





