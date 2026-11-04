import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/dataStore';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving event';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya admin promotor yang dapat memperbarui event' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateEvent(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Event tidak ditemukan atau gagal diperbarui' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating event';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya admin promotor yang dapat menghapus event' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await deleteEvent(id);
    return NextResponse.json({ success, message: 'Event berhasil dihapus' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting event';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

