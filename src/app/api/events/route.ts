import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createNewEvent } from '@/lib/dataStore';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;

    const events = await getAllEvents({ search, category, city });

    return NextResponse.json(
      { success: true, count: events.length, events },
      {
        headers: {
          // Serve from cache immediately, revalidate in background after 30 s
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch events';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya admin promotor yang dapat membuat event baru' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.title || !body.artist || !body.venue || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Judul, artis, tempat (venue), dan tanggal wajib diisi' },
        { status: 400 }
      );
    }

    const event = await createNewEvent(body);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
