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
  video_url?: string;
  external_images?: string[];
  colors?: string[];
  sizes?: string[];
  userId?: string; // Passed from client
  // C2M fields
  isPreOrder?: boolean;
  targetQuantity?: number | null;
  campaignEndDate?: string | null;
  manufactureStatus?: string;
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
    // Use centralized API URL utility
    const { getApiUrl } = await import('@/lib/api-utils');
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/users/me`, {
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
    // Validate and sanitize input data
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return {
        success: false,
        error: 'Product name is required',
      };
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      return {
        success: false,
        error: 'Product description is required',
      };
    }

    // Parse and validate price (handle string or number)
    let priceValue: number | null = null;
    if (data.price !== undefined && data.price !== null) {
      if (typeof data.price === 'string') {
        const parsed = parseFloat(data.price);
        if (isNaN(parsed) || parsed < 0) {
          return {
            success: false,
            error: 'Invalid price value. Price must be a valid positive number.',
          };
        }
        priceValue = parsed;
      } else if (typeof data.price === 'number') {
        if (isNaN(data.price) || data.price < 0) {
          return {
            success: false,
            error: 'Invalid price value. Price must be a valid positive number.',
          };
        }
        priceValue = data.price;
      }
    }

    // Parse and validate stock (handle string or number)
    let stockValue: number = 0;
    if (data.stock !== undefined && data.stock !== null) {
      if (typeof data.stock === 'string') {
        const parsed = parseInt(data.stock, 10);
        if (isNaN(parsed) || parsed < 0) {
          return {
            success: false,
            error: 'Invalid stock value. Stock must be a valid non-negative integer.',
          };
        }
        stockValue = parsed;
      } else if (typeof data.stock === 'number') {
        if (isNaN(data.stock) || data.stock < 0 || !Number.isInteger(data.stock)) {
          return {
            success: false,
            error: 'Invalid stock value. Stock must be a valid non-negative integer.',
          };
        }
        stockValue = data.stock;
      }
    }

    // Get current user
    let user = await getCurrentUser();
    
    // If userId is passed from client, use it (for admin operations)
    if (!user && data.userId) {
      try {
        const dbUser = await prisma.users.findUnique({
          where: { id: data.userId },
          select: { id: true, role: true },
        });
        if (dbUser) {
          user = { id: dbUser.id, role: dbUser.role };
        }
      } catch (dbError) {
        console.error('Error fetching user by ID:', dbError);
        return {
          success: false,
          error: 'Failed to verify user permissions',
        };
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
    let mainImage = data.image_url || (data.external_images && Array.isArray(data.external_images) && data.external_images.length > 0 && data.external_images[0]) || null;

    // Validate mainImage is a string if provided
    if (mainImage && typeof mainImage !== 'string') {
      return {
        success: false,
        error: 'Invalid image URL format',
      };
    }

    // Truncate long strings as a safety measure (though DB now supports Text type)
    const MAX_URL_LENGTH = 2048; // URLs can be very long (Amazon, etc.)
    const MAX_DESCRIPTION_LENGTH = 10000; // Very long descriptions
    
    const truncateString = (str: string, maxLength: number): string => {
      if (str.length <= maxLength) return str;
      console.warn('[createProduct] String truncated from', str.length, 'to', maxLength, 'characters');
      return str.substring(0, maxLength);
    };

    // Truncate long URLs if needed
    if (mainImage && mainImage.length > MAX_URL_LENGTH) {
      mainImage = truncateString(mainImage, MAX_URL_LENGTH);
    }

    // Create product with validated data
    let product;
    try {
      // Truncate video_url if provided
      const videoUrlValue = (data.video_url && typeof data.video_url === 'string' && data.video_url.trim()) 
        ? truncateString(data.video_url.trim(), MAX_URL_LENGTH)
        : null;

      product = await prisma.products.create({
        data: {
          name: data.name.trim(),
          name_ar: (data.name_ar && typeof data.name_ar === 'string') ? data.name_ar.trim() : null,
          name_zh: (data.name_zh && typeof data.name_zh === 'string') ? data.name_zh.trim() : null,
          description: truncateString(data.description.trim(), MAX_DESCRIPTION_LENGTH),
          description_ar: (data.description_ar && typeof data.description_ar === 'string') 
            ? truncateString(data.description_ar.trim(), MAX_DESCRIPTION_LENGTH) 
            : null,
          description_zh: (data.description_zh && typeof data.description_zh === 'string') 
            ? truncateString(data.description_zh.trim(), MAX_DESCRIPTION_LENGTH) 
            : null,
          price: priceValue,
          original_price: priceValue,
          stock: stockValue,
          image_url: mainImage || null,
          video_url: videoUrlValue,
          user_id: user.id,
          status: 'ACTIVE',
          sold_count: 0,
          views_count: 0,
          rating: 0,
          reviews_count: 0,
          // C2M fields
          is_pre_order: data.isPreOrder || false,
          target_quantity: data.targetQuantity || null,
          current_orders: 0,
          campaign_end_date: data.campaignEndDate ? new Date(data.campaignEndDate) : null,
          manufacture_status: data.manufactureStatus || 'PENDING',
        },
      });
    } catch (prismaError: any) {
      console.error('Prisma error creating product:', prismaError);
      
      // Handle specific Prisma errors
      if (prismaError.code === 'P2002') {
        return {
          success: false,
          error: 'A product with this name already exists',
        };
      }
      
      if (prismaError.code === 'P2003') {
        return {
          success: false,
          error: 'Invalid user reference. Please try logging in again.',
        };
      }

      return {
        success: false,
        error: `Database error: ${prismaError.message || 'Failed to create product'}`,
      };
    }

    // Note: Inventory sync to Redis is handled by the backend service
    // This is a server action, so we don't need to import server services here
    // The inventory will be synced when the backend processes the product creation

    // Create product variants for colors and sizes (with error handling)
    if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
      try {
        for (const color of data.colors) {
          if (color && typeof color === 'string') {
            await prisma.product_variants.create({
              data: {
                product_id: product.id,
                name: `Color: ${color.trim()}`,
                name_ar: `اللون: ${color.trim()}`,
                price: priceValue,
                stock: stockValue,
                created_by: user.id,
              },
            });
          }
        }
      } catch (variantError) {
        console.error('Error creating color variants:', variantError);
        // Don't fail the whole operation if variants fail
      }
    }

    if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
      try {
        for (const size of data.sizes) {
          if (size && typeof size === 'string') {
            await prisma.product_variants.create({
              data: {
                product_id: product.id,
                name: `Size: ${size.trim()}`,
                name_ar: `المقاس: ${size.trim()}`,
                price: priceValue,
                stock: stockValue,
                created_by: user.id,
              },
            });
          }
        }
      } catch (variantError) {
        console.error('Error creating size variants:', variantError);
        // Don't fail the whole operation if variants fail
      }
    }

    // Revalidate paths (wrap in try/catch to prevent errors during render)
    try {
      revalidatePath('/admin/products');
      revalidatePath('/admin');
      revalidatePath('/profile');
      // Only revalidate locale path if we have a valid locale format
      // Skip dynamic locale paths to avoid potential errors
    } catch (revalidateError) {
      console.error('Error revalidating paths (non-critical):', revalidateError);
      // Don't fail the operation if revalidation fails
    }

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
    };
  } catch (error: unknown) {
    // Comprehensive error handling
    console.error('Error creating product:', error);
    
    let errorMessage = 'Failed to create product';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'Database connection error. Please check server configuration.';
      } else if (error.message.includes('Unauthorized') || error.message.includes('permission')) {
        errorMessage = 'You do not have permission to create products.';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorMessage = `Validation error: ${error.message}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'An unexpected error occurred while creating the product.';
    }
    
    return {
      success: false,
      error: errorMessage,
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
