import { NextResponse } from 'next/server';

const mockFounderReply = {
  response: 'مرحباً أيها المؤسس، رؤيتك في محلها. ما هي نقطة الضعف التالية التي تود معالجتها؟',
};

export async function POST() {
  return NextResponse.json(mockFounderReply);
}

export async function GET() {
  return NextResponse.json(mockFounderReply);
}

const methodNotAllowed = () =>
  NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
