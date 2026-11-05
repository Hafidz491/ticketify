'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { IEvent, TicketTier, IBooking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import EventCard from '@/components/EventCard';
import EventCardSkeleton from '@/components/EventCardSkeleton';
import EventDetailModal from '@/components/EventDetailModal';
import CheckoutModal from '@/components/CheckoutModal';
import ETicketModal from '@/components/ETicketModal';
import AuthModal from '@/components/AuthModal';
import LoginPromptModal from '@/components/LoginPromptModal';
import Footer from '@/components/Footer';
import { showSuccessAlert } from '@/lib/alerts';
import { Sparkles, RefreshCw, Ticket } from 'lucide-react';

export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modals state
  const [detailEvent, setDetailEvent] = useState<IEvent | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    event: IEvent;
    tier: TicketTier;
    quantity: number;
  } | null>(null);
  const [activeETicket, setActiveETicket] = useState<IBooking | null>(null);

  // Pending checkout state (resume payment after login)
  const [pendingCheckout, setPendingCheckout] = useState<{
    event: IEvent;
    tier: TicketTier;
    quantity: number;
  } | null>(null);

  // Login prompt popup state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // â”€â”€ Build the SWR cache key from active filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // When filters change, SWR automatically fetches with the new URL.
  // Previous data stays visible while new data loads (no flash/blank screen).
  const eventsKey = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    return `/api/events?${params.toString()}`;
  }, [searchQuery, selectedCategory, selectedCity]);

  const {
    data: eventsData,
    isLoading,
    mutate: mutateEvents,
  } = useSWR<{ success: boolean; events: IEvent[] }>(eventsKey, {
    // Keep showing previous events while new filter results load
    keepPreviousData: true,
  });

  const events: IEvent[] = eventsData?.events ?? [];

  // â”€â”€ Resume pending checkout after login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (user) {
      let pending = pendingCheckout;
      if (!pending) {
        try {
          const stored = sessionStorage.getItem('ticketify_pending_checkout');
          if (stored) pending = JSON.parse(stored);
        } catch { /* ignore */ }
      }
      if (pending) {
        try { sessionStorage.removeItem('ticketify_pending_checkout'); } catch { /* ignore */ }
        setPendingCheckout(null);
        setCheckoutData(pending);
        showToast(t.toast.loginSuccessResume(pending.event.title));
      }
    }
  }, [user, pendingCheckout, t]);

  const featuredEvents = events.filter((e) => e.isFeatured);
  const bannerEvents = featuredEvents.length > 0 ? featuredEvents : events.length > 0 ? [events[0]] : [];

  // Checkout gate — require login
  const handleProceedToCheckout = (event: IEvent, tier: TicketTier, quantity: number) => {
    if (!user) {
      const pending = { event, tier, quantity };
      setPendingCheckout(pending);
      try { sessionStorage.setItem('ticketify_pending_checkout', JSON.stringify(pending)); } catch { /* ignore */ }
      setDetailEvent(null);
      setShowLoginPrompt(true);
      return;
    }
    setDetailEvent(null);
    setCheckoutData({ event, tier, quantity });
  };

  const handleLoginPromptConfirm = () => {
    setShowLoginPrompt(false);
    openAuthModal('login');
    showToast(t.toast.loginRequiredNotice);
  };

  const handleLoginPromptCancel = () => {
    setShowLoginPrompt(false);
    setPendingCheckout(null);
    try { sessionStorage.removeItem('ticketify_pending_checkout'); } catch { /* ignore */ }
  };

  const handleBookingSuccess = async (booking: IBooking) => {
    setCheckoutData(null);
    setActiveETicket(booking);
    // Surgically re-validate events to refresh remaining ticket quota
    mutateEvents();
    await showSuccessAlert({
      title: t.toast.paymentSuccessTitle,
      text: t.toast.paymentSuccessText(booking.eventTitle, booking.tierName, booking.bookingCode),
      confirmText: language === 'id' ? 'Lihat E-Ticket' : 'View E-Ticket',
    });
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCity('All');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HeroSection
        featuredEvents={bannerEvents}
        onSelectEvent={(evt) => setDetailEvent(evt)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Events Catalog */}
      <main style={{ padding: '1rem 0 4rem' }}>
        <div className="container">
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                <span className="text-gradient-section">
                  {selectedCategory === 'All' ? t.catalog.allEventsTitle : `${t.catalog.categoryPrefix}${t.hero.categories[selectedCategory] || selectedCategory}`}
                </span>
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t.catalog.showingEvents(events.length)}
              </span>
            </div>

            <button
              onClick={handleResetFilter}
              className="btn-ghost"
              style={{ fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} />
              <span>{t.catalog.resetFilter}</span>
            </button>
          </div>

          {/* Events Grid / Loading State */}
          {isLoading && events.length === 0 ? (
            /* Only show skeleton on TRUE first load — if we have cached data, show it instead */
            <div className="events-grid">
              <EventCardSkeleton count={6} />
            </div>
          ) : events.length === 0 ? (
            <div
              className="glass-card"
              style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <Ticket size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                {t.catalog.noEventsTitle}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {t.catalog.noEventsDesc}
              </p>
              <button onClick={handleResetFilter} className="btn-primary">
                {t.catalog.showAllButton}
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((evt, idx) => (
                <EventCard
                  key={evt._id}
                  event={evt}
                  index={idx}
                  onSelect={(e) => setDetailEvent(e)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* MODALS */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {checkoutData && (
        <CheckoutModal
          event={checkoutData.event}
          tier={checkoutData.tier}
          quantity={checkoutData.quantity}
          onClose={() => setCheckoutData(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {activeETicket && (
        <ETicketModal
          booking={activeETicket}
          onClose={() => setActiveETicket(null)}
        />
      )}

      <AuthModal />

      {showLoginPrompt && (
        <LoginPromptModal
          onLogin={handleLoginPromptConfirm}
          onCancel={handleLoginPromptCancel}
        />
      )}
    </div>
  );
}

