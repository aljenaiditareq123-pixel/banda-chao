import ProductCard from "@/components/ProductCard";

// Mock data
const products = [
  {
    id: "1",
    userId: "user1",
    name: "优质商品示例 1",
    description: "这是一款优质商品，适合日常使用，质量上乘，性价比高",
    price: 199.99,
    images: ["https://via.placeholder.com/400"],
    category: "电子产品",
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user2",
    name: "时尚配饰",
    description: "精美的时尚配饰，展现个人风格，适合各种场合",
    price: 89.99,
    images: ["https://via.placeholder.com/400"],
    category: "时尚",
    stock: 30,
    rating: 4.8,
    reviewCount: 95,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "user3",
    name: "家居用品",
    description: "实用的家居用品，让生活更美好",
    price: 159.99,
    images: ["https://via.placeholder.com/400"],
    category: "家居",
    stock: 25,
    rating: 4.6,
    reviewCount: 67,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    userId: "user4",
    name: "运动装备",
    description: "专业运动装备，助您达到最佳运动状态",
    price: 299.99,
    images: ["https://via.placeholder.com/400"],
    category: "运动",
    stock: 40,
    rating: 4.9,
    reviewCount: 203,
    createdAt: new Date().toISOString(),
  },
];

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProductsPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_images:product_images(image_url)
    `)
    .order('created_at', { ascending: false });

  const formattedProducts = (products || []).map((product: any) => ({
    id: product.id,
    userId: product.user_id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.product_images?.map((img: any) => img.image_url) || [],
    category: product.category,
    stock: product.stock || 0,
    rating: product.rating || 0,
    reviewCount: product.review_count || 0,
    createdAt: product.created_at,
  }));

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
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            全部
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            电子产品
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            时尚
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            家居
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            运动
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {formattedProducts.length > 0 ? (
            formattedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-gray-500">
              {user ? (
                <div>
                  <p className="mb-4">暂无商品</p>
                  <Link
                    href="/products/new"
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    成为第一个添加商品的人 →
                  </Link>
                </div>
              ) : (
                <p>暂无商品</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
