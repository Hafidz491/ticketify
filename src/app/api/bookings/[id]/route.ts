import { NextRequest, NextResponse } from 'next/server';
import { getBookingByCode } from '@/lib/dataStore';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const booking = await getBookingByCode(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    // User can only view their own booking unless they are an admin
    if (user.role !== 'admin' && booking.userId !== user._id && booking.buyer.email !== user.email) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda tidak memiliki hak akses ke tiket ini' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching booking';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
