'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface CreateProductData {
  title: string;
  price: number;
  videoUrl: string;
  userId: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  title: string | null;
  description: string;
  price: number | null;
  video_url: string | null;
  image_url: string | null;
  sold_count: number;
  user_id: string;
  created_at: Date;
}

/**
 * Create a new product in the database
 */
export async function createProduct(data: CreateProductData) {
  try {
    const product = await prisma.products.create({
      data: {
        name: data.title,
        title: data.title,
        description: data.description || `Product: ${data.title}`,
        price: data.price,
        video_url: data.videoUrl,
        image_url: data.imageUrl || null,
        user_id: data.userId,
        sold_count: 0,
      },
    });

    // Revalidate the profile page to show new product
    revalidatePath('/profile');
    revalidatePath(`/[locale]/profile`);

    return {
      success: true,
      product: {
        id: product.id,
        title: product.title || product.name,
        price: product.price,
        videoUrl: product.video_url,
        soldCount: product.sold_count,
      },
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Get all products for a specific user
 */
export async function getUserProducts(userId: string) {
  try {
    const products = await prisma.products.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      products: products.map((product) => ({
        id: product.id,
        title: product.title || product.name,
        name: product.name,
        description: product.description,
        price: product.price,
        videoUrl: product.video_url,
        imageUrl: product.image_url,
        soldCount: product.sold_count,
        createdAt: product.created_at,
      })),
    };
  } catch (error) {
    console.error('Error fetching user products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
      products: [],
    };
  }
}

/**
 * Get user stats (level, points, product count)
 */
export async function getUserStats(userId: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profile_picture: true,
        level: true,
        points: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const productCount = await prisma.products.count({
      where: { user_id: userId },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.profile_picture,
        level: user.level,
        points: user.points,
        productCount,
      },
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user stats',
    };
  }
}
