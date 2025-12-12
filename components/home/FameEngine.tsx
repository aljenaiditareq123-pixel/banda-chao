'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Play, Star, Award } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const TRENDING_PRODUCTS = [
  { id: 1, name: 'Luxury Leather Bag', price: 'AED 899', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop', rank: 1 },
  { id: 2, name: 'Handcrafted Silk Scarf', price: 'AED 299', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83d34b08?q=80&w=400&auto=format&fit=crop', rank: 2 },
  { id: 3, name: 'Artisan Wooden Watch', price: 'AED 599', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop', rank: 3 },
  { id: 4, name: 'Premium Ceramic Vase', price: 'AED 449', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop', rank: 4 },
  { id: 5, name: 'Handwoven Basket Set', price: 'AED 199', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop', rank: 5 },
];

const VIRAL_SHORTS = [
  { id: 1, title: 'Crafting Process', views: '2.5M', thumbnail: 'https://images.unsplash.com/photo-1556906781-9a412961d289?q=80&w=300&auto=format&fit=crop' },
  { id: 2, title: 'Behind the Scenes', views: '1.8M', thumbnail: 'https://images.unsplash.com/photo-1576156858277-c99a77759b48?q=80&w=300&auto=format&fit=crop' },
  { id: 3, title: 'Product Reveal', views: '1.2M', thumbnail: 'https://images.unsplash.com/photo-1536838392500-b6f709144865?q=80&w=300&auto=format&fit=crop' },
  { id: 4, title: 'Artisan Story', views: '950K', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop' },
  { id: 5, title: 'Workshop Tour', views: '720K', thumbnail: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop' },
];

const STAR_ARTISANS = [
  { id: 1, name: 'Ahmed Al-Mansoori', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', rating: 4.9 },
  { id: 2, name: 'Li Wei', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', rating: 4.8 },
  { id: 3, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', rating: 4.9 },
  { id: 4, name: 'Mohammed Hassan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', rating: 4.7 },
  { id: 5, name: 'Emma Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', rating: 4.8 },
];

export default function FameEngine() {
  return (
    <section className="bg-gradient-to-b from-amber-50 via-yellow-50 to-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full mb-4">
            <Award className="w-5 h-5" />
            <h2 className="text-2xl md:text-3xl font-bold">Hall of Fame</h2>
          </div>
          <p className="text-gray-600 text-lg">Celebrating the best of Banda Chao</p>
        </div>

        {/* 1. Trending Products */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">🔥 Trending Products</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {TRENDING_PRODUCTS.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg border-2 border-amber-200 overflow-hidden relative"
              >
                {/* Top 10 Badge */}
                <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Award className="w-3 h-3" />
                  Top {product.rank}
                </div>
                
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h4>
                    <p className="text-amber-600 font-semibold">{product.price}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. Viral Shorts */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Play className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">🎥 Viral Shorts</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {VIRAL_SHORTS.map((short) => (
              <motion.div
                key={short.id}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-40 aspect-[9/16] bg-white rounded-xl shadow-lg border-2 border-amber-200 overflow-hidden relative group cursor-pointer"
              >
                <Link href={`/videos/${short.id}`}>
                  <div className="relative w-full h-full">
                    <img 
                      src={short.thumbnail} 
                      alt={short.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Info Badge */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-medium line-clamp-1 mb-1">{short.title}</p>
                      <p className="text-amber-400 text-[10px] font-semibold">{short.views} views</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Star Artisans */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">🌟 Star Artisans</h3>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {STAR_ARTISANS.map((artisan) => (
              <motion.div
                key={artisan.id}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 flex flex-col items-center gap-3"
              >
                <Link href={`/u/${artisan.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-amber-400 shadow-lg overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-500 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        <img 
                          src={artisan.avatar} 
                          alt={artisan.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-white" />
                      {artisan.rating}
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-bold text-gray-900 text-sm">{artisan.name}</p>
                    <p className="text-xs text-gray-500">Top Maker</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
