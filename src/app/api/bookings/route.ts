import { NextRequest, NextResponse } from 'next/server';
import { getAllBookings, createNewBooking, getEventById } from '@/lib/dataStore';
import { getAuthUser } from '@/lib/auth';
import { validatePromoCode } from '@/lib/promos';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email') || undefined;
    const userIdParam = searchParams.get('userId') || undefined;

    let bookings;
    if (user.role === 'admin') {
      // Admin can view all or filtered bookings
      bookings = await getAllBookings(emailParam, userIdParam);
    } else {
      // Regular user can ONLY see their own bookings
      bookings = await getAllBookings(user.email, user._id);
    }

    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data pesanan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu untuk memesan tiket' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, tierId, quantity, buyer, paymentMethod, promoCode } = body;

    if (!eventId || !tierId || !quantity || !buyer?.fullName || !buyer?.email) {
      return NextResponse.json(
        { success: false, error: 'Data pemesanan tidak lengkap' },
        { status: 400 }
      );
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event tidak ditemukan' },
        { status: 404 }
      );
    }

    const tier = event.ticketTiers.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json(
        { success: false, error: 'Kategori tiket tidak valid' },
        { status: 400 }
      );
    }

    if (tier.available < quantity) {
      return NextResponse.json(
        { success: false, error: `Tiket tidak mencukupi. Sisa tiket: ${tier.available}` },
        { status: 400 }
      );
    }

    const serviceFee = 15000;
    const ticketSubtotal = tier.price * quantity;

    // Validate promo code & calculate discount securely on the server
    let cleanDiscount = 0;
    let cleanPromoCode: string | undefined = undefined;

    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const promoResult = validatePromoCode(promoCode, ticketSubtotal);
      if (promoResult.valid) {
        cleanDiscount = promoResult.discountAmount;
        cleanPromoCode = promoResult.code;
      }
    }

    const totalPrice = Math.max(0, ticketSubtotal + serviceFee - cleanDiscount);

    const booking = await createNewBooking({
      userId: authUser._id,
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      eventCity: event.city,
      eventImage: event.image,
      tierId: tier.id,
      tierName: tier.name,
      quantity,
      unitPrice: tier.price,
      totalPrice,
      serviceFee,
      discountAmount: cleanDiscount,
      promoCode: cleanPromoCode,
      buyer: {
        fullName: buyer.fullName.trim(),
        email: buyer.email.trim().toLowerCase(),
        phoneNumber: buyer.phoneNumber || authUser.phone || '-',
        identityNumber: buyer.identityNumber || authUser.identityNumber || '-',
      },
      paymentMethod: paymentMethod || 'QRIS Instant',
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses pemesanan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
