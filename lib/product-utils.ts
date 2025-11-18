import { Product } from '@/types';
import { getApiBaseUrl } from './api-utils';

const FALLBACK_BACKEND_URL = 'https://banda-chao-backend.onrender.com';

/**
 * Gets the backend base URL without /api/v1 suffix
 * Removes /api/v1 from NEXT_PUBLIC_API_URL if present
 */
export const BACKEND_BASE_URL = ((): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Remove trailing slash
    let url = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    // Remove /api/v1 suffix if present
    url = url.replace(/\/api\/v1$/, '');
    return url;
  }
  return FALLBACK_BACKEND_URL;
})();

/**
 * Products endpoint - uses getApiBaseUrl() which already includes /api/v1
 */
export const PRODUCTS_ENDPOINT = `${getApiBaseUrl()}/products`;

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
      apiProduct.price === null || apiProduct.price === undefined
        ? null
        : typeof apiProduct.price === 'number'
        ? apiProduct.price
        : Number(apiProduct.price) || null,
    images,
    category: apiProduct.category && typeof apiProduct.category === 'string' ? apiProduct.category : 'Uncategorized',
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

