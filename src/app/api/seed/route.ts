import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_EVENTS } from '@/lib/mockData';
import connectToDatabase from '@/lib/mongodb';
import EventModel from '@/models/EventModel';
import { saveEvents } from '@/lib/dataStore';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET only checks database and connection status WITHOUT wiping data
export async function GET() {
  try {
    const { isConnected } = await connectToDatabase();
    return NextResponse.json({
      success: true,
      source: isConnected ? 'mongodb' : 'file',
      connected: isConnected,
      message: isConnected
        ? 'Terhubung dengan database MongoDB'
        : 'Menggunakan penyimpanan data persisten lokal (JSON file store)',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error checking status';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST is only used for manual explicit reset if confirmed with ?reset=true by an admin
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya admin yang diizinkan mereset database' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset');

    if (reset !== 'true') {
      return NextResponse.json(
        {
          success: false,
          message: 'Reset dicegah: kirim parameter ?reset=true untuk mengonfirmasi reset database.',
        },
        { status: 400 }
      );
    }

    const { isConnected } = await connectToDatabase();
    if (isConnected) {
      await EventModel.deleteMany({});
      await EventModel.insertMany(INITIAL_EVENTS);
    }

    saveEvents(JSON.parse(JSON.stringify(INITIAL_EVENTS)));

    return NextResponse.json({
      success: true,
      message: 'Database berhasil di-reset ke data bawaan.',
      source: isConnected ? 'mongodb' : 'file',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal reset database';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
