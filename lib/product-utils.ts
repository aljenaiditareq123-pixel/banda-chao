import { Product } from '@/types';

const FALLBACK_BACKEND_URL = 'https://banda-chao-backend.onrender.com';

export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? FALLBACK_BACKEND_URL;

export const PRODUCTS_ENDPOINT = `${BACKEND_BASE_URL}/api/v1/products`;

export function normalizeProduct(apiProduct: any): Product {
  const images = Array.isArray(apiProduct.images)
    ? apiProduct.images
    : apiProduct.imageUrl
    ? [apiProduct.imageUrl]
    : [];

  return {
    id: String(apiProduct.id ?? apiProduct._id ?? ''),
    userId: String(apiProduct.userId ?? apiProduct.user?.id ?? ''),
    name: apiProduct.name ?? 'Untitled Product',
    description: apiProduct.description ?? '',
    price:
      typeof apiProduct.price === 'number'
        ? apiProduct.price
        : Number(apiProduct.price) || 0,
    images,
    category: apiProduct.category ?? 'Uncategorized',
    stock:
      typeof apiProduct.stock === 'number'
        ? apiProduct.stock
        : Number(apiProduct.stock) || 0,
    rating:
      typeof apiProduct.rating === 'number'
        ? apiProduct.rating
        : Number(apiProduct.averageRating) || 0,
    reviewCount:
      typeof apiProduct.reviewCount === 'number'
        ? apiProduct.reviewCount
        : Number(apiProduct.reviewCount) || 0,
    createdAt: apiProduct.createdAt ?? new Date().toISOString(),
    externalLink: apiProduct.externalLink,
    maker: apiProduct.user
      ? {
          id: String(apiProduct.user.id ?? ''),
          name: apiProduct.user.name,
          profilePicture: apiProduct.user.profilePicture,
        }
      : undefined,
  };
}

