import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import VideoPlayer from '@/components/VideoPlayer';
import { findMockProductById, mockProducts } from '@/lib/products/mockProductDetails';

const formatUSD = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = findMockProductById(params.id);
  if (!product) {
    return {
      title: 'Banda Chao Product',
      description: 'Discover artisan-made treasures on Banda Chao.',
    };
  }

  return {
    title: `${product.name} | Banda Chao`,
    description: `${product.artisanStory.slice(0, 150)}...`,
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = findMockProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <section className="order-1 space-y-8 lg:order-2">
            <VideoPlayer src={product.videoUrl} poster={product.posterUrl} title={product.name} />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_45px_140px_-70px_rgba(30,64,175,0.7)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                  <Image
                    src={product.artisanPortrait}
                    alt={product.artisanName}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Artisan</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">{product.artisanName}</h2>
                  <p className="mt-1 text-sm text-slate-200">{product.artisanOrigin}</p>
                </div>
              </div>

              <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-slate-100">
                {product.artisanStory}
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-slate-200">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">Materials & Craft</h3>
                <p className="mt-3 leading-relaxed">{product.materials}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {product.gallery.map((image, index) => (
                <div
                  key={image}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.45)]"
                >
                  <Image
                    src={image}
                    alt={`${product.name} detail ${index + 1}`}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </section>

          <aside className="order-2 space-y-8 lg:order-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_35px_120px_-60px_rgba(15,23,42,0.8)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Banda Chao Exclusive</p>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{product.name}</h1>

              <div className="mt-6 flex items-baseline justify-between gap-4">
                <span className="text-4xl font-bold text-emerald-300">{formatUSD(product.priceUSD)}</span>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Worldwide shipping</span>
              </div>

              <ul className="mt-8 space-y-4">
                {product.shippingOptions.map((option) => (
                  <li
                    key={option.id}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="font-semibold text-white">{option.label}</div>
                    <p className="mt-1 text-xs text-slate-300">{option.description}</p>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-8 w-full rounded-2xl bg-emerald-400 px-6 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                Buy Now
              </button>

              <p className="mt-4 text-xs text-slate-300">
                Need a bespoke variation?{' '}
                <a
                  href="mailto:hello@bandachao.com"
                  className="font-semibold text-emerald-200 hover:text-emerald-100"
                >
                  Talk to our concierge
                </a>
                .
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100">
              <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400">Highlights</h2>
              <ul className="mt-4 space-y-3">
                {product.productHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-emerald-300">✺</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
