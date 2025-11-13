import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  price: 99.99,
  images: ['https://example.com/image.jpg'],
  rating: 4.5,
  reviewCount: 10,
  makerId: 'maker-1',
  maker: {
    id: 'maker-1',
    name: 'Test Maker',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ProductCard Component', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/¥99.99/)).toBeInTheDocument();
  });

  it('displays "价格待定" when price is null', () => {
    const productWithoutPrice = { ...mockProduct, price: null };
    render(<ProductCard product={productWithoutPrice} />);
    expect(screen.getByText('价格待定')).toBeInTheDocument();
  });

  it('renders product description', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders product image when available', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders placeholder when no image', () => {
    const productWithoutImage = { ...mockProduct, images: [] };
    render(<ProductCard product={productWithoutImage} />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('renders rating when available', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10)')).toBeInTheDocument();
  });

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });

  it('uses custom href when provided', () => {
    render(<ProductCard product={mockProduct} href="/custom/path" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/custom/path');
  });
});

