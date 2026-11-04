import { IEvent, IBooking, TicketTier, IUser, IUserSafe } from './types';
import { INITIAL_EVENTS } from './mockData';
import connectToDatabase from './mongodb';
import EventModel from '@/models/EventModel';
import BookingModel from '@/models/BookingModel';
import UserModel from '@/models/UserModel';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// PERSISTENT FILE-BASED STORAGE LAYER (RESILIENT ZERO-LOSS STORE)
// -------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data dir, falling back to memory:', err);
  }
}

// In-memory persistent state for zero-crash fallback
declare global {
  // eslint-disable-next-line no-var
  var memoryEvents: IEvent[] | undefined;
  // eslint-disable-next-line no-var
  var memoryBookings: IBooking[] | undefined;
  // eslint-disable-next-line no-var
  var memoryUsers: IUser[] | undefined;
}

const DEMO_SALT = 'ticketify_salt_demo_2026';
const DEMO_HASH = crypto.pbkdf2Sync('password123', DEMO_SALT, 1000, 64, 'sha512').toString('hex');

const ADMIN_SALT = 'ticketify_admin_salt_2026';
const ADMIN_HASH = crypto.pbkdf2Sync('admin123', ADMIN_SALT, 1000, 64, 'sha512').toString('hex');

const DEFAULT_USERS: IUser[] = [
  {
    _id: 'usr-admin-1',
    name: 'Admin Promotor Ticketify',
    email: 'admin@ticketify.com',
    passwordHash: ADMIN_HASH,
    passwordSalt: ADMIN_SALT,
    role: 'admin',
    phone: '081199887766',
    identityNumber: '3171099999990001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Promotor resmi Ticketify Indonesia. Pengelola konser musik akbar dan festival.',
    savedEventIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr-demo-1',
    name: 'Alex Pratama (Pengguna)',
    email: 'user@ticketify.com',
    passwordHash: DEMO_HASH,
    passwordSalt: DEMO_SALT,
    role: 'user',
    phone: '081234567890',
    identityNumber: '3171012345670001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: 'Music enthusiast & festival goer. Suka konser musik rock, jazz, dan orkestra.',
    savedEventIds: ['evt-101', 'evt-103'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr-demo-2',
    name: 'Alex Pratama',
    email: 'alex@ticketify.com',
    passwordHash: DEMO_HASH,
    passwordSalt: DEMO_SALT,
    role: 'user',
    phone: '081234567890',
    identityNumber: '3171012345670001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: 'Music enthusiast & festival goer.',
    savedEventIds: ['evt-101', 'evt-103'],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_BOOKINGS: IBooking[] = [
  {
    _id: 'bkg-demo-1',
    userId: 'usr-demo-1',
    bookingCode: 'TCK-782914',
    eventId: 'evt-101',
    eventTitle: 'Coldplay: Music of the Spheres World Tour',
    eventDate: '2026-11-15',
    eventTime: '19:30 WIB',
    eventVenue: 'Stadion Utama Gelora Bung Karno (GBK)',
    eventCity: 'Jakarta',
    eventImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    tierId: 'tier-2',
    tierName: 'Festival A (Standing Front Stage)',
    quantity: 2,
    unitPrice: 3200000,
    totalPrice: 6415000,
    serviceFee: 15000,
    buyer: {
      fullName: 'Alex Pratama (Pengguna)',
      email: 'user@ticketify.com',
      phoneNumber: '081234567890',
      identityNumber: '3171012345670001',
    },
    status: 'CONFIRMED',
    paymentMethod: 'QRIS Instant',
    qrCodeData: JSON.stringify({
      code: 'TCK-782914',
      event: 'Coldplay: Music of the Spheres World Tour',
      tier: 'Festival A (Standing Front Stage)',
      qty: 2,
      buyer: 'Alex Pratama (Pengguna)',
    }),
    createdAt: '2026-09-10T14:22:00.000Z',
  },
  {
    _id: 'bkg-demo-2',
    userId: 'usr-demo-1',
    bookingCode: 'TCK-341908',
    eventId: 'evt-103',
    eventTitle: 'Jakarta International Java Jazz Festival 2026',
    eventDate: '2026-06-05',
    eventTime: '15:00 WIB',
    eventVenue: 'JIExpo Kemayoran',
    eventCity: 'Jakarta Pusat',
    eventImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    tierId: 'tier-jj-1',
    tierName: '3-Day Pass Regular',
    quantity: 1,
    unitPrice: 1750000,
    totalPrice: 1765000,
    serviceFee: 15000,
    buyer: {
      fullName: 'Alex Pratama (Pengguna)',
      email: 'user@ticketify.com',
      phoneNumber: '081234567890',
      identityNumber: '3171012345670001',
    },
    status: 'CONFIRMED',
    paymentMethod: 'BCA Virtual Account',
    qrCodeData: JSON.stringify({
      code: 'TCK-341908',
      event: 'Jakarta International Java Jazz Festival 2026',
      tier: '3-Day Pass Regular',
      qty: 1,
      buyer: 'Alex Pratama (Pengguna)',
    }),
    createdAt: '2026-05-20T10:15:00.000Z',
  },
];

// --- Events Disk Persistence ---
export function loadEvents(): IEvent[] {
  ensureDataDir();
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.memoryEvents = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading events from disk:', err);
  }

  // Fallback to initial events and save to disk
  const initial = JSON.parse(JSON.stringify(INITIAL_EVENTS));
  saveEvents(initial);
  return initial;
}

export function saveEvents(events: IEvent[]): void {
  ensureDataDir();
  global.memoryEvents = events;
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving events to disk:', err);
  }
}

// --- Bookings Disk Persistence ---
export function loadBookings(): IBooking[] {
  ensureDataDir();
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        global.memoryBookings = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading bookings from disk:', err);
  }

  saveBookings(DEFAULT_BOOKINGS);
  return DEFAULT_BOOKINGS;
}

