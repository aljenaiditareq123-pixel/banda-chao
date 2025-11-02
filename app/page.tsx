import VideoCard from "@/components/VideoCard";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // Fetch short videos - latest 5
  const { data: shortVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('type', 'short')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch long videos - latest 3
  const { data: longVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('type', 'long')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch products - latest 6
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  // Map database data to component format
  const formattedShortVideos = (shortVideos || []).map((video: any) => ({
    id: video.id,
    userId: video.user_id,
    title: video.title,
    thumbnail: video.thumbnail_url,
    videoUrl: video.video_url,
    duration: video.duration,
    views: video.views || 0,
    likes: video.likes || 0,
    comments: 0, // TODO: Add comments table
    createdAt: video.created_at,
    type: video.type as 'short',
  }));

  const formattedLongVideos = (longVideos || []).map((video: any) => ({
    id: video.id,
    userId: video.user_id,
    title: video.title,
    thumbnail: video.thumbnail_url,
    videoUrl: video.video_url,
    duration: video.duration,
    views: video.views || 0,
    likes: video.likes || 0,
    comments: 0, // TODO: Add comments table
    createdAt: video.created_at,
    type: video.type as 'long',
  }));

  const formattedProducts = (products || []).map((product: any) => ({
    id: product.id,
    userId: product.user_id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.image_url ? [product.image_url] : [],
    category: product.category,
    stock: product.stock || 0,
    rating: product.rating || 0,
    reviewCount: product.review_count || 0,
    createdAt: product.created_at,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">欢迎来到 Banda Chao</h1>
          <p className="text-xl mb-8">
            结合社交媒体与电子商务的创新平台
            <br />
            分享视频，展示产品，连接世界
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/videos/short"
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              观看短视频
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
            >
              浏览商品
            </Link>
          </div>
        </div>
      </section>

      {/* Short Videos Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">热门短视频</h2>
            <Link
              href="/videos/short"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              查看更多 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {formattedShortVideos.length > 0 ? (
              formattedShortVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                暂无内容
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Long Videos Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">精选长视频</h2>
            <Link
              href="/videos/long"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              查看更多 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedLongVideos.length > 0 ? (
              formattedLongVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                暂无内容
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">推荐商品</h2>
            <Link
              href="/products"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              查看更多 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {formattedProducts.length > 0 ? (
              formattedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                暂无内容
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
