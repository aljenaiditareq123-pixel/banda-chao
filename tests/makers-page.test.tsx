import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MakersPageClient from '@/app/[locale]/makers/page-client';

// Mock useLanguage hook
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe('Makers Page', () => {
  it('should show loading state when loading', () => {
    render(
      <MakersPageClient
        locale="en"
        makers={[]}
        pagination={{ page: 1, pageSize: 20, total: 0, totalPages: 0 }}
        loading={true}
      />
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should show error state when error occurs', () => {
    render(
      <MakersPageClient
        locale="en"
        makers={[]}
        pagination={{ page: 1, pageSize: 20, total: 0, totalPages: 0 }}
        error="Test error"
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('should display makers list when data is available', () => {
    const makers = [
      {
        id: '1',
        displayName: 'Test Maker 1',
        bio: 'Test bio',
        country: 'USA',
        languages: ['en'],
        rating: 4.5,
        reviewCount: 10,
        _count: { products: 5, videos: 3 },
      },
      {
        id: '2',
        displayName: 'Test Maker 2',
        bio: 'Test bio 2',
        country: 'China',
        languages: ['zh'],
        rating: 4.8,
        reviewCount: 15,
        _count: { products: 8, videos: 5 },
      },
    ];

    render(
      <MakersPageClient
        locale="en"
        makers={makers}
        pagination={{ page: 1, pageSize: 20, total: 2, totalPages: 1 }}
      />
    );

    expect(screen.getByText('Test Maker 1')).toBeInTheDocument();
    expect(screen.getByText('Test Maker 2')).toBeInTheDocument();
  });

  it('should show empty state when no makers', () => {
    render(
      <MakersPageClient
        locale="en"
        makers={[]}
        pagination={{ page: 1, pageSize: 20, total: 0, totalPages: 0 }}
      />
    );

    expect(screen.getByText(/No makers found/i)).toBeInTheDocument();
  });
});

