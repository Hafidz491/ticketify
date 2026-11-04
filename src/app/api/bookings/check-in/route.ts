import { NextRequest, NextResponse } from 'next/server';
import { checkInBooking, getBookingByCode } from '@/lib/dataStore';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Inspect ticket status without checking in
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya petugas / admin yang berwenang memeriksa tiket' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Parameter kode tiket diperlukan' },
        { status: 400 }
      );
    }

    const booking = await getBookingByCode(code);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Tiket tidak ditemukan dalam sistem database' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memvalidasi tiket';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Execute ticket check-in and mark as CHECKED_IN
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya petugas / admin yang berwenang melakukan check-in tiket' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingCode } = body;

    if (!bookingCode) {
      return NextResponse.json(
        { success: false, error: 'Kode tiket tidak boleh kosong' },
        { status: 400 }
      );
    }

    const result = await checkInBooking(bookingCode);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          alreadyCheckedIn: result.alreadyCheckedIn,
          booking: result.booking,
          error: result.message,
        },
        { status: result.alreadyCheckedIn ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      booking: result.booking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses check-in tiket';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
