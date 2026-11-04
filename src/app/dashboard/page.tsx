'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { IBooking, IEvent } from '@/lib/types';
import ETicketModal from '@/components/ETicketModal';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';
import {
  Ticket,
  LayoutDashboard,
  Clock,
  History,
  Bookmark,
  Settings,
  CreditCard,
  LogOut,
  Calendar,
  MapPin,
  QrCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Home,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  User,
  Phone,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  totalTickets: number;
  totalSpent: number;
  upcomingCount: number;
  pastCount: number;
  savedEventsCount: number;
  nextUpcomingBooking: IBooking | null;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, logout, updateProfile, toggleSaveEvent, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'history' | 'wishlist' | 'settings'>('overview');

  useEffect(() => {
    if (tabParam === 'tickets' || tabParam === 'history' || tabParam === 'wishlist' || tabParam === 'settings') {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview');
    }
  }, [tabParam]);

  // Ensure user dashboard is always completely scrollable
  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.classList.remove('modal-open');
  }, []);

  const setTab = (tab: 'overview' | 'tickets' | 'history' | 'wishlist' | 'settings') => {
    setActiveTab(tab);
    router.replace(`/dashboard?tab=${tab}`);
  };

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<IBooking[]>([]);
  const [pastBookings, setPastBookings] = useState<IBooking[]>([]);
  const [savedEvents, setSavedEvents] = useState<IEvent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Filters & Modal
  const [ticketFilter, setTicketFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [historySearch, setHistorySearch] = useState('');
  const [activeETicket, setActiveETicket] = useState<IBooking | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileIdNumber, setProfileIdNumber] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} disalin ke clipboard!`);
  };

  // Fetch Dashboard Stats & User Bookings
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const res = await fetch('/api/user/dashboard-stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setBookings(data.bookings || []);
        setUpcomingBookings(data.upcomingBookings || []);
        setPastBookings(data.pastBookings || []);
        setSavedEvents(data.savedEvents || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileIdNumber(user.identityNumber || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileAlert(null);
    setProfileSaving(true);

    const res = await updateProfile({
      name: profileName,
      phone: profilePhone,
      identityNumber: profileIdNumber,
      bio: profileBio,
      password: profileNewPassword || undefined,
    });

    setProfileSaving(false);
    if (res.success) {
      setProfileAlert({ type: 'success', message: 'Profil akun Anda berhasil diperbarui!' });
      setProfileNewPassword('');
    } else {
      setProfileAlert({ type: 'error', message: res.error || 'Gagal memperbarui profil' });
    }
  };

  const handleRemoveSavedEvent = async (eventId: string) => {
    await toggleSaveEvent(eventId);
    setSavedEvents((prev) => prev.filter((e) => e._id !== eventId && e.slug !== eventId));
    showToast('Event dihapus dari daftar simpanan');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="btn-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat akun Anda...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, prompt login
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--text-primary)', color: 'var(--text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>ticketify</span>
          </Link>
          <button onClick={toggleTheme} className="btn-icon">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: '420px', textAlign: 'center', padding: '2.5rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>Masuk ke Dashboard</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Silakan login atau daftar untuk mengakses tiket konser, barcode QR code, wishlist, dan riwayat pesanan Anda.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => openAuthModal('login')} className="btn-primary" style={{ width: '100%', height: '42px', justifyContent: 'center' }}>
                Masuk ke Akun
              </button>
              <Link href="/" className="btn-secondary" style={{ width: '100%', height: '42px', justifyContent: 'center', textDecoration: 'none' }}>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  const filteredTickets =
    ticketFilter === 'upcoming'
      ? upcomingBookings
      : ticketFilter === 'past'
      ? pastBookings
      : bookings;

  const filteredHistory = historySearch.trim()
    ? bookings.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(historySearch.toLowerCase()) ||
          b.eventTitle.toLowerCase().includes(historySearch.toLowerCase()) ||
          b.tierName.toLowerCase().includes(historySearch.toLowerCase())
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
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dashboard Pengguna</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="btn-primary hide-on-compact-mobile"
              style={{
                height: '34px',
                fontSize: '0.8rem',
                padding: '0 0.85rem',
                gap: '0.4rem',
                textDecoration: 'none',
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
              }}
            >
              <ShieldCheck size={14} />
              <span>Ke Dashboard Admin</span>
            </Link>
          )}

          <Link href="/" className="btn-secondary" style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.85rem', gap: '0.4rem', textDecoration: 'none' }}>
            <Home size={14} />
            <span className="hide-on-mobile">Jelajahi Konser</span>
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
            title="Keluar dari akun"
          >
            <LogOut size={14} />
            <span className="hide-on-mobile">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout Container */}
      <div style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '1.5rem', display: 'flex', gap: '1.5rem' }} className="dashboard-grid-wrapper">
        {/* Left Sidebar Navigation */}
        <aside style={{ width: '250px', flexShrink: 0 }} className="dashboard-sidebar">
          {/* User Profile Mini Card */}
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
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.66rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>
                <ShieldCheck size={11} />
                <span>Akun Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
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
              onClick={() => setTab('overview')}
              className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => setTab('tickets')}
              className={`dashboard-nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
            >
              <Ticket size={16} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tiket Saya</span>
                {upcomingBookings.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: activeTab === 'tickets' ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface-elevated)',
                      color: activeTab === 'tickets' ? 'var(--text-inverse)' : 'var(--text-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {upcomingBookings.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setTab('history')}
              className={`dashboard-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History size={16} />
              <span>Riwayat Transaksi</span>
            </button>

            <button
              onClick={() => setTab('wishlist')}
              className={`dashboard-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Bookmark size={16} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Event Disimpan</span>
                {savedEvents.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: activeTab === 'wishlist' ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface-elevated)',
                      color: activeTab === 'wishlist' ? 'var(--text-inverse)' : 'var(--text-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {savedEvents.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setTab('settings')}
              className={`dashboard-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={16} />
              <span>Pengaturan Profil</span>
            </button>
          </nav>
        </aside>

        {/* Mobile Horizontal Tabs */}
        <div className="dashboard-mobile-tabs" style={{ display: 'none', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <button onClick={() => setTab('overview')} className={`btn-secondary ${activeTab === 'overview' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Ringkasan
            </button>
            <button onClick={() => setTab('tickets')} className={`btn-secondary ${activeTab === 'tickets' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Tiket ({upcomingBookings.length})
            </button>
            <button onClick={() => setTab('history')} className={`btn-secondary ${activeTab === 'history' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Riwayat
            </button>
            <button onClick={() => setTab('wishlist')} className={`btn-secondary ${activeTab === 'wishlist' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Disimpan ({savedEvents.length})
            </button>
            <button onClick={() => setTab('settings')} className={`btn-secondary ${activeTab === 'settings' ? 'btn-primary' : ''}`} style={{ height: '34px', fontSize: '0.78rem' }}>
              Profil
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* TAB 1: OVERVIEW (RINGKASAN) */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Welcome Banner */}
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <Sparkles size={14} />
                    <span>Member Ticketify Platinum</span>
                  </div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                    Halo, {user.name}! 👋
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '540px', lineHeight: 1.5 }}>
                    Selamat datang di dasbor konser Anda. Semua tiket resmi, barcode QR masuk gate, riwayat transaksi, dan event musik favorit Anda tersimpan aman di sini.
                  </p>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="kpi-grid">
                {/* 1. Upcoming Tickets */}
                <div className="dashboard-stat-card" onClick={() => setTab('tickets')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tiket Aktif</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {stats?.upcomingCount ?? 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Siap digunakan di venue
                  </div>
                </div>

                {/* 2. Past Events */}
                <div className="dashboard-stat-card" onClick={() => setTab('history')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Konser Selesai</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <History size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {stats?.pastCount ?? 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Event telah dihadiri
                  </div>
                </div>

                {/* 3. Total Spent */}
                <div className="dashboard-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Belanja</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.3rem' }}>
                    Rp {(stats?.totalSpent ?? 0).toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {stats?.totalBookings ?? 0} transaksi berhasil
                  </div>
                </div>

                {/* 4. Saved Events */}
                <div className="dashboard-stat-card" onClick={() => setTab('wishlist')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Wishlist</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bookmark size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {stats?.savedEventsCount ?? 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Event musik diincar
                  </div>
                </div>
              </div>

              {/* Next Upcoming Concert Highlight */}
              {stats?.nextUpcomingBooking ? (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Konser Terdekat Anda</h3>
                    </div>
                    <button
                      onClick={() => setActiveETicket(stats.nextUpcomingBooking)}
                      className="btn-primary"
                      style={{ height: '32px', fontSize: '0.78rem', gap: '0.35rem' }}
                    >
                      <QrCode size={13} />
                      <span>Buka QR Gate</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }} className="highlight-banner-grid">
                    <img
                      src={stats.nextUpcomingBooking.eventImage}
                      alt={stats.nextUpcomingBooking.eventTitle}
                      style={{
                        width: '140px',
                        height: '95px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-surface-elevated)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        {stats.nextUpcomingBooking.tierName} • {stats.nextUpcomingBooking.quantity} Tiket
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.45rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {stats.nextUpcomingBooking.eventTitle}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          {stats.nextUpcomingBooking.eventDate} ({stats.nextUpcomingBooking.eventTime})
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} />
                          {stats.nextUpcomingBooking.eventVenue}, {stats.nextUpcomingBooking.eventCity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px dashed var(--border-hover)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Belum ada tiket konser mendatang. Temukan artis dan konser impianmu sekarang!
                  </p>
                  <Link href="/" className="btn-primary" style={{ display: 'inline-flex', height: '36px', fontSize: '0.82rem', gap: '0.4rem', textDecoration: 'none' }}>
                    <Search size={14} />
                    <span>Cari Tiket Konser</span>
                  </Link>
                </div>
              )}

              {/* Recent Bookings Mini List */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Pemesanan Terakhir</h3>
                  <button onClick={() => setTab('history')} className="btn-secondary" style={{ height: '30px', fontSize: '0.76rem', gap: '0.3rem' }}>
                    <span>Lihat Semua</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Belum ada histori pemesanan tiket.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bookings.slice(0, 3).map((b) => (
                      <div
                        key={b._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {b.bookingCode}
                            </span>
                            <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                              {b.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {b.eventTitle}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {b.tierName} • {b.quantity}x Tiket
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                            Rp {b.totalPrice.toLocaleString('id-ID')}
                          </div>
                          <button
                            onClick={() => setActiveETicket(b)}
                            className="btn-secondary"
                            style={{ height: '28px', fontSize: '0.72rem', marginTop: '0.35rem', gap: '0.3rem' }}
                          >
                            <QrCode size={12} />
                            <span>E-Ticket</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TIKET SAYA (MY TICKETS & E-TICKETS) */}
          {activeTab === 'tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daftar Tiket Konser</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Buka E-Ticket untuk melihat barcode & QR Code saat masuk gate acara.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-glass-input)', borderRadius: 'var(--radius-pill)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => setTicketFilter('upcoming')}
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: ticketFilter === 'upcoming' ? 'var(--text-primary)' : 'transparent',
                      color: ticketFilter === 'upcoming' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    }}
                  >
                    Akan Datang ({upcomingBookings.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('past')}
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: ticketFilter === 'past' ? 'var(--text-primary)' : 'transparent',
                      color: ticketFilter === 'past' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    }}
                  >
                    Selesai ({pastBookings.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('all')}
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: ticketFilter === 'all' ? 'var(--text-primary)' : 'transparent',
                      color: ticketFilter === 'all' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    }}
                  >
                    Semua ({bookings.length})
                  </button>
                </div>
              </div>

              {filteredTickets.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Belum ada tiket pada kategori ini</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Tiket yang Anda pesan di Ticketify akan otomatis muncul di halaman ini.
                  </p>
                  <Link href="/" className="btn-primary" style={{ display: 'inline-flex', height: '36px', fontSize: '0.82rem', textDecoration: 'none', gap: '0.4rem' }}>
                    <span>Pesan Tiket Sekarang</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {filteredTickets.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, border-color 0.2s',
                      }}
                      className="ticket-card-hover"
                    >
                      {/* Image header */}
                      <div style={{ height: '140px', position: 'relative' }}>
                        <img
                          src={t.eventImage}
                          alt={t.eventTitle}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                        <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600 }}>
                            {t.tierName}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-pill)', backgroundColor: '#10b981', color: '#fff', fontWeight: 700 }}>
                            {t.quantity} Tiket
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1.15rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>
                              KODE: {t.bookingCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(t.bookingCode, 'Kode Booking')}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                              title="Salin Kode"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.6rem', lineHeight: 1.3 }}>
                            {t.eventTitle}
                          </h4>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <Calendar size={13} />
                              <span>{t.eventDate} ({t.eventTime})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <MapPin size={13} />
                              <span>{t.eventVenue}, {t.eventCity}</span>
                            </div>
                          </div>
                        </div>

                        {/* Button Action */}
                        <button
                          onClick={() => setActiveETicket(t)}
                          className="btn-primary"
                          style={{ width: '100%', height: '36px', fontSize: '0.8rem', gap: '0.4rem' }}
                        >
                          <QrCode size={14} />
                          <span>Lihat E-Ticket & QR</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RIWAYAT TRANSAKSI (TRANSACTION HISTORY) */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Riwayat Transaksi & Pembelian</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Daftar invoice resmi dan rincian transaksi pemesanan tiket Anda.
                  </p>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Cari kode booking / event..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    style={{ width: '100%', height: '32px', paddingLeft: '2rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-glass-input)' }}
                  />
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
                  <History size={24} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Tidak ada transaksi yang cocok.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredHistory.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {b.bookingCode}
                            </span>
                            <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                              LUNAS / {b.status}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{b.eventTitle}</h4>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            {b.tierName} • {b.quantity} Tiket
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            Rp {b.totalPrice.toLocaleString('id-ID')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Metode: {b.paymentMethod}
                          </div>
                        </div>
                      </div>

                      {/* Itemized summary breakdown */}
                      <div
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          fontSize: '0.74rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          {b.quantity}x Tiket @ Rp {b.unitPrice.toLocaleString('id-ID')} + Biaya Layanan Rp {b.serviceFee.toLocaleString('id-ID')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>Waktu: {new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => setActiveETicket(b)}
                            className="btn-secondary"
                            style={{ height: '26px', fontSize: '0.7rem', padding: '0 0.55rem', gap: '0.3rem' }}
                          >
                            <QrCode size={11} />
                            <span>Lihat E-Ticket</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVENT DISIMPAN (WISHLIST) */}
          {activeTab === 'wishlist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Event Disimpan (Wishlist)</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Konser dan festival musik yang Anda tandai untuk dibeli nantinya.
                </p>
              </div>

              {savedEvents.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bookmark size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Belum ada konser yang disimpan</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Tandai event yang ingin Anda tonton dengan ikon Bookmark di halaman utama.
                  </p>
                  <Link href="/" className="btn-primary" style={{ display: 'inline-flex', height: '36px', fontSize: '0.82rem', textDecoration: 'none', gap: '0.4rem' }}>
                    <span>Eksplorasi Event Konser</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {savedEvents.map((evt) => {
                    const lowestPrice = Math.min(...evt.ticketTiers.map((t) => t.price));
                    return (
                      <div
                        key={evt._id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div style={{ height: '140px', position: 'relative' }}>
                          <img src={evt.image} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => handleRemoveSavedEvent(evt._id)}
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0,0,0,0.65)',
                              border: 'none',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            title="Hapus dari simpanan"
                          >
                            <Bookmark size={15} fill="#ef4444" />
                          </button>
                        </div>

                        <div style={{ padding: '1.15rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {evt.artist}
                            </span>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.2rem', marginBottom: '0.45rem' }}>
                              {evt.title}
                            </h4>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                              <MapPin size={12} />
                              <span>{evt.venue}, {evt.city}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mulai dari</div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                                Rp {lowestPrice.toLocaleString('id-ID')}
                              </div>
                            </div>
                            <Link
                              href="/"
                              className="btn-primary"
                              style={{ height: '32px', fontSize: '0.76rem', padding: '0 0.75rem', textDecoration: 'none' }}
                            >
                              Beli Tiket
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PENGATURAN PROFIL & AKUN */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Pengaturan Akun & Profil</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Kelola data diri Anda agar proses pemesanan tiket berikutnya otomatis terisi secara instan.
                </p>
              </div>

              {profileAlert && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: profileAlert.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${profileAlert.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                    color: profileAlert.type === 'success' ? '#10b981' : '#ef4444',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {profileAlert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{profileAlert.message}</span>
                </div>
              )}

              <form
                onSubmit={handleUpdateProfile}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.15rem',
                }}
              >
                {/* Email (Readonly) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Alamat Email (Akun Utama)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      opacity: 0.7,
                      fontSize: '0.84rem',
                      cursor: 'not-allowed',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    Email digunakan sebagai identitas akun dan penerimaan invoice tiket.
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Nama Lengkap (Sesuai KTP / Paspor) *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>

                {/* Phone & Identity Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }} className="grid-responsive">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-glass-input)',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Nomor Identitas (NIK KTP / Paspor)
                    </label>
                    <input
                      type="text"
                      placeholder="16 digit NIK"
                      value={profileIdNumber}
                      onChange={(e) => setProfileIdNumber(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-glass-input)',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Bio Singkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Genre musik favorit atau musisi kesukaan..."
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.5rem 0' }} />

                {/* Change Password Optional */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Ganti Password (Kosongkan jika tidak ingin diubah)
                  </label>
                  <input
                    type="password"
                    placeholder="Password baru (minimal 6 karakter)"
                    value={profileNewPassword}
                    onChange={(e) => setProfileNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="btn-primary"
                  style={{
                    height: '42px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    marginTop: '0.5rem',
                    justifyContent: 'center',
                  }}
                >
                  {profileSaving ? 'Menyimpan Perubahan...' : 'Simpan Profil'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* E-Ticket View Modal */}
      {activeETicket && (
        <ETicketModal
          booking={activeETicket}
          onClose={() => setActiveETicket(null)}
        />
      )}

      {/* Auth Modal if triggered */}
      <AuthModal />

      <style jsx>{`
        @media (max-width: 860px) {
          .dashboard-grid-wrapper {
            flex-direction: column !important;
            padding: 1rem !important;
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

        @media (max-width: 520px) {
          .kpi-grid {
            grid-template-columns: 1fr !important;
          }
          .highlight-banner-grid {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .highlight-banner-grid img {
            width: 100% !important;
            height: 120px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Memuat Dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
