'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { IBooking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Ticket, QrCode, Search, Sparkles } from 'lucide-react';

interface MyTicketsModalProps {
  onClose: () => void;
  onViewETicket: (booking: IBooking) => void;
}

export default function MyTicketsModal({ onClose, onViewETicket }: MyTicketsModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<IBooking[]>([]);
  const [filterEmail, setFilterEmail] = useState('');

  const loadLocalAndServerTickets = useCallback(async () => {
    const local = JSON.parse(localStorage.getItem('ticketify-my-tickets') || '[]');
    setTickets(local);

    try {
      const url = user
        ? `/api/bookings?userId=${user._id}&email=${encodeURIComponent(user.email)}`
        : '/api/bookings';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.bookings) {
        const map = new Map<string, IBooking>();
        data.bookings.forEach((b: IBooking) => map.set(b.bookingCode, b));
        local.forEach((b: IBooking) => map.set(b.bookingCode, b));
        setTickets(Array.from(map.values()));
      }
    } catch {
      // Local fallback
    }
  }, [user]);

  useEffect(() => {
    loadLocalAndServerTickets();
  }, [loadLocalAndServerTickets]);

  // Lock body scroll when modal is open so only the card scrolls
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.classList.add('modal-open');

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.classList.remove('modal-open');
    };
  }, []);

  const filteredTickets = filterEmail.trim()
    ? tickets.filter((t) =>
        t.buyer.email.toLowerCase().includes(filterEmail.toLowerCase().trim())
      )
    : tickets;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          maxHeight: 'min(92vh, calc(100dvh - 1.5rem))',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.2rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.myTickets.title}</h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {filteredTickets.length} {t.myTickets.ticketsSaved}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon">
            <X size={17} />
          </button>
        </div>

        {/* Quick Email Filter */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="email"
            placeholder={t.myTickets.searchPlaceholder}
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.4rem',
              height: '38px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-pill)',
            }}
          />
        </div>

        {/* Tickets List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {filteredTickets.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'var(--text-muted)',
              }}
            >
              <Ticket size={36} style={{ margin: '0 auto 0.65rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.myTickets.noTickets}</p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                {t.myTickets.noTicketsDesc}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.bookingCode}
                className="my-ticket-card glass-card"
                style={{
                  display: 'flex',
                  padding: '0.85rem 1rem',
                  gap: '0.85rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <img
                    src={ticket.eventImage}
                    alt={ticket.eventTitle}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {ticket.bookingCode}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--status-success-bg)',
                          color: 'var(--status-success)',
                          fontWeight: 600,
                        }}
                      >
                        {t.myTickets.paid}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.15rem',
                        lineHeight: 1.25,
                      }}
                    >
                      {ticket.eventTitle}
                    </h4>

                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {ticket.tierName} • {ticket.quantity} Pax • {ticket.eventCity}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onViewETicket(ticket)}
                  className="btn-secondary"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    flexShrink: 0,
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  <QrCode size={14} />
                  <span>{t.myTickets.viewQr}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 480px) {
          :global(.my-ticket-card) {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
          :global(.my-ticket-card button) {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
