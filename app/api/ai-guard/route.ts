import { NextResponse } from 'next/server';

const mockGuardReply = {
  response:
    'هنا الباندا الحارس. سأفحص المخاطر ونضع سياسة صارمة لحماية كلمات المرور والبيانات المالية الحساسة.',
};

export async function POST() {
  return NextResponse.json(mockGuardReply);
}

export async function GET() {
  return NextResponse.json(mockGuardReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
