import { NextResponse } from 'next/server';

const mockCommerceReply = {
  response:
    'أهلاً بك مع باندا التجارة. سنحدد الفرص الأسرع نمواً ونبني رحلة مشتري سلسة تعزز التحويلات.',
};

export async function POST() {
  return NextResponse.json(mockCommerceReply);
}

export async function GET() {
  return NextResponse.json(mockCommerceReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
