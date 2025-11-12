import { Maker } from '@/types';
import { BACKEND_BASE_URL } from './product-utils';

export const MAKERS_ENDPOINT = `${BACKEND_BASE_URL}/api/v1/makers`;

export function normalizeMaker(apiMaker: any): Maker {
  if (!apiMaker) {
    return {
      id: '',
      name: 'Unknown Maker',
    };
  }

  return {
    id: String(apiMaker.id ?? apiMaker._id ?? ''),
    name: apiMaker.name ?? apiMaker.fullName ?? 'Unnamed Maker',
    bio: apiMaker.bio ?? apiMaker.tagline ?? apiMaker.description,
    story: apiMaker.story ?? apiMaker.about,
    coverImage: apiMaker.coverImage ?? apiMaker.bannerImage,
    profilePicture: apiMaker.profilePicture ?? apiMaker.avatar ?? apiMaker.photo,
    location: apiMaker.location ?? apiMaker.city,
    tagline: apiMaker.tagline ?? apiMaker.subtitle,
    socialLinks: apiMaker.socialLinks ?? undefined,
  };
}

export function deriveMakerFromProduct(payload: {
  makerId: string;
  name?: string;
  profilePicture?: string;
}): Maker {
  return {
    id: payload.makerId,
    name: payload.name ?? 'Unnamed Maker',
    profilePicture: payload.profilePicture,
  };
}

