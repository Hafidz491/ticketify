import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/dataStore';
import { createSessionToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, identityNumber, role } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama lengkap wajib diisi' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' },
        { status: 409 }
      );
    }

    let finalRole: 'user' | 'admin' = 'user';
    if (role === 'admin') {
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'PROMOTOR2026';
      const providedKey = (body.adminKey || identityNumber || '').trim().toUpperCase();
      if (providedKey !== adminSecret.toUpperCase()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Kode otorisasi promotor tidak valid. Gunakan kode "PROMOTOR2026" untuk registrasi akun admin.',
          },
          { status: 403 }
        );
      }
      finalRole = 'admin';
    }

    const user = await createUser({
      name,
      email,
      password,
      role: finalRole,
      phone,
      identityNumber,
    });

    const token = createSessionToken(user._id);
    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      user,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
