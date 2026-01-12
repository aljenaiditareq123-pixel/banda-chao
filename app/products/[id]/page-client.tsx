'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import EditDeleteButtons from '@/components/EditDeleteButtons';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductDetailPageClient() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsAPI.getProduct(productId);
      setProduct(response.data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.error || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '价格待定';
    return `¥${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link
            href="/products"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              {product.imageUrl ? (
                <div className="aspect-square">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <EditDeleteButtons userId={product.userId} productId={product.id} />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                {product.category && (
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">分类:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-2">商品描述</h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-3">卖家信息</h3>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/profile/${product.userId}`}
                    className="flex items-center space-x-2"
                  >
                    {product.user?.profilePicture ? (
                      <Image
                        src={product.user.profilePicture}
                        alt={product.user.name || 'User'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                        {(product.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-gray-900">
                      {product.user?.name || '未命名用户'}
                    </span>
                  </Link>
                </div>
              </div>

              {/* External Links */}
              {product.externalLink && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold mb-3">购买链接</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={product.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <span>购买商品</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <Comments productId={product.id} />
        </div>
      </div>
    </div>
  );
}


