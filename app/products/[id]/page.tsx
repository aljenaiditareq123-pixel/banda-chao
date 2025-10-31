import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import EditDeleteButtons from '@/components/EditDeleteButtons';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Get product data
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Get product images
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', params.id)
    .order('order_index', { ascending: true });

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              {images && images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img: any) => (
                    <Image
                      key={img.id}
                      src={img.image_url}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover rounded-lg"
                      unoptimized
                    />
                  ))}
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
                <EditDeleteButtons userId={product.user_id} productId={product.id} />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{product.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({product.review_count} 评价)</span>
                    </div>
                  )}
                </div>
                <LikeButton productId={product.id} initialLikes={product.rating || 0} />
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">分类:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">库存:</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} 件` : '缺货'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-2">商品描述</h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/profile/${product.user_id}`}
                    className="flex items-center space-x-2"
                  >
                    {product.profiles?.avatar_url ? (
                      <Image
                        src={product.profiles.avatar_url}
                        alt={product.profiles.username || 'User'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                        {(product.profiles?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-gray-900">
                      {product.profiles?.username || '未命名用户'}
                    </span>
                  </Link>
                </div>
              </div>
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

