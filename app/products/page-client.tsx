'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
  { label: '全部', value: 'all' },
  { label: '电子产品', value: '电子产品' },
  { label: '时尚', value: '时尚' },
  { label: '家居', value: '家居' },
  { label: '运动', value: '运动' },
];

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  externalLink: string;
  price: number | null;
  category: string | null;
  userId: string;
  createdAt: string;
}

export default function ProductsPageClient() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await productsAPI.getProducts(category);
      // Backend returns array directly in response.data
      const allProducts = Array.isArray(response.data) ? response.data : [];

      // Client-side pagination
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginatedProducts = allProducts.slice(start, end);

      setProducts(paginatedProducts);
      setTotalProducts(allProducts.length);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const buildUrl = (page: number, category: string) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (category !== 'all') {
      params.set('category', category);
    }
    return `/products?${params.toString()}`;
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">商品</h1>
          {user && (
            <Link
              href="/products/new"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              + 添加商品
            </Link>
          )}
        </div>
        
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === category.value
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {product.imageUrl ? (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">无图片</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    {product.price && (
                      <p className="text-lg font-bold text-red-600 mb-2">
                        ¥{product.price}
                      </p>
                    )}
                    {product.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    上一页
                  </button>
                )}

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition ${
                            page === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    下一页
                  </button>
                )}
              </div>
            )}

            <div className="text-center mt-4 text-gray-600">
              显示第 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} 条，共 {totalProducts} 条
              {selectedCategory !== 'all' && ` (分类: ${CATEGORIES.find(c => c.value === selectedCategory)?.label})`}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {user ? (
              <div>
                <p className="mb-4">
                  {selectedCategory !== 'all' 
                    ? `暂无"${CATEGORIES.find(c => c.value === selectedCategory)?.label}"分类的商品`
                    : '暂无商品'}
                </p>
                <Link
                  href="/products/new"
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  成为第一个添加商品的人 →
                </Link>
              </div>
            ) : (
              <p>
                {selectedCategory !== 'all' 
                  ? `暂无"${CATEGORIES.find(c => c.value === selectedCategory)?.label}"分类的商品`
                  : '暂无商品'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

