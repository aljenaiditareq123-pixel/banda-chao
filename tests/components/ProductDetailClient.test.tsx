import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { Product } from '@/types';
import { CartProvider } from '@/contexts/CartContext';

const mockProduct: Product = {
  id: '1',
  userId: 'user-1',
  name: 'Test Product',
  description: 'Test description for the product',
  price: 99.99,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
  category: 'Test Category',
  stock: 10,
  rating: 4.5,
  reviewCount: 10,
  createdAt: new Date().toISOString(),
  maker: {
    id: 'maker-1',
    name: 'Test Maker',
  },
};

describe('ProductDetailClient Component', () => {
  it('renders product name', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    expect(screen.getByText(/¥99.99/)).toBeInTheDocument();
  });

  it('renders product description', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    expect(screen.getByText('Test description for the product')).toBeInTheDocument();
  });

  it('displays product images', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    const images = screen.getAllByAltText('Test Product');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders maker link', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    const makerLink = screen.getByText('Test Maker');
    expect(makerLink).toBeInTheDocument();
  });

  it('has quantity selector', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    // Look for quantity controls (buttons or input)
    const quantityControls = screen.getByText('1').closest('div');
    expect(quantityControls).toBeInTheDocument();
  });

  it('has add to cart button', () => {
    render(
      <CartProvider>
        <ProductDetailClient product={mockProduct} locale="en" />
      </CartProvider>
    );
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addToCartButton).toBeInTheDocument();
  });
});

