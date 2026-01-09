import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * Admin API: Seed Products
 * GET /api/v1/admin/seed-products
 * 
 * Adds 3 real products to the database
 */
router.get('/seed-products', async (req: Request, res: Response) => {
  try {
    console.log('🌱 [Admin API] Starting to add real products...');

    // Find or create a maker user for these products
    let makerUser = await prisma.users.findFirst({
      where: {
        role: 'MAKER',
      },
      include: {
        makers: true,
      },
    });

    // If no maker exists, create one
    if (!makerUser) {
      console.log('📦 [Admin API] No maker found, creating a default maker...');
      // Use environment variable for password, fallback to secure random password
      const makerPasswordPlain = process.env.MAKER_DEFAULT_PASSWORD || 
        `Temp${Math.random().toString(36).slice(-12)}!`;
      const hashedPassword = await bcrypt.hash(makerPasswordPlain, 10);
      
      makerUser = await prisma.users.create({
        data: {
          id: randomUUID(),
          email: 'electronics@bandachao.com',
          password: hashedPassword,
          name: 'متجر الإلكترونيات الذكية',
          role: 'MAKER',
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          makers: true,
        },
      });

      // Create maker profile
      await prisma.makers.create({
        data: {
          id: randomUUID(),
          user_id: makerUser.id,
          slug: 'electronics-store',
          name: 'متجر الإلكترونيات الذكية',
          bio: 'متجر متخصص في أحدث الأجهزة الإلكترونية والذكية',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      
      // Reload makerUser to include makers
      makerUser = await prisma.users.findUnique({
        where: { id: makerUser.id },
        include: {
          makers: true,
        },
      });

      console.log('✅ [Admin API] Created maker user:', makerUser?.email);
    }

    // Define the three products
    const products = [
      {
        name: 'سماعة الرأس اللاسلكية "بيور ساوند"',
        description: 'سماعة احترافية عازلة للضجيج مع بطارية تدوم 30 ساعة وشحن سريع.',
        price: 299,
        currency: 'AED',
        category: 'إلكترونيات',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
        externalLink: 'https://banda-chao-frontend.onrender.com/ar/products',
      },
      {
        name: 'ساعة ذكية رياضية "باندا فيت"',
        description: 'تتبع نبضات القلب، خطوات المشي، ومقاومة للماء. رفيقك المثالي للرياضة.',
        price: 149,
        currency: 'AED',
        category: 'رياضة',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        externalLink: 'https://banda-chao-frontend.onrender.com/ar/products',
      },
      {
        name: 'حقيبة الظهر الذكية (ضد السرقة)',
        description: 'حقيبة عصرية بمدخل USB للشحن، تصميم مريح للظهر، وسحابات مخفية للأمان.',
        price: 199,
        currency: 'AED',
        category: 'سفر',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
        externalLink: 'https://banda-chao-frontend.onrender.com/ar/products',
      },
    ];

    const results = {
      created: 0,
      updated: 0,
      products: [] as Array<{ name: string; status: 'created' | 'updated' }>,
    };

    // Add or update products
    for (const productData of products) {
      // Check if product already exists (by name)
      const existingProduct = await prisma.products.findFirst({
        where: {
          name: productData.name,
          user_id: makerUser!.id,
        },
      });

      if (existingProduct) {
        // Update existing product
        await prisma.products.update({
          where: { id: existingProduct.id },
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category_string: productData.category || null,
            image_url: productData.imageUrl,
            external_link: productData.externalLink,
            updated_at: new Date(),
          },
        });
        results.updated++;
        results.products.push({ name: productData.name, status: 'updated' });
        console.log(`✅ [Admin API] Updated product: ${productData.name}`);
      } else {
        // Create new product
        await prisma.products.create({
          data: {
            id: randomUUID(),
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category_string: productData.category || null,
            image_url: productData.imageUrl,
            external_link: productData.externalLink,
            user_id: makerUser!.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        results.created++;
        results.products.push({ name: productData.name, status: 'created' });
        console.log(`✅ [Admin API] Created product: ${productData.name}`);
      }
    }

    const totalProducts = await prisma.products.count();
    console.log(`🎉 [Admin API] Real products added successfully! Total products: ${totalProducts}`);

    // Return success response
    res.json({
      success: true,
      message: 'تم إضافة 3 منتجات بنجاح',
      details: {
        created: results.created,
        updated: results.updated,
        total: results.created + results.updated,
        totalProductsInDatabase: totalProducts,
        products: results.products,
      },
    });
  } catch (error: any) {
    console.error('❌ [Admin API] Error adding products:', error);
    
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة المنتجات',
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * Admin API: Promote User to FOUNDER
 * POST /api/v1/admin/promote-founder
 * 
 * Body: { email: string, secret: string }
 * The secret must match ADMIN_PROMOTE_SECRET env var
 */
router.post('/promote-founder', async (req: Request, res: Response) => {
  try {
    const { email, secret } = req.body;
    
    // Security: Require a secret key to prevent unauthorized access
    const ADMIN_SECRET = process.env.ADMIN_PROMOTE_SECRET || 'banda-chao-founder-2024';
    
    if (secret !== ADMIN_SECRET) {
      console.warn(`⚠️ [Admin API] Unauthorized promote attempt for: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Invalid secret',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    console.log(`🔍 [Admin API] Looking for user: ${email}`);

    // Find the user
    const user = await prisma.users.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found: ${email}`,
      });
    }

    console.log(`✅ [Admin API] Found user: ${user.email}, current role: ${user.role}`);

    if (user.role === 'FOUNDER') {
      return res.json({
        success: true,
        message: 'User is already a FOUNDER',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    // Update role to FOUNDER
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { 
        role: 'FOUNDER',
        updated_at: new Date(),
      },
    });

    console.log(`🎉 [Admin API] Successfully promoted ${email} to FOUNDER`);

    res.json({
      success: true,
      message: `Successfully promoted ${email} to FOUNDER`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });

  } catch (error: any) {
    console.error('❌ [Admin API] Error promoting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote user',
      error: error.message,
    });
  }
});

export default router;

