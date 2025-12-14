'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';

export interface CreateProductData {
  name: string;
  name_ar?: string;
  name_zh?: string;
  description: string;
  description_ar?: string;
  description_zh?: string;
  price: number;
  stock: number;
  image_url?: string;
  external_images?: string[];
  colors?: string[];
  sizes?: string[];
  userId?: string; // Passed from client
}

async function getCurrentUser(): Promise<{ id: string; role: string } | null> {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }

    // Call API to verify user (simpler than JWT verification in server action)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
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
 * Integrates with InventoryService and TreasurerService
 */
export async function createProduct(data: CreateProductData) {
  try {
    // Get current user
    let user = await getCurrentUser();
    
    // If userId is passed from client, use it (for admin operations)
    if (!user && data.userId) {
      const dbUser = await prisma.users.findUnique({
        where: { id: data.userId },
        select: { id: true, role: true },
      });
      if (dbUser) {
        user = { id: dbUser.id, role: dbUser.role };
      }
    }

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized - Please log in',
      };
    }

    // Check permissions
    if (user.role !== 'ADMIN' && user.role !== 'FOUNDER') {
      return {
        success: false,
        error: 'Unauthorized - Admin or Founder role required',
      };
    }

    // Use first external image as main image if no image_url provided
    const mainImage = data.image_url || (data.external_images && data.external_images[0]) || null;

    // Create product
    const product = await prisma.products.create({
      data: {
        name: data.name,
        name_ar: data.name_ar || null,
        name_zh: data.name_zh || null,
        description: data.description,
        description_ar: data.description_ar || null,
        description_zh: data.description_zh || null,
        price: data.price,
        original_price: data.price,
        stock: data.stock,
        image_url: mainImage,
        user_id: user.id,
        status: 'ACTIVE',
        sold_count: 0,
        views_count: 0,
        rating: 0,
        reviews_count: 0,
      },
    });

    // Note: Inventory sync to Redis is handled by the backend service
    // This is a server action, so we don't need to import server services here
    // The inventory will be synced when the backend processes the product creation

    // Create product variants for colors and sizes
    if (data.colors && data.colors.length > 0) {
      for (const color of data.colors) {
        await prisma.product_variants.create({
          data: {
            product_id: product.id,
            name: `Color: ${color}`,
            name_ar: `اللون: ${color}`,
            price: data.price,
            stock: data.stock,
            created_by: user.id,
          },
        });
      }
    }

    if (data.sizes && data.sizes.length > 0) {
      for (const size of data.sizes) {
        await prisma.product_variants.create({
          data: {
            product_id: product.id,
            name: `Size: ${size}`,
            name_ar: `المقاس: ${size}`,
            price: data.price,
            stock: data.stock,
            created_by: user.id,
          },
        });
      }
    }

    // Revalidate paths
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/profile');
    revalidatePath(`/[locale]/profile`);

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
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
 * Get all products for a specific user (by userId or email)
 */
export async function getUserProducts(userIdOrEmail: string) {
  try {
    // Try to find user by email first (if it looks like an email)
    let userId = userIdOrEmail;
    
    if (userIdOrEmail.includes('@')) {
      // It's an email, find user first
      const user = await prisma.users.findUnique({
        where: { email: userIdOrEmail },
        select: { id: true },
      });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          products: [],
        };
      }
      
      userId = user.id;
    }

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
