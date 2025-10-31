import Link from 'next/link';
import { Product } from '@/types';
import LikeButton from './LikeButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100">
              <span className="text-4xl">📦</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-red-600 font-bold text-lg">{formatPrice(product.price)}</span>
              {product.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount})</span>
                </div>
              )}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton productId={product.id} initialLikes={product.rating || 0} />
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>
      </div>
    </Link>
  );
}
