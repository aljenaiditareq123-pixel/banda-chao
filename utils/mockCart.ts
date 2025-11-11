'use client';

export type CartItem = {
  productId: string;
  quantity: number;
};

const CART_STORAGE_KEY = 'banda-chao-cart';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readCartInternal = (): CartItem[] => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => item && typeof item.productId === 'string')
      .map((item) => ({ productId: item.productId, quantity: Math.max(1, Number(item.quantity) || 1) }));
  } catch (error) {
    console.warn('Failed to parse cart from storage', error);
    return [];
  }
};

const writeCartInternal = (items: CartItem[]) => {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to persist cart to storage', error);
  }
};

export const getCartItems = (): CartItem[] => readCartInternal();

export const ensureCartSeeded = (defaults: CartItem[]) => {
  const current = readCartInternal();
  if (current.length === 0 && defaults.length > 0) {
    writeCartInternal(defaults);
  }
};

export const addItemToCart = (productId: string, quantity = 1): CartItem[] => {
  const items = readCartInternal();
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  writeCartInternal(items);
  return items;
};

export const removeItemFromCart = (productId: string): CartItem[] => {
  const items = readCartInternal().filter((item) => item.productId !== productId);
  writeCartInternal(items);
  return items;
};

export const updateItemQuantity = (productId: string, quantity: number): CartItem[] => {
  if (quantity <= 0) {
    return removeItemFromCart(productId);
  }

  const items = readCartInternal();
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity = quantity;
  } else {
    items.push({ productId, quantity });
  }
  writeCartInternal(items);
  return items;
};

export const clearCart = () => {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear cart storage', error);
  }
};
