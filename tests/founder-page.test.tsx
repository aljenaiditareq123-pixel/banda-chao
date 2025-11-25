import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FounderConsole from '@/components/founder/FounderConsole';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'founder@test.com',
      name: 'Founder',
      role: 'FOUNDER',
    },
    loading: false,
  }),
}));

vi.mock('@/hooks/useFounderKpis', () => ({
  useFounderKpis: () => ({
    kpis: {
      totalArtisans: 10,
      totalProducts: 25,
      totalVideos: 15,
      totalUsers: 50,
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  makersAPI: {
    getAll: vi.fn().mockResolvedValue({ makers: [] }),
  },
  productsAPI: {
    getAll: vi.fn().mockResolvedValue({ products: [] }),
  },
  videosAPI: {
    getAll: vi.fn().mockResolvedValue({ videos: [] }),
  },
  aiAPI: {
    assistant: vi.fn().mockResolvedValue({ response: 'Test response' }),
  },
}));

describe('Founder Console', () => {
  it('should render Arabic text only', () => {
    render(<FounderConsole />);

    expect(screen.getByText(/لوحة تحكم المؤسس/i)).toBeInTheDocument();
    expect(screen.getByText(/إجمالي الحرفيين/i)).toBeInTheDocument();
  });

  it('should display KPI cards', () => {
    render(<FounderConsole />);

    expect(screen.getByText(/إجمالي الحرفيين/i)).toBeInTheDocument();
    expect(screen.getByText(/إجمالي المنتجات/i)).toBeInTheDocument();
    expect(screen.getByText(/إجمالي الفيديوهات/i)).toBeInTheDocument();
    expect(screen.getByText(/إجمالي المستخدمين/i)).toBeInTheDocument();
  });

  it('should display AI Assistant section', () => {
    render(<FounderConsole />);

    expect(screen.getByText(/الباندا المستشار/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/اكتب سؤالك هنا/i)).toBeInTheDocument();
  });
});


