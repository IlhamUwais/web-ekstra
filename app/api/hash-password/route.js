// app/api/hash-password/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  if (!password) {
    return NextResponse.json({ error: 'Sediakan parameter ?password=' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return NextResponse.json({ password, hashedPassword });
}