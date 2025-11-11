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
