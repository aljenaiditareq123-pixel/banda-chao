import { NextResponse } from 'next/server';

const mockContentReply = {
  response:
    'أنا باندا المحتوى. سأبني سرداً جذاباً يحفز المشاركة ويحوّل كل قصة إلى حملة قابلة للانتشار.',
};

export async function POST() {
  return NextResponse.json(mockContentReply);
}

export async function GET() {
  return NextResponse.json(mockContentReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
