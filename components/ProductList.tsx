'use client';

import { useEffect, useMemo, useState } from 'react';

type FeaturedProduct = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description: string;
};

type FeaturedProductsResponse = {
  products: FeaturedProduct[];
  generatedAt?: string;
};

const fetchFeaturedProducts = async (signal?: AbortSignal): Promise<FeaturedProductsResponse> => {
  const response = await fetch('/api/products/featured', {
    method: 'GET',
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`无法获取推荐商品（${response.status}）`);
  }

  return response.json();
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<FeaturedProduct[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchFeaturedProducts(controller.signal);
        setProducts(data.products);
        setGeneratedAt(data.generatedAt);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError((err as Error).message || '获取数据失败，请稍后再试。');
      } finally {
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  const formattedTimestamp = useMemo(() => {
    if (!generatedAt) return null;
    try {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(generatedAt));
    } catch {
      return generatedAt;
    }
  }, [generatedAt]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">精选手作好物</h2>
          <p className="text-sm text-gray-500">真实的匠人故事，从这里开始。</p>
        </div>
        {formattedTimestamp ? (
          <span className="text-xs text-gray-400">更新于 {formattedTimestamp}</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-rose-200 bg-rose-50 p-4 text-rose-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden />
          <p className="text-sm font-medium">正在加载匠人商品...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : products && products.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col rounded-xl border border-gray-100 p-4 shadow transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-rose-600">{product.price}</span>
                <button
                  type="button"
                  className="rounded-md border border-rose-500 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  了解更多
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-500">
          <p className="text-sm">暂时没有可展示的手作商品，欢迎稍后再来。</p>
        </div>
      )}
    </section>
  );
};

export default ProductList;
