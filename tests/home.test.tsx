import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePageClient from '@/components/home/HomePageClient';

// Mock useLanguage hook
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe('HomePage', () => {
  it('should render hero section with headline', () => {
    render(
      <HomePageClient
        locale="en"
        featuredMakers={[]}
        featuredProducts={[]}
        featuredVideos={[]}
      />
    );

    expect(screen.getByText(/Global Home for Independent Makers/i)).toBeInTheDocument();
  });

  it('should render featured makers section', () => {
    const makers = [
      {
        id: '1',
        displayName: 'Test Maker',
        bio: 'Test bio',
        country: 'USA',
        languages: ['en'],
        rating: 4.5,
        reviewCount: 10,
        _count: { products: 5, videos: 3 },
      },
    ];

    render(
      <HomePageClient
        locale="en"
        featuredMakers={makers}
        featuredProducts={[]}
        featuredVideos={[]}
      />
    );

    expect(screen.getByText(/Featured Makers/i)).toBeInTheDocument();
    expect(screen.getByText('Test Maker')).toBeInTheDocument();
  });

  it('should render empty state when no content', () => {
    render(
      <HomePageClient
        locale="en"
        featuredMakers={[]}
        featuredProducts={[]}
        featuredVideos={[]}
      />
    );

    expect(screen.getByText(/Welcome to Banda Chao/i)).toBeInTheDocument();
  });
});



