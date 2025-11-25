import Link from 'next/link';
import { Product } from '@/types';
import Card from '@/components/common/Card';

interface ProductCardProps {
  product: Product;
  href: string;
}

export default function ProductCard({ product, href }: ProductCardProps) {
  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  return (
    <Link href={href} className="block">
      <Card hover>
        <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide broken image and show placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
            🛍️
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          {product.price && (
            <p className="text-lg font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

