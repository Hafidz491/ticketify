'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { IEvent, TicketTier, IBooking } from '@/lib/types';
import AuthModal from '@/components/AuthModal';
import AdminEditEventModal from '@/components/AdminEditEventModal';
import { showConfirmDialog, showSuccessAlert, showErrorAlert, showToastAlert } from '@/lib/alerts';
import { SEATING_PRESETS } from '@/lib/seatingPresets';
import Link from 'next/link';
import {
  Ticket,
  PlusCircle,
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Trash2,
  ExternalLink,
  Shield,
  ShieldAlert,
  Sun,
  Moon,
  Home,
  LogOut,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Eye,
  RefreshCw,
  Edit3,
  Check,
  Compass,
  FileSpreadsheet,
  ScanLine,
  QrCode,
  UserCheck,
  Download,
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Stadion GBK Night', url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Jazz Festival Live', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'EDM Stage Lights', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rock Band Crowd', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Orchestra Hall', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Indie Sunset Acoustic', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
];

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout, openAuthModal, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const tabParam = searchParams.get('tab') || 'create';
  const [activeTab, setActiveTab] = useState<'create' | 'events' | 'orders' | 'checkin'>('create');

  useEffect(() => {
    if (tabParam === 'events' || tabParam === 'orders' || tabParam === 'create' || tabParam === 'checkin') {
      setActiveTab(tabParam as 'create' | 'events' | 'orders' | 'checkin');
    } else {
      setActiveTab('create');
    }
  }, [tabParam]);

  // Ensure admin dashboard is always completely scrollable
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.classList.remove('modal-open');
  }, []);

  const setTab = (tab: 'create' | 'events' | 'orders' | 'checkin') => {
    setActiveTab(tab);
    router.replace(`/admin?tab=${tab}`);
  };

  // State for Gate Check-in Simulator
  const [scanCode, setScanCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    alreadyCheckedIn?: boolean;
    booking?: IBooking;
  } | null>(null);

  // State for events management
  const [events, setEvents] = useState<IEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);

  // State for orders / bookings
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Form State for creating new concert
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<IEvent['category']>('Concert');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30 WIB');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Jakarta');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [seatingImage, setSeatingImage] = useState(SEATING_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [lineupText, setLineupText] = useState('');
  const [termsText, setTermsText] = useState('Wajib membawa kartu identitas diri resmi.\nTiket tidak dapat di-refund atau dipindahtangankan tanpa izin.');
  const [submitting, setSubmitting] = useState(false);

  // Ticket Tiers for new concert
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      id: 'tier-init-1',
      name: 'Festival Regular (Standing)',
      price: 650000,
      quota: 1500,
      available: 1500,
      perks: ['Akses area festival depan panggung', 'Free gelang festival'],
    },
    {
      id: 'tier-init-2',
      name: 'VIP Front Row Experience',
      price: 1850000,
      quota: 300,
      available: 300,
      perks: ['Akses area khusus terdepan panggung', 'Lounge VIP ber-AC', 'Official Merch T-Shirt'],
    },
  ]);

  // Fetch all events for management
  const fetchAllEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await fetch('/api/events', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching admin events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch all orders / bookings
  const fetchAllBookings = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/bookings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAllEvents();
      fetchAllBookings();
    }
  }, [user]);

  // Handle tier changes in form
  const handleUpdateTier = (index: number, field: keyof TicketTier, value: any) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      name: `Kategori Tiket ${tiers.length + 1}`,
      price: 500000,
      quota: 500,
      available: 500,
      perks: ['Akses konser resmi'],
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) {
      showToast('Minimal harus ada 1 kategori tiket');
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // Handle Create Event Submit
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !venue.trim() || !date) {
      showToast('Harap lengkapi semua kolom wajib bintang (*)');
      return;
    }

    try {
      setSubmitting(true);
      const lineup = lineupText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (lineup.length === 0) lineup.push(artist.trim());

      const terms = termsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        category,
        date,
        time: time.trim(),
        venue: venue.trim(),
        city: city.trim(),
        image: image.trim(),
        seatingImage: seatingImage.trim() || SEATING_PRESETS[0].url,
        description: description.trim() || 'Pertunjukan musik eksklusif dan spektakuler.',
        isFeatured,
        lineup,
        terms,
        ticketTiers: tiers.map((t) => ({
          ...t,
          available: Number(t.quota),
          price: Number(t.price),
          quota: Number(t.quota),
        })),
        organizer: user?.name || 'Promotor Ticketify',
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menerbitkan event');
      }

      await showSuccessAlert({
        title: 'Konser Berhasil Diterbitkan! 🎉',
        text: `Konser "${data.event.title}" telah aktif dan siap dipesan oleh penonton.`,
      });

      // Reset form
      setTitle('');
      setArtist('');
      setVenue('');
      setDate('');
      setDescription('');
      setSeatingImage(SEATING_PRESETS[0].url);
      fetchAllEvents();
      // Switch to events list
      setTab('events');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      await showErrorAlert({
        title: 'Gagal Menerbitkan Konser',
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Event Deletion
  const handleDeleteEvent = async (id: string, eventTitle: string) => {
    const confirmDelete = await showConfirmDialog({
      title: 'Hapus Konser?',
      text: `Apakah Anda yakin ingin menghapus konser "${eventTitle}"? Tindakan ini akan menghapus data konser secara permanen dari sistem.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDestructive: true,
    });
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await showSuccessAlert({
          title: 'Konser Berhasil Dihapus',
          text: `Konser "${eventTitle}" telah dihapus dari sistem.`,
          timer: 2500,
        });
        setEvents((prev) => prev.filter((e) => e._id !== id && e.slug !== id));
      } else {
        await showErrorAlert({
          title: 'Gagal Menghapus Konser',
          text: data.error || 'Terjadi kesalahan saat menghapus konser.',
        });
      }
    } catch {
      await showErrorAlert({
        title: 'Gagal Menghapus Konser',
        text: 'Terjadi kesalahan pada jaringan atau server.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Export Sales Report to CSV/Excel
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('Belum ada data transaksi untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'Kode Booking',
      'Tanggal Pesan',
      'Nama Konser',
      'Kategori Tiket',
      'Jumlah Tiket',
      'Nama Pembeli',
      'Email Pembeli',
      'No WhatsApp',
      'NIK Pembeli',
      'Metode Pembayaran',
      'Subtotal (Rp)',
      'Biaya Layanan (Rp)',
      'Diskon Voucher (Rp)',
      'Kode Voucher',
      'Total Bayar (Rp)',
      'Status Tiket',
      'Waktu Check-In',
    ];

    const rows = bookings.map((b, index) => [
      index + 1,
      `"${b.bookingCode}"`,
      `"${new Date(b.createdAt).toLocaleString('id-ID')}"`,
      `"${(b.eventTitle || '').replace(/"/g, '""')}"`,
      `"${(b.tierName || '').replace(/"/g, '""')}"`,
      b.quantity,
      `"${(b.buyer.fullName || '').replace(/"/g, '""')}"`,
      `"${b.buyer.email}"`,
      `"${b.buyer.phoneNumber}"`,
      `'${b.buyer.identityNumber}`,
      `"${b.paymentMethod}"`,
      b.unitPrice * b.quantity,
      b.serviceFee || 15000,
      b.discountAmount || 0,
      `"${b.promoCode || '-'}"`,
      b.totalPrice,
      `"${b.status}"`,
      `"${b.checkedInAt ? new Date(b.checkedInAt).toLocaleString('id-ID') : '-'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan-Penjualan-Ticketify-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToastAlert('Laporan penjualan Excel/CSV berhasil diunduh!', 'success');
  };

  // Gate Check-in Simulator Handler
  const handleExecuteCheckIn = async (codeToUse?: string) => {
    const targetCode = (codeToUse || scanCode).trim();
    if (!targetCode) {
      showToast('Masukkan kode tiket terlebih dahulu.');
      return;
    }

    setScanLoading(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/bookings/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode: targetCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult({
          success: true,
          message: data.message,
          booking: data.booking,
        });
        showToastAlert('Check-in Berhasil! Pengunjung dipersilakan masuk.', 'success');
        fetchAllBookings();
      } else {
        setScanResult({
          success: false,
          message: data.error || 'Check-in gagal diproses.',
          alreadyCheckedIn: data.alreadyCheckedIn,
          booking: data.booking,
        });
        if (data.alreadyCheckedIn) {
          showToastAlert('PERINGATAN: Tiket sudah pernah di-check-in sebelumnya!', 'warning');
        } else {
          showToastAlert(data.error || 'Tiket tidak valid.', 'error');
        }
      }
    } catch {
      setScanResult({
        success: false,
        message: 'Gagal terhubung ke server untuk validasi check-in.',
      });
      showToastAlert('Terjadi gangguan jaringan saat validasi.', 'error');
    } finally {
      setScanLoading(false);
    }
  };

  // Check Auth Loading
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            className="btn-primary"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memverifikasi hak akses Admin...</p>
        </div>
      </div>
    );
  }

  // ACCESS GUARD: If not logged in OR role is not admin
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
        <header
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>ticketify</span>
          </Link>
          <button onClick={toggleTheme} className="btn-icon">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div
            style={{
              maxWidth: '460px',
              textAlign: 'center',
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                margin: '0 auto 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={30} />
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontSize: '0.72rem',
                fontWeight: 700,
                marginBottom: '0.6rem',
              }}
            >
              Akses Khusus Admin & Promotor
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.6rem' }}>
              Area Terbatas (Admin Only)
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Fitur <strong>Buat Event</strong> dan <strong>Kelola Konser</strong> hanya dapat diakses oleh akun Admin / Promotor. Silakan masuk menggunakan akun Admin.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Quick 1-click admin demo button */}
              <button
                type="button"
                onClick={async () => {
                  const res = await login('admin@ticketify.com', 'admin123', 'admin');
                  if (res.success) {
                    showToast('Berhasil login sebagai Admin Ticketify!');
                  }
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '42px',
                  justifyContent: 'center',
                  backgroundColor: '#0f172a',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={15} />
                <span>1-Klik Masuk Sebagai Demo Admin</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="btn-secondary"
                style={{ width: '100%', height: '42px', justifyContent: 'center' }}
              >
                Pilih Akun Lain
              </button>

              <Link
                href="/"
                className="btn-ghost"
                style={{ width: '100%', height: '38px', justifyContent: 'center', textDecoration: 'none', fontSize: '0.82rem' }}
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  // Calculated Stats for Admin
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalTicketsSold = bookings.reduce((acc, b) => acc + (b.quantity || 0), 0);
  const totalOrders = bookings.length;

  const filteredEvents = eventSearch.trim()
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
          e.artist.toLowerCase().includes(eventSearch.toLowerCase()) ||
          e.city.toLowerCase().includes(eventSearch.toLowerCase())
      )
    : events;

  const filteredBookings = orderSearch.trim()
    ? bookings.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(orderSearch.toLowerCase()) ||
          b.buyer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
          b.buyer.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
          b.eventTitle.toLowerCase().includes(orderSearch.toLowerCase())
      )
    : bookings;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Toast Feedback */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.84rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          <Sparkles size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={16} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              ticketify
            </span>
          </Link>
          <span style={{ color: 'var(--border-hover)', fontSize: '0.9rem' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#0284c7',
                fontWeight: 700,
              }}
            >
              ADMIN PORTAL
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }} className="hide-on-mobile">
              Dashboard Promotor
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            href="/"
            className="btn-secondary"
            style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.85rem', gap: '0.4rem', textDecoration: 'none' }}
          >
            <Home size={14} />
            <span className="hide-on-mobile">Lihat Web Publik</span>
          </Link>

          <button onClick={toggleTheme} className="btn-icon" style={{ width: '34px', height: '34px' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="btn-secondary"
            style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.75rem', gap: '0.35rem', color: '#ef4444' }}
            title="Keluar dari akun admin"
          >
            <LogOut size={14} />
            <span className="hide-on-mobile">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Admin Layout Container */}
      <div
        style={{
          flex: 1,
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem',
          display: 'flex',
          gap: '1.5rem',
        }}
        className="dashboard-grid-wrapper"
      >
        {/* Left Sidebar Navigation */}
        <aside style={{ width: '250px', flexShrink: 0 }} className="dashboard-sidebar">
          {/* Admin Mini Profile */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                border: '1px solid rgba(56, 189, 248, 0.35)',
                flexShrink: 0,
              }}
            >
              <Shield size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.66rem',
                  color: '#0284c7',
                  marginTop: '0.25rem',
                  fontWeight: 600,
                }}
              >
                <span>Promotor Resmi</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <button
              onClick={() => setTab('create')}
              className={`dashboard-nav-item ${activeTab === 'create' ? 'active' : ''}`}
            >
              <PlusCircle size={16} />
              <span>Buat Event Baru</span>
            </button>

            <button
              onClick={() => setTab('events')}
              className={`dashboard-nav-item ${activeTab === 'events' ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Kelola Konser</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: activeTab === 'events' ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface-elevated)',
                    color: activeTab === 'events' ? 'var(--text-inverse)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  {events.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setTab('orders')}
              className={`dashboard-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <TrendingUp size={16} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Penjualan Tiket</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: activeTab === 'orders' ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface-elevated)',
                    color: activeTab === 'orders' ? 'var(--text-inverse)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  {bookings.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setTab('checkin')}
              className={`dashboard-nav-item ${activeTab === 'checkin' ? 'active' : ''}`}
            >
              <ScanLine size={16} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Gate Check-In</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: activeTab === 'checkin' ? 'rgba(0,0,0,0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: activeTab === 'checkin' ? 'var(--text-inverse)' : '#10b981',
                    fontWeight: 800,
                  }}
                >
                  SCANNER
                </span>
              </div>
            </button>
          </nav>

          {/* Quick Summary Card */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Total Penjualan
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {totalTicketsSold} tiket terjual dari {totalOrders} transaksi
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Tabs */}
        <div className="dashboard-mobile-tabs" style={{ display: 'none', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <button onClick={() => setTab('create')} className={`btn-secondary ${activeTab === 'create' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Buat Event
            </button>
            <button onClick={() => setTab('events')} className={`btn-secondary ${activeTab === 'events' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Kelola Event ({events.length})
            </button>
            <button onClick={() => setTab('orders')} className={`btn-secondary ${activeTab === 'orders' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Penjualan ({bookings.length})
            </button>
            <button onClick={() => setTab('checkin')} className={`btn-secondary ${activeTab === 'checkin' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Gate Check-In
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* TAB 1: BUAT EVENT BARU (CREATE EVENT FORM) */}
          {activeTab === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.3rem' }}>
                  <Shield size={14} />
                  <span>FORM INPUT KONSER ADMIN</span>
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
                  Input & Terbitkan Konser Baru
                </h1>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Tambahkan konser atau festival musik terbaru. Konser yang diterbitkan akan langsung muncul di halaman eksplorasi dan dapat dipesan oleh pengguna.
                </p>
              </div>

              {/* Event Creation Form */}
              <form
                onSubmit={handleCreateEvent}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                {/* 1. Basic Information */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    1. Informasi Utama Acara
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Nama Konser / Acara *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bruno Mars Live in Jakarta 2026"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Artis / Musisi Utama *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bruno Mars"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Kategori Acara *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem', color: 'var(--text-primary)' }}
                      >
                        <option value="Concert">Concert</option>
                        <option value="Festival">Festival</option>
                        <option value="Theater">Theater</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Conference">Conference</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Jadikan Konser Unggulan (Hero Banner)
                      </label>
                      <div style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isFeatured" style={{ fontSize: '0.84rem', cursor: 'pointer' }}>
                          Tampilkan di Banner Utama (Featured)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Date, Time & Location */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    2. Waktu & Lokasi
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Tanggal Acara *
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Waktu Mulai *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 19:30 WIB"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Nama Tempat / Venue *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Stadion Madya GBK Senayan"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Kota *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Jakarta"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Poster Image & Presets */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    3. Gambar Poster Konser
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        URL Gambar Poster *
                      </label>
                      <input
                        type="url"
                        required
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
                      />
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                        Atau pilih gambar preset beresolusi tinggi:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {PRESET_IMAGES.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImage(p.url)}
                            className="btn-secondary"
                            style={{
                              height: '28px',
                              fontSize: '0.72rem',
                              padding: '0 0.65rem',
                              backgroundColor: image === p.url ? 'var(--text-primary)' : undefined,
                              color: image === p.url ? 'var(--text-inverse)' : undefined,
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {image && (
                      <div style={{ marginTop: '0.5rem', width: '220px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Seating Chart Selection */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    4. Gambar Denah Kursi &amp; Tata Panggung (Seating Chart)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Pilih layout denah kursi konser di bawah ini agar penonton dan promotor dapat melihat tata panggung dengan jelas.
                  </p>

                  {/* Preset Seating Diagrams Grid */}
                  <div className="responsive-seating-grid" style={{ marginBottom: '1rem' }}>
                    {SEATING_PRESETS.map((preset) => {
                      const isSelected = seatingImage === preset.url;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setSeatingImage(preset.url)}
                          style={{
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                            backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                          }}
                        >
                          <div style={{ height: '110px', width: '100%', backgroundColor: '#090d16', overflow: 'hidden' }}>
                            <img
                              src={preset.url}
                              alt={preset.label}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>

                          <div style={{ padding: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: 'var(--radius-pill)',
                                  backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                                  fontWeight: 700,
                                }}
                              >
                                {preset.type}
                              </span>

                              {isSelected && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <Check size={13} />
                                  <span>Dipilih</span>
                                </span>
                              )}
                            </div>

                            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                              {preset.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                              {preset.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom URL Input & Live Preview */}
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        URL Denah Kursi Terpilih (atau Kustom)
                      </label>
                      <input
                        type="text"
                        value={seatingImage}
                        onChange={(e) => setSeatingImage(e.target.value)}
                        placeholder="/seating/... atau https://..."
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-glass-input)',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        width: '160px',
                        height: '100px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#090d16',
                        border: '1px solid var(--border-default)',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={seatingImage || SEATING_PRESETS[0].url}
                        alt="Preview Denah"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Ticket Tiers & Pricing */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      5. Kategori Tiket, Harga &amp; Kuota
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="btn-secondary"
                      style={{ height: '30px', fontSize: '0.76rem', gap: '0.35rem' }}
                    >
                      <Plus size={13} />
                      <span>Tambah Kategori</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {tiers.map((tier, idx) => (
                      <div
                        key={tier.id}
                        className="responsive-tier-row-create"
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                            Nama Kategori
                          </label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                            placeholder="Contoh: CAT 1 (Numbered Seating)"
                            style={{ width: '100%', height: '36px', padding: '0 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.8rem' }}
                          />
                        </div>

                        <div className="responsive-tier-subgrid">
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                              Harga (Rp)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="10000"
                              value={tier.price}
                              onChange={(e) => handleUpdateTier(idx, 'price', Number(e.target.value))}
                              style={{ width: '100%', height: '36px', padding: '0 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.8rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                              Kuota Tiket
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={tier.quota}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleUpdateTier(idx, 'quota', val);
                                handleUpdateTier(idx, 'available', val);
                              }}
                              style={{ width: '100%', height: '36px', padding: '0 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.8rem' }}
                            />
                          </div>
                        </div>

                        <div className="responsive-tier-action-row">
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', color: '#ef4444' }}
                            title="Hapus Kategori Tiket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Description & Rules */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    6. Deskripsi &amp; Syarat Ketentuan
                  </h3>

                  <div className="responsive-two-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Deskripsi Konser
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Deskripsikan pengalaman konser yang akan dinikmati penonton..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.82rem', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Syarat & Ketentuan Masuk (Pisahkan per baris)
                      </label>
                      <textarea
                        rows={4}
                        value={termsText}
                        onChange={(e) => setTermsText(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.82rem', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ height: '44px', padding: '0 2rem', fontSize: '0.9rem', gap: '0.5rem', fontWeight: 700 }}
                  >
                    {submitting ? (
                      <span>Menerbitkan Konser...</span>
                    ) : (
                      <>
                        <PlusCircle size={16} />
                        <span>Terbitkan Konser Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: KELOLA KONSER & EVENT (MANAGE EVENTS) */}
          {activeTab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daftar Konser & Event Terdaftar</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Kelola ketersediaan tiket konser, pantau sisa kuota, atau hapus konser.
                  </p>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '240px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Cari konser atau artis..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      style={{ width: '100%', height: '34px', paddingLeft: '2rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-glass-input)' }}
                    />
                  </div>
                  <button onClick={fetchAllEvents} className="btn-secondary" style={{ height: '34px', fontSize: '0.78rem', gap: '0.35rem' }}>
                    <RefreshCw size={13} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {eventsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Memuat daftar konser...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
                  <Ticket size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Tidak ada konser yang ditemukan.</p>
                  <button onClick={() => setTab('create')} className="btn-primary" style={{ height: '36px', fontSize: '0.82rem' }}>
                    Buat Event Baru
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredEvents.map((evt) => {
                    const totalQuota = evt.ticketTiers.reduce((acc, t) => acc + (t.quota || 0), 0);
                    const totalAvailable = evt.ticketTiers.reduce((acc, t) => acc + (t.available || 0), 0);
                    const totalSold = totalQuota - totalAvailable;

                    return (
                      <div
                        key={evt._id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.35rem 1.5rem',
                          display: 'flex',
                          gap: '1.35rem',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <img
                          src={evt.image}
                          alt={evt.title}
                          style={{ width: '130px', height: '92px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                        />

                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {evt.category}
                            </span>
                            {evt.isFeatured && (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 700 }}>
                                FEATURED
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, lineHeight: 1.35, marginBottom: '0.45rem' }}>
                            {evt.title}
                          </h3>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.15rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Calendar size={13} />
                              {evt.date} ({evt.time})
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MapPin size={13} />
                              {evt.venue}, {evt.city}
                            </span>
                          </div>

                          {/* Quota bar */}
                          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ flex: 1, height: '7px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, Math.round((totalSold / (totalQuota || 1)) * 100))}%`,
                                  backgroundColor: '#10b981',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                              {totalAvailable} sisa dari {totalQuota} tiket
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => setEditingEvent(evt)}
                            className="btn-primary"
                            style={{ height: '36px', fontSize: '0.8rem', padding: '0 1rem', gap: '0.45rem', borderRadius: 'var(--radius-md)' }}
                            title="Lihat detail lengkap dan ubah data konser"
                          >
                            <Edit3 size={14} />
                            <span>Detail & Edit</span>
                          </button>

                          <Link
                            href="/"
                            className="btn-secondary"
                            style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.95rem', gap: '0.45rem', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}
                          >
                            <Eye size={14} />
                            <span>Lihat di Web</span>
                          </Link>

                          <button
                            onClick={() => handleDeleteEvent(evt._id, evt.title)}
                            disabled={deletingId === evt._id}
                            className="btn-secondary"
                            style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.95rem', gap: '0.45rem', color: '#ef4444', borderRadius: 'var(--radius-md)' }}
                          >
                            <Trash2 size={14} />
                            <span>{deletingId === evt._id ? 'Menghapus...' : 'Hapus Event'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATA PENJUALAN TIKET (ORDERS & SALES) */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Data Penjualan & Transaksi Tiket</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Seluruh pemesanan tiket resmi dari seluruh pengguna Ticketify.
                </p>
              </div>

              {/* KPI Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="kpi-grid">
                <div className="dashboard-stat-card">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Pendapatan</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Lunas & terverifikasi
                  </div>
                </div>

                <div className="dashboard-stat-card">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tiket Terjual</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>
                    {totalTicketsSold} Tiket
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Dari seluruh konser aktif
                  </div>
                </div>

                <div className="dashboard-stat-card">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Transaksi</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>
                    {totalOrders} Pesanan
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Invoice pesanan terbit
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              {/* Search Bar & Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Cari kode booking, nama pembeli, konser..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ width: '100%', height: '34px', paddingLeft: '2rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-glass-input)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={handleExportCSV}
                    className="btn-primary"
                    style={{
                      height: '34px',
                      fontSize: '0.78rem',
                      gap: '0.45rem',
                      backgroundColor: '#10b981',
                      border: 'none',
                    }}
                    title="Unduh seluruh data penjualan ke format Excel / CSV"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Ekspor Laporan (Excel)</span>
                  </button>

                  <button onClick={fetchAllBookings} className="btn-secondary" style={{ height: '34px', fontSize: '0.78rem', gap: '0.35rem' }}>
                    <RefreshCw size={13} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Memuat data pesanan...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Belum ada data transaksi yang cocok.</p>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Kode Booking</th>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Pembeli & Kontak</th>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Konser & Kategori</th>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Qty</th>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Total Bayar</th>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                          <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b) => (
                          <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 700 }}>
                              {b.bookingCode}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.buyer.fullName}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{b.buyer.email}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.buyer.phoneNumber}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {b.eventTitle}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {b.tierName}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                              {b.quantity}x
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                              <div>Rp {b.totalPrice.toLocaleString('id-ID')}</div>
                              {b.discountAmount ? (
                                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                                  Hemat Rp {b.discountAmount.toLocaleString('id-ID')} ({b.promoCode})
                                </div>
                              ) : null}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {b.status === 'CHECKED_IN' ? (
                                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', fontWeight: 700 }}>
                                  CHECKED-IN
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                                  CONFIRMED
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setScanCode(b.bookingCode);
                                  setTab('checkin');
                                  handleExecuteCheckIn(b.bookingCode);
                                }}
                                className="btn-secondary"
                                style={{ height: '30px', fontSize: '0.74rem', padding: '0 0.65rem', gap: '0.35rem' }}
                                title="Buka di Gate Check-in"
                              >
                                <ScanLine size={12} />
                                <span>Check-In</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GATE CHECK-IN SIMULATOR (VALIDASI & SCANNER GERBANG) */}
          {activeTab === 'checkin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  Scanner & Validasi Tiket Masuk (Gate Check-In)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Periksa keaslian tiket konser di pintu masuk dan cegah tiket ganda/duplikat secara real-time.
                </p>
              </div>

              {/* Scanner Control Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ScanLine size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                      Input atau Scan Kode Tiket
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Masukkan kode tiket pengunjung (misal: TCK-782914)
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleExecuteCheckIn();
                  }}
                  style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
                >
                  <input
                    type="text"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: TCK-782914"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      height: '46px',
                      padding: '0 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontFamily: 'monospace',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={scanLoading || !scanCode.trim()}
                    className="btn-primary"
                    style={{
                      height: '46px',
                      padding: '0 1.5rem',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      gap: '0.5rem',
                    }}
                  >
                    <ScanLine size={17} />
                    <span>{scanLoading ? 'Memvalidasi...' : 'Verifikasi & Check-In'}</span>
                  </button>
                </form>

                {/* Quick Selection from Recent Bookings */}
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem', fontWeight: 600 }}>
                    Pilih Cepat Tiket Terdaftar untuk Uji Coba:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {bookings.slice(0, 8).map((b) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          setScanCode(b.bookingCode);
                          handleExecuteCheckIn(b.bookingCode);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: b.status === 'CHECKED_IN' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-surface-elevated)',
                          color: b.status === 'CHECKED_IN' ? '#a855f7' : 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                        title={`Status: ${b.status} - ${b.buyer.fullName}`}
                      >
                        {b.bookingCode} {b.status === 'CHECKED_IN' ? '✓ (Sudah Masuk)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scan / Validation Result Card */}
              {scanResult && (
                <div
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    backgroundColor: scanResult.success
                      ? 'rgba(16, 185, 129, 0.08)'
                      : scanResult.alreadyCheckedIn
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(239, 68, 68, 0.08)',
                    border: scanResult.success
                      ? '1.5px solid #10b981'
                      : scanResult.alreadyCheckedIn
                      ? '1.5px solid #f59e0b'
                      : '1.5px solid #ef4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {scanResult.success ? (
                      <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                    ) : (
                      <AlertCircle
                        size={24}
                        style={{
                          color: scanResult.alreadyCheckedIn ? '#f59e0b' : '#ef4444',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          margin: 0,
                          color: scanResult.success
                            ? '#10b981'
                            : scanResult.alreadyCheckedIn
                            ? '#f59e0b'
                            : '#ef4444',
                        }}
                      >
                        {scanResult.success
                          ? 'TIKET VALID — CHECK-IN BERHASIL'
                          : scanResult.alreadyCheckedIn
                          ? 'PERINGATAN: TIKET SUDAH DIGUNAKAN SEBELUMNYA'
                          : 'TIKET TIDAK VALID'}
                      </h3>
                      <p style={{ fontSize: '0.82rem', margin: '0.15rem 0 0', color: 'var(--text-primary)' }}>
                        {scanResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Booking Details if ticket found */}
                  {scanResult.booking && (
                    <div
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        border: '1px solid var(--border-subtle)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                          Konser & Event
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {scanResult.booking.eventTitle}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {scanResult.booking.eventVenue}, {scanResult.booking.eventCity}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                          Nama Pengunjung
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                          {scanResult.booking.buyer.fullName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          NIK: {scanResult.booking.buyer.identityNumber}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                          Kategori Tiket
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-primary)' }}>
                          {scanResult.booking.tierName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {scanResult.booking.quantity} Orang (Pax)
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                          Waktu Check-In
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {scanResult.booking.checkedInAt
                            ? new Date(scanResult.booking.checkedInAt).toLocaleString('id-ID')
                            : new Date().toLocaleString('id-ID')}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            fontWeight: 700,
                          }}
                        >
                          STATUS: CHECKED-IN
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Admin Edit & Detail Modal (Only mounted when opened) */}
      {editingEvent && (
        <AdminEditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={(updated) => {
            setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
            fetchAllEvents();
          }}
        />
      )}

      <AuthModal />

      <style jsx>{`
        /* 1. MONITOR 24" KE ATAS (>= 1680px) */
        @media (min-width: 1680px) {
          .dashboard-grid-wrapper {
            max-width: 1540px !important;
            padding: 2.5rem !important;
          }
        }

        /* 2. LAPTOP 16" (1440px - 1679px) */
        @media (min-width: 1440px) and (max-width: 1679px) {
          .dashboard-grid-wrapper {
            max-width: 1360px !important;
            padding: 2rem !important;
          }
        }

        /* 3. TABLET & MOBILE (< 900px) */
        @media (max-width: 900px) {
          .dashboard-grid-wrapper {
            flex-direction: column !important;
            padding: 1rem !important;
            gap: 1rem !important;
          }
          .dashboard-sidebar {
            display: none !important;
          }
          .dashboard-mobile-tabs {
            display: block !important;
          }
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* 4. COMPACT MOBILE (<= 540px) */
        @media (max-width: 540px) {
          .dashboard-grid-wrapper {
            padding: 0.75rem 0.5rem !important;
          }
          .kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Memuat Dashboard Admin...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
