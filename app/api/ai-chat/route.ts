import { NextResponse } from 'next/server';

const mockReply = {
  response: 'مرحباً، أنا مساعد Banda Chao. كيف يمكنني دعمك في إيجاد منتج حرفي اليوم؟',
};

export async function POST() {
  return NextResponse.json(mockReply);
}

export async function GET() {
  return NextResponse.json(mockReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
