'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { IEvent, IBooking } from '@/lib/types';
import AuthModal from '@/components/AuthModal';
import AdminEditEventModal from '@/components/AdminEditEventModal';
import AdminCreateTab from '@/components/admin/AdminCreateTab';
import AdminEventsTab from '@/components/admin/AdminEventsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminCheckInTab from '@/components/admin/AdminCheckInTab';
import { showConfirmDialog, showSuccessAlert, showErrorAlert, showToastAlert } from '@/lib/alerts';
import Link from 'next/link';
import {
  Ticket,
  PlusCircle,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  Sun,
  Moon,
  Home,
  LogOut,
  Sparkles,
  TrendingUp,
  ScanLine,
} from 'lucide-react';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout, openAuthModal } = useAuth();
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
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <ShieldAlert size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.65rem' }}>
              Area Terbatas (Promotor/Admin)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Halaman ini diperuntukkan secara eksklusif bagi Promotor dan Administrator Ticketify untuk mengelola jadwal konser, kuota tiket, dan laporan penjualan.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => openAuthModal('login')}
                className="btn-primary"
                style={{ height: '42px', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                Masuk Akun Admin
              </button>
              <Link
                href="/"
                className="btn-secondary"
                style={{ height: '42px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          {/* TAB 1: BUAT EVENT BARU */}
          {activeTab === 'create' && (
            <AdminCreateTab
              organizerName={user?.name}
              showToast={showToast}
              onCreated={() => {
                fetchAllEvents();
                setTab('events');
              }}
            />
          )}

          {/* TAB 2: KELOLA KONSER & EVENT */}
          {activeTab === 'events' && (
            <AdminEventsTab
              events={events}
              eventsLoading={eventsLoading}
              eventSearch={eventSearch}
              setEventSearch={setEventSearch}
              deletingId={deletingId}
              onEditEvent={(evt) => setEditingEvent(evt)}
              onDeleteEvent={handleDeleteEvent}
              onRefresh={fetchAllEvents}
              onSwitchToCreate={() => setTab('create')}
            />
          )}

          {/* TAB 3: DATA PENJUALAN TIKET */}
          {activeTab === 'orders' && (
            <AdminOrdersTab
              bookings={bookings}
              ordersLoading={ordersLoading}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              totalRevenue={totalRevenue}
              totalTicketsSold={totalTicketsSold}
              totalOrders={totalOrders}
              onExportCSV={handleExportCSV}
              onRefresh={fetchAllBookings}
              onOpenCheckIn={(code) => {
                setScanCode(code);
                setTab('checkin');
                handleExecuteCheckIn(code);
              }}
            />
          )}

          {/* TAB 4: GATE CHECK-IN SIMULATOR */}
          {activeTab === 'checkin' && (
            <AdminCheckInTab
              bookings={bookings}
              scanCode={scanCode}
              setScanCode={setScanCode}
              scanLoading={scanLoading}
              scanResult={scanResult}
              onExecuteCheckIn={handleExecuteCheckIn}
            />
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
