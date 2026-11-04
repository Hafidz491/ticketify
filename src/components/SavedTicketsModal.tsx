'use client';

import React, { useEffect } from 'react';
import { IEvent } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Star, Calendar, MapPin, ArrowRight, Trash2, ShieldCheck, Ticket } from 'lucide-react';
import Link from 'next/link';

interface SavedTicketsModalProps {
  events: IEvent[];
  onClose: () => void;
  onSelectEvent: (event: IEvent) => void;
}

export default function SavedTicketsModal({
  events,
  onClose,
  onSelectEvent,
}: SavedTicketsModalProps) {
  const { isSavedModalOpen, closeSavedModal, savedEventIds, toggleSaveEvent, user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  if (!isSavedModalOpen) return null;

  const handleClose = () => {
    closeSavedModal();
    onClose();
  };

  // Filter events matching savedEventIds
  const savedList = events.filter(
    (e) => savedEventIds.includes(e._id) || savedEventIds.includes(e.slug)
  );

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

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
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
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#f59e0b',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Star size={18} fill="#000000" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t.savedTickets.title}</h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {savedList.length} {t.savedTickets.wishlistCount}
              </span>
            </div>
          </div>

          <button onClick={handleClose} className="btn-icon">
            <X size={17} />
          </button>
        </div>

        {/* Guest or User Notice */}
        <div
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Star size={13} style={{ color: '#f59e0b' }} />
            <span>
              {user
                ? `${t.savedTickets.savedInAccount} (${user.name})`
                : t.savedTickets.savedInBrowser}
            </span>
          </div>
          {!user && (
            <button
              onClick={() => {
                handleClose();
                openAuthModal('login');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.72rem',
                flexShrink: 0,
              }}
            >
              {t.savedTickets.login}
            </button>
          )}
        </div>

        {/* Scrollable Event List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            paddingRight: '0.25rem',
          }}
        >
          {savedList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Star size={24} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {t.savedTickets.noSaved}
              </h4>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '340px',
                  margin: '0 auto 1.25rem',
                  lineHeight: 1.5,
                }}
              >
                {t.savedTickets.noSavedDesc}
              </p>
              <button onClick={handleClose} className="btn-secondary" style={{ fontSize: '0.8rem', height: '34px' }}>
                {t.savedTickets.exploreConcerts}
              </button>
            </div>
          ) : (
            savedList.map((evt) => {
              const lowestPrice = Math.min(...evt.ticketTiers.map((tier) => tier.price));
              return (
                <div
                  key={evt._id}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={evt.image}
                    alt={evt.title}
                    style={{
                      width: '80px',
                      height: '75px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {evt.artist}
                    </div>
                    <h4
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        margin: '0.15rem 0 0.35rem',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {evt.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <Calendar size={11} />
                      <span>{evt.date}</span>
                      <span>•</span>
                      <span>{t.savedTickets.from} Rp {lowestPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        handleClose();
                        onSelectEvent(evt);
                      }}
                      className="btn-primary"
                      style={{
                        height: '30px',
                        padding: '0 0.75rem',
                        fontSize: '0.74rem',
                        gap: '0.3rem',
                      }}
                    >
                      <span>{t.savedTickets.buyTicket}</span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      onClick={() => toggleSaveEvent(evt._id)}
                      className="btn-secondary"
                      style={{
                        height: '28px',
                        padding: '0 0.6rem',
                        fontSize: '0.7rem',
                        gap: '0.25rem',
                        color: 'var(--text-muted)',
                      }}
                      title={t.savedTickets.deleteTitle}
                    >
                      <Trash2 size={12} />
                      <span>{t.savedTickets.delete}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {user && savedList.length > 0 && (
          <div
            style={{
              paddingTop: '0.85rem',
              marginTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}
          >
            <Link
              href="/dashboard?tab=wishlist"
              onClick={handleClose}
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{t.savedTickets.manageInDashboard}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
