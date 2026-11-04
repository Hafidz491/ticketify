import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, toSafeUser } from '@/lib/dataStore';
import { createSessionToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, expectedRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akun dengan email tersebut tidak ditemukan' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Password salah. Periksa kembali password Anda.' },
        { status: 401 }
      );
    }

    // Role check if explicit role tab was selected
    if (expectedRole === 'admin' && user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Akun ini terdaftar sebagai Pengguna (User), bukan Admin. Silakan gunakan tab login Pengguna.',
        },
        { status: 403 }
      );
    }

    const safeUser = toSafeUser(user);
    const token = createSessionToken(safeUser._id);

    const response = NextResponse.json({
      success: true,
      message: `Login berhasil sebagai ${safeUser.role === 'admin' ? 'Admin / Promotor' : 'Pengguna'}`,
      user: safeUser,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
