import mongoose, { Schema, Model } from 'mongoose';
import { IEvent } from '@/lib/types';

const TicketTierSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quota: { type: Number, required: true },
  available: { type: Number, required: true },
  perks: [{ type: String }],
});

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    artist: { type: String, required: true },
    category: {
      type: String,
      enum: ['Concert', 'Festival', 'Theater', 'Conference', 'Comedy', 'Sports'],
      default: 'Concert',
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    lineup: [{ type: String }],
    terms: [{ type: String }],
    ticketTiers: [TicketTierSchema],
    seatingImage: { type: String, default: '/seating/stadium-arena.svg' },
    isFeatured: { type: Boolean, default: false },
    organizer: { type: String, default: 'Ticketify Live' },
  },
  {
    timestamps: true,
  }
);

export const EventModel: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default EventModel;
