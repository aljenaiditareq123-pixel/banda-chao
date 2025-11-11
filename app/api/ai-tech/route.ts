import { NextResponse } from 'next/server';

const mockTechReply = {
  response: 'تحياتي من الباندا التقني. سأراجع البنية الحالية وأقترح تحسيناً عملياً للبنية التقنية.',
};

export async function POST() {
  return NextResponse.json(mockTechReply);
}

export async function GET() {
  return NextResponse.json(mockTechReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
