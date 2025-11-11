'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { mockProducts, type ProductDetail } from '@/lib/products/mockProductDetails';
import {
  CartItem,
  ensureCartSeeded,
  getCartItems,
  removeItemFromCart,
  updateItemQuantity,
} from '@/utils/mockCart';

const SHIPPING_FEE_USD = 25;
const DEFAULT_CART_SEED: CartItem[] = [
  { productId: 'silk-scarf', quantity: 1 },
  { productId: 'tea-set', quantity: 1 },
];

type CartEntry = CartItem & { product: ProductDetail };

const formatUSD = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const hydrateCart = (items: CartItem[]): CartEntry[] =>
  items
    .map((item) => {
      const product = mockProducts.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return null;
      }
      return { ...item, product };
    })
    .filter((entry): entry is CartEntry => Boolean(entry));

export default function CartPage() {
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);

  const loadCart = useCallback(() => {
    setCartEntries(hydrateCart(getCartItems()));
  }, []);

  useEffect(() => {
    ensureCartSeeded(DEFAULT_CART_SEED);
    loadCart();
  }, [loadCart]);

  const handleRemove = (productId: string) => {
    const updated = removeItemFromCart(productId);
    setCartEntries(hydrateCart(updated));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const current = cartEntries.find((entry) => entry.productId === productId);
    if (!current) {
      return;
    }
    const nextQuantity = Math.max(1, current.quantity + delta);
    const updated = updateItemQuantity(productId, nextQuantity);
    setCartEntries(hydrateCart(updated));
  };

  const { subtotal, shipping, total } = useMemo(() => {
    const subtotalValue = cartEntries.reduce(
      (acc, entry) => acc + entry.product.priceUSD * entry.quantity,
      0,
    );
    const shippingValue = cartEntries.length > 0 ? SHIPPING_FEE_USD : 0;
    return {
      subtotal: subtotalValue,
      shipping: shippingValue,
      total: subtotalValue + shippingValue,
    };
  }, [cartEntries]);

  const isEmpty = cartEntries.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Your Cart</p>
          <h1 className="text-3xl font-black sm:text-4xl">Curate Your Banda Chao Collection</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Secure checkout, worldwide shipping, and stories you can hold in your hands.
          </p>
        </header>

        {isEmpty ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-lg font-semibold text-slate-100">
              Your cart is waiting for its first artisan treasure.
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Explore handcrafted stories and add them here when you&apos;re ready.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <section className="space-y-4">
              {cartEntries.map((entry) => (
                <article
                  key={entry.productId}
                  className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_-60px_rgba(15,23,42,0.55)] md:flex-row"
                >
                  <div className="h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:h-36 md:w-56">
                    <Image
                      src={entry.product.posterUrl ?? entry.product.gallery[0]}
                      alt={entry.product.name}
                      width={320}
                      height={240}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{entry.product.name}</h2>
                      <p className="text-sm text-slate-300">Crafted by {entry.product.artisanName}</p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(entry.productId, -1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-base font-semibold text-white">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(entry.productId, 1)}
                          className="h-8 w-8 rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Item total</p>
                        <p className="text-lg font-semibold text-emerald-300">
                          {formatUSD(entry.product.priceUSD * entry.quantity)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(entry.productId)}
                      className="self-start text-xs font-semibold text-rose-300 transition hover:text-rose-200"
                    >
                      Remove from cart
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-200 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.6)]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-white">{formatUSD(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-bold text-white">
                <span>Total</span>
                <span>{formatUSD(total)}</span>
              </div>

              <p className="text-xs text-slate-400">
                Duties & taxes calculated at checkout where applicable. Complimentary carbon-neutral delivery on every Banda Chao order.
              </p>

              <Link
                href="/checkout/shipping-payment"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
              >
                Continue to Shipping & Payment
              </Link>

              <Link
                href="/products"
                className="block text-center text-xs font-semibold text-slate-300 hover:text-slate-100"
              >
                Continue exploring stories
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
