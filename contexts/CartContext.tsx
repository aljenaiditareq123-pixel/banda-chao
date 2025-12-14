'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  price: number;
  haggledPrice?: number; // Negotiated price from Panda Haggle
  currency: string;
  quantity: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>, locale?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isDrawerOpen?: boolean;
  toggleDrawer?: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('banda_chao_cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (err) {
          console.error('Error loading cart from localStorage:', err);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('banda_chao_cart', JSON.stringify(items));
      // Dispatch custom event for cart icon updates
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id' | 'subtotal'>, locale: string = 'en') => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === item.productId);
      
      // Get locale-specific messages
      const messages = {
        ar: {
          added: `تمت إضافة "${item.name}" إلى السلة بنجاح! ✅`,
          updated: `تم تحديث الكمية لـ "${item.name}"`,
        },
        zh: {
          added: `"${item.name}" 已成功添加到购物车！✅`,
          updated: `"${item.name}" 的数量已更新`,
        },
        en: {
          added: `"${item.name}" added to cart successfully! ✅`,
          updated: `Quantity updated for "${item.name}"`,
        },
      };
      
      const t = messages[locale as keyof typeof messages] || messages.en;
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map((i) =>
          i.productId === item.productId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                subtotal: (i.quantity + item.quantity) * i.price,
              }
            : i
        );
        
        // Dispatch toast event for quantity update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartToast', {
            detail: {
              type: 'success',
              message: t.updated,
            },
          }));
        }
        
        return updatedItems;
      } else {
        // Add new item
        const finalPrice = (item as any).haggledPrice || item.price;
        const newItem: CartItem = {
          ...item,
          id: `${item.productId}-${Date.now()}`,
          price: finalPrice,
          haggledPrice: (item as any).haggledPrice,
          subtotal: finalPrice * item.quantity,
        };
        
        // Dispatch toast event for new item
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartToast', {
            detail: {
              type: 'success',
              message: t.added,
            },
          }));
        }
        
        return [...prevItems, newItem];
      }
    });
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity,
              subtotal: i.price * quantity,
            }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isDrawerOpen,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

