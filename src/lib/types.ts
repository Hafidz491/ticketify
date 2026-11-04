export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quota: number;
  available: number;
  perks: string[];
}

export interface IEvent {
  _id: string;
  title: string;
  slug: string;
  artist: string;
  category: 'Concert' | 'Festival' | 'Theater' | 'Conference' | 'Comedy' | 'Sports';
  date: string; // ISO date string or formatted date
  time: string;
  venue: string;
  city: string;
  image: string;
  description: string;
  lineup: string[];
  terms: string[];
  ticketTiers: TicketTier[];
  seatingImage?: string;
  isFeatured?: boolean;
  organizer?: string;
  createdAt?: string | Date;
}

export interface BuyerInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityNumber: string;
}

export interface IBooking {
  _id: string;
  userId?: string;
  bookingCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventCity: string;
  eventImage: string;
  tierId: string;
  tierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceFee: number;
  discountAmount?: number;
  promoCode?: string;
  buyer: BuyerInfo;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'CHECKED_IN';
  checkedInAt?: string;
  paymentMethod: string;
  qrCodeData: string;
  createdAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'user' | 'admin';
  phone?: string;
  identityNumber?: string;
  avatar?: string;
  bio?: string;
  savedEventIds?: string[];
  createdAt: string;
}

export type IUserSafe = Omit<IUser, 'passwordHash' | 'passwordSalt'>;

