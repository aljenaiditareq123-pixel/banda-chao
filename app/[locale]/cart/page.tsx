import CartPageClient from './page-client';

interface CartPageProps {
  params: {
    locale: string;
  };
}

export default function CartPage({ params }: CartPageProps) {
  return <CartPageClient locale={params.locale} />;
}

