/**
 * Seed Script for Banda Chao
 * 
 * This script adds sample data to the database:
 * - 3 test users in profiles
 * - 5 short videos and 3 long videos
 * - 10 sample products
 * 
 * Usage: npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ خطأ: يرجى التأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users data
const testUsers = [
  {
    email: 'zhangwei@example.com',
    password: 'password123',
    username: 'zhangwei',
    full_name: '张伟',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    wechat_id: 'zhangwei2024',
    phone_number: '+86 138 0013 8000'
  },
  {
    email: 'wangfang@example.com',
    password: 'password123',
    username: 'wangfang',
    full_name: '王芳',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    wechat_id: 'wangfang2024',
    phone_number: '+86 139 0013 9000'
  },
  {
    email: 'liuming@example.com',
    password: 'password123',
    username: 'liuming',
    full_name: '刘明',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    wechat_id: 'liuming2024',
    phone_number: '+86 137 0013 7000'
  }
];

// Short videos data
const shortVideos = [
  {
    title: '美味的火锅制作过程',
    description: '学会如何在家制作正宗的四川火锅，简单易学，味道超赞！',
    video_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=640&h=360&fit=crop',
    duration: 45,
    type: 'short' as const,
    views: 15200,
    likes: 980
  },
  {
    title: '北京胡同生活日常',
    description: '带你走进老北京胡同，体验最真实的北京生活',
    video_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=640&h=360&fit=crop',
    duration: 60,
    type: 'short' as const,
    views: 18900,
    likes: 1250
  },
  {
    title: '上海夜景航拍',
    description: '从高空俯瞰上海的美丽夜景，灯火通明，美不胜收',
    video_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&h=360&fit=crop',
    duration: 30,
    type: 'short' as const,
    views: 22500,
    likes: 1890
  },
  {
    title: '中国传统茶艺表演',
    description: '展示中国茶艺的优雅与精致，品茶如品人生',
    video_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=640&h=360&fit=crop',
    duration: 90,
    type: 'short' as const,
    views: 16800,
    likes: 1120
  },
  {
    title: '西安古城墙漫步',
    description: '在千年古都的城墙上，感受历史的厚重与文化的传承',
    video_url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=640&h=360&fit=crop',
    duration: 75,
    type: 'short' as const,
    views: 14200,
    likes: 890
  }
];

// Long videos data
const longVideos = [
  {
    title: '完整的中国菜烹饪教程 - 宫保鸡丁',
    description: '从选材到装盘，详细讲解如何制作这道经典川菜，适合初学者',
    video_url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=640&h=360&fit=crop',
    duration: 1800,
    type: 'long' as const,
    views: 45600,
    likes: 3200
  },
  {
    title: '中国传统文化深度解析',
    description: '探讨中国五千年的历史文明，从哲学到艺术，全方位了解中国文化',
    video_url: 'https://images.unsplash.com/photo-1495741545814-2d7f4d75ea09?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1495741545814-2d7f4d75ea09?w=640&h=360&fit=crop',
    duration: 3600,
    type: 'long' as const,
    views: 67200,
    likes: 4890
  },
  {
    title: '中国各地美食探索之旅',
    description: '走遍大江南北，品尝各地特色美食，体验不同地区的饮食文化',
    video_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&h=360&fit=crop',
    duration: 2700,
    type: 'long' as const,
    views: 38900,
    likes: 2560
  }
];

// Products data
const products = [
  {
    name: '高品质智能手机',
    description: '最新款智能手机，配备先进处理器和超清摄像头，支持5G网络，续航能力强',
    price: 2999.00,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
    category: '电子产品',
    taobao_link: 'https://www.taobao.com/item/example1',
    jd_link: 'https://item.jd.com/example1'
  },
  {
    name: '时尚运动鞋',
    description: '舒适透气的运动鞋，采用最新科技材料，适合跑步和日常穿着',
    price: 599.00,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    category: '时尚',
    taobao_link: 'https://www.taobao.com/item/example2',
    jd_link: 'https://item.jd.com/example2'
  },
  {
    name: '精美茶具套装',
    description: '传统中式茶具，手工制作，适合品茶和送礼，包装精美',
    price: 899.00,
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop',
    category: '家居',
    taobao_link: 'https://www.taobao.com/item/example3',
    jd_link: 'https://item.jd.com/example3'
  },
  {
    name: '智能手表',
    description: '多功能智能手表，支持健康监测、消息通知、GPS定位等功能',
    price: 1599.00,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    category: '电子产品',
    taobao_link: 'https://www.taobao.com/item/example4',
    jd_link: 'https://item.jd.com/example4'
  },
  {
    name: '纯棉T恤',
    description: '100%纯棉材质，舒适透气，多种颜色可选，经典百搭款式',
    price: 129.00,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    category: '时尚',
    taobao_link: 'https://www.taobao.com/item/example5',
    jd_link: 'https://item.jd.com/example5'
  },
  {
    name: '蓝牙无线耳机',
    description: '高品质蓝牙耳机，降噪功能强大，音质清晰，续航长达20小时',
    price: 699.00,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    category: '电子产品',
    taobao_link: 'https://www.taobao.com/item/example6',
    jd_link: 'https://item.jd.com/example6'
  },
  {
    name: '简约现代茶几',
    description: '北欧风格茶几，实木材质，设计简约现代，适合客厅使用',
    price: 1299.00,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
    category: '家居',
    taobao_link: 'https://www.taobao.com/item/example7',
    jd_link: 'https://item.jd.com/example7'
  },
  {
    name: '运动健身包',
    description: '大容量健身包，防水材质，多个口袋设计，适合运动和旅行',
    price: 259.00,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    category: '运动',
    taobao_link: 'https://www.taobao.com/item/example8',
    jd_link: 'https://item.jd.com/example8'
  },
  {
    name: '中国风装饰画',
    description: '精美中国风装饰画，适合客厅、书房装饰，提升家居品味',
    price: 399.00,
    image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=800&fit=crop',
    category: '家居',
    taobao_link: 'https://www.taobao.com/item/example9',
    jd_link: 'https://item.jd.com/example9'
  },
  {
    name: '便携式充电宝',
    description: '大容量移动电源，支持快充，小巧便携，适合日常出行',
    price: 199.00,
    image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f90ff77?w=800&h=800&fit=crop',
    category: '电子产品',
    taobao_link: 'https://www.taobao.com/item/example10',
    jd_link: 'https://item.jd.com/example10'
  }
];

async function seed() {
  console.log('🌱 بدء إضافة البيانات التجريبية...\n');

  try {
    // Step 1: Create test users
    console.log('📝 إضافة المستخدمين التجريبيين...');
    const userIds: string[] = [];

    for (const user of testUsers) {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username,
          full_name: user.full_name
        }
      });

      if (authError) {
        console.error(`❌ خطأ في إنشاء المستخدم ${user.email}:`, authError.message);
        continue;
      }

      if (!authData.user) {
        console.error(`❌ لم يتم إنشاء المستخدم ${user.email}`);
        continue;
      }

      const userId = authData.user.id;
      userIds.push(userId);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          wechat_id: user.wechat_id,
          phone_number: user.phone_number
        });

      if (profileError) {
        console.error(`❌ خطأ في إنشاء profile للمستخدم ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ تم إنشاء المستخدم: ${user.full_name} (${user.email})`);
      }
    }

    if (userIds.length === 0) {
      console.error('❌ لم يتم إنشاء أي مستخدمين. يرجى التحقق من الإعدادات.');
      return;
    }

    console.log(`\n✅ تم إنشاء ${userIds.length} مستخدم\n`);

    // Step 2: Add videos
    console.log('🎬 إضافة الفيديوهات...');
    
    // Add short videos
    const shortVideoData = shortVideos.map((video, index) => ({
      ...video,
      user_id: userIds[index % userIds.length]
    }));

    const { error: shortVideosError } = await supabase
      .from('videos')
      .insert(shortVideoData);

    if (shortVideosError) {
      console.error('❌ خطأ في إضافة الفيديوهات القصيرة:', shortVideosError.message);
    } else {
      console.log(`✅ تم إضافة ${shortVideos.length} فيديو قصير`);
    }

    // Add long videos
    const longVideoData = longVideos.map((video, index) => ({
      ...video,
      user_id: userIds[index % userIds.length]
    }));

    const { error: longVideosError } = await supabase
      .from('videos')
      .insert(longVideoData);

    if (longVideosError) {
      console.error('❌ خطأ في إضافة الفيديوهات الطويلة:', longVideosError.message);
    } else {
      console.log(`✅ تم إضافة ${longVideos.length} فيديو طويل`);
    }

    console.log(`\n✅ تم إضافة ${shortVideos.length + longVideos.length} فيديو إجمالاً\n`);

    // Step 3: Add products
    console.log('🛍️ إضافة المنتجات...');
    
    const productData = products.map((product, index) => ({
      ...product,
      user_id: userIds[index % userIds.length]
    }));

    const { error: productsError } = await supabase
      .from('products')
      .insert(productData);

    if (productsError) {
      console.error('❌ خطأ في إضافة المنتجات:', productsError.message);
    } else {
      console.log(`✅ تم إضافة ${products.length} منتج\n`);
    }

    console.log('\n🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log('\n📊 الملخص:');
    console.log(`   - ${userIds.length} مستخدم`);
    console.log(`   - ${shortVideos.length} فيديو قصير`);
    console.log(`   - ${longVideos.length} فيديو طويل`);
    console.log(`   - ${products.length} منتج`);

  } catch (error: any) {
    console.error('❌ خطأ عام:', error.message);
    process.exit(1);
  }
}

// Run seed function
seed()
  .then(() => {
    console.log('\n✅ اكتمل السكربت بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تنفيذ السكربت:', error);
    process.exit(1);
  });

