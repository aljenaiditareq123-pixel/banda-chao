'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { mockProducts, type ProductDetail } from '@/lib/products/mockProductDetails';
import { CartItem, getCartItems } from '@/utils/mockCart';

const SHIPPING_FEE_USD = 25;

const formatUSD = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

type CartReviewEntry = CartItem & { product: ProductDetail };

const hydrateCart = (items: CartItem[]): CartReviewEntry[] =>
  items
    .map((item) => {
      const product = mockProducts.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return null;
      }
      return { ...item, product };
    })
    .filter((entry): entry is CartReviewEntry => Boolean(entry));

const paymentOptions = [
  { id: 'card', label: 'Credit Card (via Stripe)' },
  { id: 'paypal', label: 'PayPal Secure Checkout' },
];

type ShippingFormState = {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export default function ShippingPaymentPage() {
  const [cartEntries, setCartEntries] = useState<CartReviewEntry[]>([]);
  const [shippingForm, setShippingForm] = useState<ShippingFormState>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentOptions[0]?.id ?? 'card');
  const [cardPlaceholder, setCardPlaceholder] = useState('4242 4242 4242 4242');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setCartEntries(hydrateCart(getCartItems()));
  }, []);

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

  const handleFieldChange = (field: keyof ShippingFormState, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setCardPlaceholder(method === 'paypal' ? 'PayPal Email' : '4242 4242 4242 4242');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cartEntries.length === 0) {
      setStatus('idle');
      setStatusMessage('Your cart is empty. Add an artisan product to continue.');
      return;
    }

    setStatus('processing');
    setStatusMessage('Processing secure checkout...');

    setTimeout(() => {
      setStatus('success');
      setStatusMessage('Order confirmed! A concierge email will share next steps within 24 hours.');
    }, 1500);
  };

  const isCartEmpty = cartEntries.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Checkout</p>
          <h1 className="text-3xl font-black sm:text-4xl">Shipping & Secure Payment</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Complete your order with global delivery and trusted payment partners. Your purchase supports the artisan directly.
          </p>
        </header>

        {isCartEmpty ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-lg font-semibold text-slate-100">Your cart is currently empty.</p>
            <p className="mt-2 text-sm text-slate-300">
              Return to the cart to add handcrafted treasures before checking out.
            </p>
            <Link
              href="/checkout/cart"
              className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              Back to Cart
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <form
              onSubmit={handleSubmit}
              className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_120px_-60px_rgba(15,23,42,0.55)]"
            >
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Shipping Details
                </h2>
                <div className="grid gap-4 text-sm">
                  <input
                    required
                    value={shippingForm.fullName}
                    onChange={(event) => handleFieldChange('fullName', event.target.value)}
                    placeholder="Full name"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                  />
                  <input
                    required
                    value={shippingForm.addressLine1}
                    onChange={(event) => handleFieldChange('addressLine1', event.target.value)}
                    placeholder="Address line 1"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                  />
                  <input
                    value={shippingForm.addressLine2}
                    onChange={(event) => handleFieldChange('addressLine2', event.target.value)}
                    placeholder="Address line 2 (optional)"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      required
                      value={shippingForm.city}
                      onChange={(event) => handleFieldChange('city', event.target.value)}
                      placeholder="City"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                    />
                    <input
                      required
                      value={shippingForm.state}
                      onChange={(event) => handleFieldChange('state', event.target.value)}
                      placeholder="State / Province"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      required
                      value={shippingForm.postalCode}
                      onChange={(event) => handleFieldChange('postalCode', event.target.value)}
                      placeholder="Postal code"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                    />
                    <input
                      required
                      value={shippingForm.country}
                      onChange={(event) => handleFieldChange('country', event.target.value)}
                      placeholder="Country"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Payment Method
                </h2>
                <div className="space-y-3 text-sm">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        paymentMethod === option.id
                          ? 'border-emerald-300 bg-emerald-500/10'
                          : 'border-white/10 bg-black/30 hover:border-emerald-300/60'
                      }`}
                    >
                      <span className="font-semibold text-white">{option.label}</span>
                      <input
                        type="radio"
                        name="payment-method"
                        className="h-4 w-4"
                        checked={paymentMethod === option.id}
                        onChange={() => handlePaymentMethodChange(option.id)}
                      />
                    </label>
                  ))}
                </div>

                <input
                  required
                  placeholder={cardPlaceholder}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                />
              </section>

              {statusMessage ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-xs ${
                    status === 'success'
                      ? 'border-emerald-300/60 bg-emerald-500/10 text-emerald-100'
                      : status === 'processing'
                      ? 'border-amber-300/60 bg-amber-500/10 text-amber-100'
                      : 'border-rose-300/60 bg-rose-500/10 text-rose-100'
                  }`}
                >
                  {statusMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/checkout/cart"
                  className="text-xs font-semibold text-slate-300 hover:text-slate-100"
                >
                  ← Back to cart
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={status === 'processing'}
                >
                  {status === 'processing' ? 'Processing...' : 'Place Order Securely'}
                </button>
              </div>
            </form>

            <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-200 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.6)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Order Summary
              </h2>
              <ul className="space-y-4">
                {cartEntries.map((entry) => (
                  <li key={entry.productId} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{entry.product.name}</p>
                      <p className="text-xs text-slate-400">Qty {entry.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-300">
                      {formatUSD(entry.product.priceUSD * entry.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatUSD(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-white">{formatUSD(shipping)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-bold text-white">
                  <span>Total due today</span>
                  <span>{formatUSD(total)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                All payments are processed through trusted international gateways. Currency conversion handled automatically at checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
