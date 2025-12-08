import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api-utils';

/**
 * API Route: Seed Products
 * GET /api/admin/seed-products
 * 
 * This route calls the backend API to execute the seed script
 * which adds 3 real products to the database:
 * 1. سماعة الرأس اللاسلكية "بيور ساوند" (299 AED)
 * 2. ساعة ذكية رياضية "باندا فيت" (149 AED)
 * 3. حقيبة الظهر الذكية (ضد السرقة) (199 AED)
 */

/**
 * API Route: Seed Products
 * GET /api/admin/seed-products
 * 
 * Adds 3 real products to the database:
 * 1. سماعة الرأس اللاسلكية "بيور ساوند" (299 AED)
 * 2. ساعة ذكية رياضية "باندا فيت" (149 AED)
 * 3. حقيبة الظهر الذكية (ضد السرقة) (199 AED)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🌱 [Seed Products API] Starting to add real products...');

    const API_URL = getApiUrl();
    
    // Call backend API to execute seed script
    // We'll create a backend endpoint that runs the seed script
    const response = await fetch(`${API_URL}/api/v1/admin/seed-products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No credentials needed for admin seed endpoint
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [Seed Products API] Backend error:', data);
      return NextResponse.json(
        {
          success: false,
          message: 'حدث خطأ أثناء إضافة المنتجات',
          error: data.error || data.message || 'Backend API error',
        },
        { status: response.status }
      );
    }

    console.log('🎉 [Seed Products API] Products added successfully!');

    // Return success response in Arabic
    return NextResponse.json(
      {
        success: true,
        message: 'تم إضافة 3 منتجات بنجاح',
        details: data.details || data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [Seed Products API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إضافة المنتجات',
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

