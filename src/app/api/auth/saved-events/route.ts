import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { toggleSavedEvent } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu untuk menyimpan event' },
        { status: 401 }
      );
    }

    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID wajib disertakan' }, { status: 400 });
    }

    const savedEventIds = await toggleSavedEvent(user._id, eventId);
    return NextResponse.json({
      success: true,
      savedEventIds,
      isSaved: savedEventIds.includes(eventId),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