export function saveBookings(bookings: IBooking[]): void {
  ensureDataDir();
  global.memoryBookings = bookings;
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving bookings to disk:', err);
  }
}

// --- Users Disk Persistence ---
export function loadUsers(): IUser[] {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.memoryUsers = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading users from disk:', err);
  }

  saveUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export function saveUsers(users: IUser[]): void {
  ensureDataDir();
  global.memoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving users to disk:', err);
  }
}

// Initialize memory and disk on first import
if (!global.memoryEvents) {
  loadEvents();
}
if (!global.memoryBookings) {
  loadBookings();
}
if (!global.memoryUsers) {
  loadUsers();
}

// -------------------------------------------------------------
// HELPER UTILITIES
// -------------------------------------------------------------
export function hashPassword(password: string, saltInput?: string): { hash: string; salt: string } {
  const salt = saltInput || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computed === hash;
}

export function toSafeUser(user: IUser): IUserSafe {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, passwordSalt, ...safe } = user;
  return safe;
}

// -------------------------------------------------------------
// EVENTS OPERATIONS
// -------------------------------------------------------------
export async function getAllEvents(params?: {
  search?: string;
  category?: string;
  city?: string;
}): Promise<IEvent[]> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const count = await EventModel.countDocuments();
      if (count === 0) {
        // Seed MongoDB from persistent disk events
        const diskEvents = loadEvents();
        await EventModel.insertMany(diskEvents);
      }

      const query: Record<string, unknown> = {};
      if (params?.category && params.category !== 'All') {
        query.category = params.category;
      }
      if (params?.city && params.city !== 'All') {
        query.city = { $regex: new RegExp(params.city, 'i') };
      }
      if (params?.search) {
        query.$or = [
          { title: { $regex: new RegExp(params.search, 'i') } },
          { artist: { $regex: new RegExp(params.search, 'i') } },
          { venue: { $regex: new RegExp(params.search, 'i') } },
        ];
      }

      const events = await EventModel.find(query).sort({ date: 1 }).lean();
      return JSON.parse(JSON.stringify(events));
    } catch (err) {
      console.warn('Error querying MongoDB, falling back to disk store:', err);
    }
  }

  // Read latest events from disk store
  let filtered = loadEvents();

  if (params?.category && params.category !== 'All') {
    filtered = filtered.filter(
      (e) => e.category.toLowerCase() === params.category?.toLowerCase()
    );
  }

  if (params?.city && params.city !== 'All') {
    filtered = filtered.filter((e) =>
      e.city.toLowerCase().includes(params.city!.toLowerCase())
    );
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export async function getEventById(id: string): Promise<IEvent | null> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const event = await EventModel.findOne({
        $or: [{ _id: id }, { slug: id }],
      }).lean();
      if (event) {
        return JSON.parse(JSON.stringify(event));
      }
    } catch {
      // Continue to disk fallback
    }
  }

  const events = loadEvents();
  const found = events.find((e) => e._id === id || e.slug === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

export async function createNewEvent(eventData: Partial<IEvent>): Promise<IEvent> {
  const { isConnected } = await connectToDatabase();
  const slug =
    eventData.slug ||
    (eventData.title || 'event')
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Date.now().toString().slice(-4);

  const newEvent: IEvent = {
    _id: `evt-${Date.now()}`,
    title: eventData.title || 'Untitled Event',
    slug,
    artist: eventData.artist || 'Special Artist',
    category: eventData.category || 'Concert',
    date: eventData.date || new Date().toISOString().split('T')[0],
    time: eventData.time || '19:00 WIB',
    venue: eventData.venue || 'Main Stadium Jakarta',
    city: eventData.city || 'Jakarta',
    image:
      eventData.image ||
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    description: eventData.description || 'Pengalaman konser spektakuler tak terlupakan.',
    lineup: eventData.lineup || [eventData.artist || 'Performer'],
    terms: eventData.terms || [
      'Wajib membawa identitas diri resmi (KTP/Passport).',
      'Tiket tidak dapat di-refund.',
    ],
    seatingImage: eventData.seatingImage || '/seating/stadium-arena.svg',
    isFeatured: Boolean(eventData.isFeatured),
    organizer: eventData.organizer || 'Ticketify Official',
    ticketTiers: eventData.ticketTiers || [
      {
        id: `tier-${Date.now()}-1`,
        name: 'General Admission',
        price: 500000,
        quota: 1000,
        available: 1000,
        perks: ['Akses umum ke area festival'],
      },
      {
        id: `tier-${Date.now()}-2`,
        name: 'VIP Experience',
        price: 1500000,
        quota: 200,
        available: 200,
        perks: ['Akses VIP khusus', 'Free merchandise voucher'],
      },
    ],
  };

  if (isConnected) {
    try {
      await EventModel.create(newEvent);
    } catch (err) {
      console.warn('Failed creating in MongoDB, saving in disk store:', err);
    }
  }

  // Always save to disk
  const currentEvents = loadEvents();
  saveEvents([newEvent, ...currentEvents.filter((e) => e._id !== newEvent._id)]);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<IEvent>): Promise<IEvent | null> {
  const { isConnected } = await connectToDatabase();
  if (isConnected) {
    try {
      await EventModel.findOneAndUpdate(
        { $or: [{ _id: id }, { slug: id }] },
        { $set: updates },
        { new: true }
      );
    } catch (err) {
      console.warn('Failed updating event in MongoDB:', err);
    }
  }

  const currentEvents = loadEvents();
  const idx = currentEvents.findIndex((e) => e._id === id || e.slug === id);
  if (idx !== -1) {
    currentEvents[idx] = { ...currentEvents[idx], ...updates };
    saveEvents(currentEvents);
    return currentEvents[idx];
  }
  return null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { isConnected } = await connectToDatabase();
  if (isConnected) {
    try {
      await EventModel.deleteOne({ $or: [{ _id: id }, { slug: id }] });
    } catch (err) {
      console.warn('Failed deleting event from MongoDB:', err);
    }
  }

  const currentEvents = loadEvents();
  const filtered = currentEvents.filter((e) => e._id !== id && e.slug !== id);
  saveEvents(filtered);
  return true;
}

// -------------------------------------------------------------
// BOOKING OPERATIONS
// -------------------------------------------------------------
export async function createNewBooking(
  bookingData: Omit<IBooking, '_id' | 'bookingCode' | 'createdAt' | 'status' | 'qrCodeData'>
): Promise<IBooking> {
  const { isConnected } = await connectToDatabase();
  const code = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrData = JSON.stringify({
    code,
    event: bookingData.eventTitle,
    tier: bookingData.tierName,
    qty: bookingData.quantity,
    buyer: bookingData.buyer.fullName,
    issuedAt: new Date().toISOString(),
  });

  const fullBooking: IBooking = {
    _id: `bkg-${Date.now()}`,
    bookingCode: code,
    ...bookingData,
    status: 'CONFIRMED',
    qrCodeData: qrData,
    createdAt: new Date().toISOString(),
  };

  // Deduct available tickets in events (Disk & MongoDB)
  const currentEvents = loadEvents();
  const evtIdx = currentEvents.findIndex((e) => e._id === bookingData.eventId || e.slug === bookingData.eventId);
  if (evtIdx !== -1) {
    const tier = currentEvents[evtIdx].ticketTiers.find(
      (t) => t.id === bookingData.tierId || t.name === bookingData.tierName
    );
    if (tier && tier.available >= bookingData.quantity) {
      tier.available -= bookingData.quantity;
      saveEvents(currentEvents);
    }
  }

  if (isConnected) {
    try {
      await BookingModel.create(fullBooking);
      await EventModel.findOneAndUpdate(
        { _id: bookingData.eventId, 'ticketTiers.id': bookingData.tierId },
        { $inc: { 'ticketTiers.$.available': -bookingData.quantity } }
      );
    } catch (err) {
      console.warn('Failed saving booking in MongoDB, saved in disk store:', err);
    }
  }

  // Always save booking to disk
  const currentBookings = loadBookings();
  saveBookings([fullBooking, ...currentBookings]);
  return fullBooking;
}

export async function getAllBookings(emailFilter?: string, userIdFilter?: string): Promise<IBooking[]> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const conditions: Record<string, unknown>[] = [];
      if (userIdFilter) {
        conditions.push({ userId: userIdFilter });
      }
      if (emailFilter) {
        conditions.push({ 'buyer.email': emailFilter.toLowerCase() });
      }

      const query: Record<string, unknown> =
        conditions.length > 1
          ? { $or: conditions }
          : conditions.length === 1
          ? conditions[0]
          : {};

      const bookings = await BookingModel.find(query).sort({ createdAt: -1 }).lean();
      return JSON.parse(JSON.stringify(bookings));
    } catch {
      // fallback
    }
  }

  let list = loadBookings();
  if (userIdFilter || emailFilter) {
    const cleanEmail = emailFilter?.toLowerCase();
    list = list.filter(
      (b) =>
        (userIdFilter && b.userId === userIdFilter) ||
        (cleanEmail && b.buyer.email.toLowerCase() === cleanEmail)
    );
  }
  return list;
}

