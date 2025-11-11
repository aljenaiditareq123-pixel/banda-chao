import { NextResponse } from 'next/server';

type FeaturedProduct = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description: string;
};

const featuredProducts: FeaturedProduct[] = [
  {
    id: 'artisan-tea-set',
    name: '手工紫砂茶具',
    price: '¥368',
    imageUrl: 'https://images.example.com/products/tea-set.jpg',
    description: '精选宜兴紫砂，由老匠人手工打造的一套四壶六杯茶具。',
  },
  {
    id: 'bamboo-lantern',
    name: '编织竹灯笼',
    price: '¥259',
    imageUrl: 'https://images.example.com/products/bamboo-lantern.jpg',
    description: '采用山间老竹编织而成，温暖灯光营造自然氛围。',
  },
  {
    id: 'silk-scarf',
    name: '丝绸手绘围巾',
    price: '¥198',
    imageUrl: 'https://images.example.com/products/silk-scarf.jpg',
    description: '真丝面料，结合传统工笔花鸟图案，柔软亲肤。',
  },
  {
    id: 'ceramic-vase',
    name: '青花手绘花瓶',
    price: '¥428',
    imageUrl: 'https://images.example.com/products/ceramic-vase.jpg',
    description: '景德镇匠人手绘，经典青花纹饰，适合花艺与陈设。',
  },
];

export async function GET() {
  return NextResponse.json({
    products: featuredProducts,
    generatedAt: new Date().toISOString(),
  });
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
