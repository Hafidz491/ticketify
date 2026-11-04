import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat profil pengguna';
    return NextResponse.json({ success: false, error: msg, user: null }, { status: 500 });
  }
}
