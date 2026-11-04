import mongoose, { Schema, Model } from 'mongoose';
import { IBooking } from '@/lib/types';

const BuyerSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  identityNumber: { type: String, required: true },
});

const BookingSchema = new Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    eventId: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true },
    eventVenue: { type: String, required: true },
    eventCity: { type: String, required: true },
    eventImage: { type: String, required: true },
    tierId: { type: String, required: true },
    tierName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    serviceFee: { type: Number, default: 15000 },
    buyer: { type: BuyerSchema, required: true },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED', 'CHECKED_IN'],
      default: 'CONFIRMED',
    },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String },
    checkedInAt: { type: String },
    paymentMethod: { type: String, required: true },
    qrCodeData: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const BookingModel: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default BookingModel;
