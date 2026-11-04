import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAllBookings, getAllEvents } from '@/lib/dataStore';
import { IBooking, IEvent } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    // Retrieve bookings matching user._id OR user.email
    const userBookings: IBooking[] = await getAllBookings(user.email, user._id);

    // Retrieve all events to populate saved events
    const allEvents: IEvent[] = await getAllEvents();
    const savedEventIds = new Set(user.savedEventIds || []);
    const savedEvents = allEvents.filter((evt) => savedEventIds.has(evt._id) || savedEventIds.has(evt.slug));

    // Calculate dates & stats
    const todayStr = new Date().toISOString().split('T')[0];

    let totalTickets = 0;
    let totalSpent = 0;
    let upcomingCount = 0;
    let pastCount = 0;
    let nextUpcomingBooking: IBooking | null = null;

    // Sort bookings by date descending for history
    const sortedBookings = [...userBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Identify upcoming vs past
    const upcomingList: IBooking[] = [];
    const pastList: IBooking[] = [];

    for (const b of userBookings) {
      totalTickets += b.quantity;
      totalSpent += b.totalPrice;

      if (b.eventDate >= todayStr && b.status !== 'CANCELLED') {
        upcomingCount += b.quantity;
        upcomingList.push(b);
      } else {
        pastCount += b.quantity;
        pastList.push(b);
      }
    }

    // Sort upcoming by event date ascending to find the next concert
    upcomingList.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    if (upcomingList.length > 0) {
      nextUpcomingBooking = upcomingList[0];
    }

    return NextResponse.json({
      success: true,
      user,
      stats: {
        totalBookings: userBookings.length,
        totalTickets,
        totalSpent,
        upcomingCount,
        pastCount,
        savedEventsCount: savedEvents.length,
        nextUpcomingBooking,
      },
      bookings: sortedBookings,
      upcomingBookings: upcomingList,
      pastBookings: pastList,
      savedEvents,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat ringkasan dashboard';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