export async function getBookingByCode(code: string): Promise<IBooking | null> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const booking = await BookingModel.findOne({
        $or: [{ bookingCode: code }, { _id: code }],
      }).lean();
      if (booking) {
        return JSON.parse(JSON.stringify(booking));
      }
    } catch {
      // fallback
    }
  }

  const list = loadBookings();
  const found = list.find(
    (b) => b.bookingCode.toUpperCase() === code.toUpperCase() || b._id === code
  );
  return found || null;
}

export async function checkInBooking(rawCode: string): Promise<{
  success: boolean;
  message: string;
  alreadyCheckedIn?: boolean;
  booking?: IBooking;
}> {
  const cleanCode = (rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Kode tiket tidak boleh kosong.' };
  }

  const { isConnected } = await connectToDatabase();
  const currentBookings = loadBookings();
  const idx = currentBookings.findIndex(
    (b) => b.bookingCode.toUpperCase() === cleanCode || b._id.toUpperCase() === cleanCode
  );

  if (idx === -1) {
    if (isConnected) {
      try {
        const dbBooking = await BookingModel.findOne({
          $or: [{ bookingCode: cleanCode }, { _id: cleanCode }],
        });
        if (!dbBooking) {
          return {
            success: false,
            message: 'Kode tiket TIDAK DITEMUKAN! Mohon periksa kembali kode tiket.',
          };
        }
        if (dbBooking.status === 'CHECKED_IN') {
          return {
            success: false,
            alreadyCheckedIn: true,
            booking: JSON.parse(JSON.stringify(dbBooking)),
            message: `PERINGATAN: Tiket sudah digunakan untuk Check-in pada ${
              dbBooking.checkedInAt
                ? new Date(dbBooking.checkedInAt).toLocaleString('id-ID')
                : 'sebelumnya'
            }!`,
          };
        }
        if (dbBooking.status === 'CANCELLED') {
          return {
            success: false,
            booking: JSON.parse(JSON.stringify(dbBooking)),
            message: 'Tiket ini berstatus DIBATALKAN dan tidak berlaku.',
          };
        }
        dbBooking.status = 'CHECKED_IN';
        dbBooking.checkedInAt = new Date().toISOString();
        await dbBooking.save();
        return {
          success: true,
          booking: JSON.parse(JSON.stringify(dbBooking)),
          message: 'CHECK-IN BERHASIL! Tiket valid, persilakan pengunjung masuk ke venue.',
        };
      } catch {
        // continue
      }
    }
    return {
      success: false,
      message: 'Kode tiket TIDAK DITEMUKAN! Mohon periksa kembali kode tiket.',
    };
  }

  const booking = currentBookings[idx];
  if (booking.status === 'CHECKED_IN') {
    return {
      success: false,
      alreadyCheckedIn: true,
      booking,
      message: `PERINGATAN: Tiket ini sudah pernah di-check-in sebelumnya pada ${
        booking.checkedInAt
          ? new Date(booking.checkedInAt).toLocaleString('id-ID')
          : 'sebelumnya'
      }!`,
    };
  }

  if (booking.status === 'CANCELLED') {
    return {
      success: false,
      booking,
      message: 'Tiket ini berstatus DIBATALKAN dan tidak berlaku.',
    };
  }

  const checkInTime = new Date().toISOString();
  booking.status = 'CHECKED_IN';
  booking.checkedInAt = checkInTime;
  currentBookings[idx] = booking;
  saveBookings(currentBookings);

  if (isConnected) {
    try {
      await BookingModel.findOneAndUpdate(
        { $or: [{ bookingCode: cleanCode }, { _id: booking._id }] },
        { $set: { status: 'CHECKED_IN', checkedInAt: checkInTime } }
      );
    } catch (err) {
      console.warn('Failed to update check-in in MongoDB:', err);
    }
  }

  return {
    success: true,
    booking,
    message: 'CHECK-IN BERHASIL! Tiket valid, persilakan pengunjung masuk ke venue.',
  };
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function findUserByEmail(email: string): Promise<IUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const user = await UserModel.findOne({ email: cleanEmail }).lean();
      if (user) {
        return JSON.parse(JSON.stringify(user));
      }

      // If demo account not yet in MongoDB, auto-insert it
      const defaultDemo = loadUsers().find((u) => u.email.toLowerCase() === cleanEmail);
      if (defaultDemo) {
        try {
          await UserModel.create(defaultDemo);
        } catch {
          // ignore duplicate
        }
        return JSON.parse(JSON.stringify(defaultDemo));
      }
    } catch {
      // fallback
    }
  }

  const found = loadUsers().find((u) => u.email.toLowerCase() === cleanEmail);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

