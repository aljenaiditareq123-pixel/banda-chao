'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Shirt, Smartphone, Heart, Home, Gamepad2, 
  Baby, Car, Dumbbell, Laptop, Watch 
} from 'lucide-react';

interface Category {
  id: string;
  name: {
    ar: string;
    en: string;
    zh: string;
  };
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link: string;
}

const categories: Category[] = [
  {
    id: 'fashion',
    name: { ar: 'أزياء', en: 'Fashion', zh: '时尚' },
    icon: <Shirt className="w-6 h-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    link: '/products?category=fashion',
  },
  {
    id: 'electronics',
    name: { ar: 'إلكترونيات', en: 'Electronics', zh: '电子产品' },
    icon: <Smartphone className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    link: '/products?category=electronics',
  },
  {
    id: 'beauty',
    name: { ar: 'تجميل', en: 'Beauty', zh: '美妆' },
    icon: <Heart className="w-6 h-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    link: '/products?category=beauty',
  },
  {
    id: 'home',
    name: { ar: 'منزل', en: 'Home', zh: '家居' },
    icon: <Home className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    link: '/products?category=home',
  },
  {
    id: 'sports',
    name: { ar: 'رياضة', en: 'Sports', zh: '运动' },
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    link: '/products?category=sports',
  },
  {
    id: 'gaming',
    name: { ar: 'ألعاب', en: 'Gaming', zh: '游戏' },
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    link: '/products?category=gaming',
  },
  {
    id: 'baby',
    name: { ar: 'أطفال', en: 'Baby', zh: '婴儿' },
    icon: <Baby className="w-6 h-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    link: '/products?category=baby',
  },
  {
    id: 'automotive',
    name: { ar: 'سيارات', en: 'Auto', zh: '汽车' },
    icon: <Car className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    link: '/products?category=automotive',
  },
  {
    id: 'computers',
    name: { ar: 'كمبيوتر', en: 'Computers', zh: '电脑' },
    icon: <Laptop className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    link: '/products?category=computers',
  },
  {
    id: 'watches',
    name: { ar: 'ساعات', en: 'Watches', zh: '手表' },
    icon: <Watch className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    link: '/products?category=watches',
  },
];

interface CategoryCirclesProps {
  locale: string;
}

export default function CategoryCircles({ locale }: CategoryCirclesProps) {
  return (
    <div className="mb-8">
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 min-w-max pb-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/${locale}${category.link}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className={`w-16 h-16 ${category.bgColor} ${category.color} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all`}>
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-primary transition-colors">
                  {category.name[locale as keyof typeof category.name] || category.name.en}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
