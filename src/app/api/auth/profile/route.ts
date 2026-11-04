import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/dataStore';

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, identityNumber, avatar, bio, password } = body;

    const updated = await updateUserProfile(user._id, {
      name,
      phone,
      identityNumber,
      avatar,
      bio,
      password: password && password.trim().length >= 6 ? password : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui profil' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