export async function findUserById(id: string): Promise<IUserSafe | null> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const user = await UserModel.findById(id).lean();
      if (user) {
        return toSafeUser(JSON.parse(JSON.stringify(user)));
      }
    } catch {
      // fallback
    }
  }

  const found = loadUsers().find((u) => u._id === id);
  return found ? toSafeUser(JSON.parse(JSON.stringify(found))) : null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  phone?: string;
  identityNumber?: string;
}): Promise<IUserSafe> {
  const { hash, salt } = hashPassword(data.password);
  const newUser: IUser = {
    _id: `usr-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    role: data.role || 'user',
    phone: data.phone?.trim() || '',
    identityNumber: data.identityNumber?.trim() || '',
    avatar: '',
    bio: '',
    savedEventIds: [],
    createdAt: new Date().toISOString(),
  };

  const { isConnected } = await connectToDatabase();
  if (isConnected) {
    try {
      const created = await UserModel.create(newUser);
      // save to disk as well
      const users = loadUsers();
      saveUsers([newUser, ...users.filter((u) => u.email !== newUser.email)]);
      return toSafeUser(JSON.parse(JSON.stringify(created)));
    } catch (err) {
      console.warn('Failed to insert user into MongoDB, saving to disk:', err);
    }
  }

  const currentUsers = loadUsers();
  saveUsers([newUser, ...currentUsers.filter((u) => u.email !== newUser.email)]);
  return toSafeUser(newUser);
}

export async function updateUserProfile(
  id: string,
  updates: {
    name?: string;
    phone?: string;
    identityNumber?: string;
    avatar?: string;
    bio?: string;
    password?: string;
  }
): Promise<IUserSafe | null> {
  const updateData: Partial<IUser> = {};
  if (updates.name) updateData.name = updates.name.trim();
  if (updates.phone !== undefined) updateData.phone = updates.phone.trim();
  if (updates.identityNumber !== undefined) updateData.identityNumber = updates.identityNumber.trim();
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar.trim();
  if (updates.bio !== undefined) updateData.bio = updates.bio.trim();
  if (updates.password) {
    const { hash, salt } = hashPassword(updates.password);
    updateData.passwordHash = hash;
    updateData.passwordSalt = salt;
  }

  const { isConnected } = await connectToDatabase();
  if (isConnected) {
    try {
      const updated = await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true }
      ).lean();
      if (updated) {
        // sync disk
        const currentUsers = loadUsers();
        const uIdx = currentUsers.findIndex((u) => u._id === id);
        if (uIdx !== -1) {
          currentUsers[uIdx] = { ...currentUsers[uIdx], ...updateData };
          saveUsers(currentUsers);
        }
        return toSafeUser(JSON.parse(JSON.stringify(updated)));
      }
    } catch {
      // fallback
    }
  }

  const currentUsers = loadUsers();
  const userIdx = currentUsers.findIndex((u) => u._id === id);
  if (userIdx !== -1) {
    currentUsers[userIdx] = { ...currentUsers[userIdx], ...updateData };
    saveUsers(currentUsers);
    return toSafeUser(currentUsers[userIdx]);
  }
  return null;
}

export async function toggleSavedEvent(userId: string, eventId: string): Promise<string[]> {
  const { isConnected } = await connectToDatabase();
  if (isConnected) {
    try {
      const user = await UserModel.findOne({ _id: userId });
      if (user) {
        if (!user.savedEventIds) user.savedEventIds = [];
        const exists = user.savedEventIds.includes(eventId);
        if (exists) {
          user.savedEventIds = user.savedEventIds.filter((id: string) => id !== eventId);
        } else {
          user.savedEventIds.push(eventId);
        }
        await user.save();

        // sync disk
        const users = loadUsers();
        const idx = users.findIndex((u) => u._id === userId);
        if (idx !== -1) {
          users[idx].savedEventIds = user.savedEventIds;
          saveUsers(users);
        }

        return user.savedEventIds;
      }
    } catch {
      // fallback
    }
  }

  const users = loadUsers();
  const user = users.find((u) => u._id === userId);
  if (user) {
    if (!user.savedEventIds) user.savedEventIds = [];
    const exists = user.savedEventIds.includes(eventId);
    if (exists) {
      user.savedEventIds = user.savedEventIds.filter((id) => id !== eventId);
    } else {
      user.savedEventIds.push(eventId);
    }
    saveUsers(users);
    return [...user.savedEventIds];
  }
  return [];
}
