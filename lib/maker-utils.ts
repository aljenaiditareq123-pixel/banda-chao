import { Maker } from '@/types';
import { BACKEND_BASE_URL } from './product-utils';

export const MAKERS_ENDPOINT = `${BACKEND_BASE_URL}/api/v1/makers`;

export function normalizeMaker(apiMaker: any): Maker {
  if (!apiMaker) {
    return {
      id: '',
      userId: '',
      slug: '',
      name: 'Unknown Maker',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // New API format (with user relation)
  const maker: Maker = {
    id: String(apiMaker.id ?? ''),
    userId: String(apiMaker.userId ?? apiMaker.user?.id ?? ''),
    slug: String(apiMaker.slug ?? ''),
    name: apiMaker.name ?? 'Unnamed Maker',
    bio: apiMaker.bio ?? null,
    story: apiMaker.story ?? null,
    profilePictureUrl: apiMaker.profilePictureUrl ?? null,
    coverPictureUrl: apiMaker.coverPictureUrl ?? null,
    createdAt: apiMaker.createdAt ?? new Date().toISOString(),
    updatedAt: apiMaker.updatedAt ?? new Date().toISOString(),
    user: apiMaker.user ? {
      id: apiMaker.user.id,
      name: apiMaker.user.name,
      email: apiMaker.user.email,
      profilePicture: apiMaker.user.profilePicture ?? null,
      bio: apiMaker.user.bio ?? null,
      createdAt: apiMaker.user.createdAt,
    } : undefined,
    // Legacy fields for backward compatibility
    coverImage: apiMaker.coverPictureUrl ?? apiMaker.coverImage ?? apiMaker.bannerImage,
    profilePicture: apiMaker.profilePictureUrl ?? apiMaker.user?.profilePicture ?? apiMaker.profilePicture ?? apiMaker.avatar ?? apiMaker.photo,
    location: apiMaker.location ?? apiMaker.city,
    tagline: apiMaker.tagline ?? apiMaker.subtitle,
    socialLinks: apiMaker.socialLinks ?? undefined,
  };

  return maker;
}

export function deriveMakerFromProduct(payload: {
  makerId: string;
  name?: string;
  profilePicture?: string;
}): Maker {
  return {
    id: payload.makerId,
    userId: payload.makerId, // Fallback: assume makerId is userId if not provided
    slug: payload.makerId, // Fallback: use makerId as slug
    name: payload.name ?? 'Unnamed Maker',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profilePicture: payload.profilePicture,
  };
}

