import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil keluar (logout)',
  });

  clearAuthCookie(response);
  return response;
}
