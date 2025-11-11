import { NextResponse } from 'next/server';

const mockLogisticsReply = {
  response:
    'أنا باندا اللوجستيات. سأضمن تدفق المخزون والتوصيل بكفاءة، مع خطط استجابة سريعة لأي تعطل.',
};

export async function POST() {
  return NextResponse.json(mockLogisticsReply);
}

export async function GET() {
  return NextResponse.json(mockLogisticsReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
