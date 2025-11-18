import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

const mockProduct: Product = {
  id: '1',
  userId: 'user-1',
  name: 'Test Product',
  description: 'Test',
  price: 99.99,
  images: [],
  category: 'Test Category',
  stock: 10,
  rating: 0,
  reviewCount: 0,
  createdAt: new Date().toISOString(),
  maker: { id: 'maker-1', name: 'Maker' },
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('adds product to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('1');
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.totalItems).toBe(1);
  });

  it('increments quantity when adding same product', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });

  it('updates product quantity', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.updateQuantity('1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  it('removes product from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.removeFromCart('1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart({ ...mockProduct, id: '2' });
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('persists cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    const stored = localStorage.getItem('banda-chao-cart');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
  });

  it('loads cart from localStorage on mount', () => {
    const storedCart = [
      { product: mockProduct, quantity: 2 },
    ];
    localStorage.setItem('banda-chao-cart', JSON.stringify(storedCart));

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });
});

