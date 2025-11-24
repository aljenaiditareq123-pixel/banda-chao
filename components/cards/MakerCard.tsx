import React from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';

interface MakerCardProps {
  maker: {
    id: string;
    displayName: string;
    bio?: string;
    country?: string;
    city?: string;
    languages: string[];
    rating: number;
    reviewCount: number;
    avatarUrl?: string;
    user?: {
      name: string;
      profilePicture?: string;
    };
    _count?: {
      products: number;
      videos: number;
    };
  };
  href: string;
  locale: string;
}

export default function MakerCard({ maker, href, locale }: MakerCardProps) {
  return (
    <Link href={href} className="block">
      <Card hover>
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {maker.avatarUrl || maker.user?.profilePicture ? (
                <img
                  src={maker.avatarUrl || maker.user?.profilePicture}
                  alt={maker.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="mr-4 flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {maker.displayName}
              </h3>
              {maker.country && (
                <p className="text-sm text-gray-600 truncate">
                  {maker.city ? `${maker.city}, ` : ''}{maker.country}
                </p>
              )}
            </div>
          </div>
          
          {maker.bio && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {maker.bio}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500">
              <span>
                {maker._count?.products || 0} {locale === 'ar' ? 'منتج' : 'products'}
              </span>
              <span>
                {maker._count?.videos || 0} {locale === 'ar' ? 'فيديو' : 'videos'}
              </span>
            </div>
            {maker.rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{maker.rating.toFixed(1)}</span>
                <span className="text-gray-500">({maker.reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

