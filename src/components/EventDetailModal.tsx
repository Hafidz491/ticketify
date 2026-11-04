'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, TicketTier } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Check,
  ChevronRight,
  Shield,
  Layers,
  FileText,
  Eye,
} from 'lucide-react';

interface EventDetailModalProps {
  event: IEvent | null;
  onClose: () => void;
  onProceedToCheckout: (event: IEvent, selectedTier: TicketTier, quantity: number) => void;
}

export default function EventDetailModal({
  event,
  onClose,
  onProceedToCheckout,
}: EventDetailModalProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const [selectedTierId, setSelectedTierId] = useState<string>(
    event?.ticketTiers[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'tickets' | 'seating' | 'terms'>(
    isAdmin ? 'seating' : 'tickets'
  );

  // Sync activeTab if role or event changes
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('seating');
    } else {
      setActiveTab('tickets');
    }
  }, [isAdmin, event]);

  // Lock body scroll when modal is open so only the modal card can scroll
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

  if (!event) return null;

  const currentTier =
    event.ticketTiers.find((t) => t.id === selectedTierId) || event.ticketTiers[0];

  const handleIncrement = () => {
    if (quantity < Math.min(4, currentTier?.available || 4)) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const tabs = isAdmin
    ? [
        { id: 'seating' as const, label: t.eventDetail.tabSeatingAdmin },
        { id: 'terms' as const, label: t.eventDetail.tabTermsAdmin },
      ]
    : [
        { id: 'tickets' as const, label: t.eventDetail.tabTickets },
        { id: 'seating' as const, label: t.eventDetail.tabSeating },
        { id: 'terms' as const, label: t.eventDetail.tabTerms },
      ];

  const seatingImageUrl = event.seatingImage || '/seating/stadium-arena.svg';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: 'min(92vh, calc(100dvh - 1.5rem))',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Cover Header (Pinned top) */}
        <div className="event-detail-cover" style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
          <img
            src={event.image}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--bg-surface) 0%, rgba(0,0,0,0.5) 100%)',
            }}
          />

          {/* Top Actions (Close & Admin Badge) */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 10,
            }}
          >
            {isAdmin && (
              <span
                style={{
                  backgroundColor: 'rgba(2, 132, 199, 0.9)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <Shield size={12} />
                <span>{t.eventDetail.adminPreview}</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="btn-icon"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              title={t.eventDetail.closeModal}
            >
              <X size={17} />
            </button>
          </div>

          {/* Header Title inside banner */}
          <div
            className="event-detail-title-overlay"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '18px',
              right: '18px',
            }}
          >
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              {event.artist}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.2rem, 3.2vw, 1.85rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.22,
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body (The card scrolls inside smoothly) */}
        <div
          className="event-detail-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            padding: '1.25rem 1.5rem',
          }}
        >
          {/* Quick Meta */}
          <div
            className="event-detail-quick-meta"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem 1.5rem',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              marginBottom: '1.35rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={15} style={{ opacity: 0.8, flexShrink: 0 }} />
              <span>
                {new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={15} style={{ opacity: 0.8, flexShrink: 0 }} />
              <span>{event.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <MapPin size={15} style={{ opacity: 0.8, flexShrink: 0 }} />
              <span>
                {event.venue}, {event.city}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Scrollable on small screens) */}
          <div
            className="event-detail-tabs-bar no-scrollbar"
            style={{
              display: 'flex',
              gap: '0.45rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.35rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.86rem',
                  borderBottom:
                    activeTab === tab.id
                      ? '2px solid var(--text-primary)'
                      : '2px solid transparent',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: TICKETS SELECTION (Only for regular users / guests) */}
          {!isAdmin && activeTab === 'tickets' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.35rem' }}>
                {event.ticketTiers.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const isSoldOut = tier.available <= 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        if (!isSoldOut) {
                          setSelectedTierId(tier.id);
                        }
                      }}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                        border: `1.5px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        opacity: isSoldOut ? 0.5 : 1,
                        transition: 'all var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-hover)'}`,
                            backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && <Check size={13} color="var(--text-inverse)" />}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                            {tier.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {isSoldOut ? t.eventDetail.soldOut : `${t.eventDetail.available}: ${tier.available} ${t.eventDetail.tickets}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          Rp {tier.price.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {t.eventDetail.perPerson}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity Counter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.eventDetail.ticketQuantity}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {t.eventDetail.maxTickets}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="btn-secondary"
                    style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', minWidth: '28px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= Math.min(4, currentTier?.available || 4)}
                    className="btn-secondary"
                    style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEATING MAP (Visible to Admin & Users) */}
          {activeTab === 'seating' && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
                    {t.eventDetail.stageLayout}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                    {t.eventDetail.officialLayout} {event.venue}, {event.city}
                  </p>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <MapPin size={13} />
                  <span>{event.venue}</span>
                </div>
              </div>

              {/* Seating Diagram Container */}
              <div
                className="event-seating-container"
                style={{
                  maxWidth: '580px',
                  margin: '0 auto',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1.35rem',
                }}
              >
                <img
                  src={seatingImageUrl}
                  alt={`Denah Kursi ${event.title}`}
                  className="event-seating-image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    backgroundColor: '#090d16',
                  }}
                />
              </div>

              {/* Ticket Tier Reference Badges */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.65rem',
                  }}
                >
                  {t.eventDetail.tierAndPrice}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', justifyContent: 'center' }}>
                  {event.ticketTiers.map((tTier, idx) => {
                    const tierColors = ['#f59e0b', '#38bdf8', '#10b981', '#a855f7', '#ec4899'];
                    const color = tierColors[idx % tierColors.length];
                    return (
                      <div
                        key={tTier.id || idx}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tTier.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>• Rp {tTier.price.toLocaleString('id-ID')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & DESCRIPTION */}
          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.86rem' }}>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                  {t.eventDetail.eventDescription}
                </h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  {event.description}
                </p>
              </div>

              {event.lineup && event.lineup.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {t.eventDetail.lineup}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {event.lineup.map((artist, idx) => (
                      <span key={idx} className="pill-badge" style={{ padding: '0.35rem 0.75rem' }}>
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {t.eventDetail.entryTerms}
                </h4>
                <ul
                  style={{
                    paddingLeft: '1.25rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {event.terms.map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Bottom Action Footer (Always visible & comfortable on mobile) */}
        {isAdmin ? (
          /* Admin Review Mode: No payment, only close button */
          <div
            className="event-detail-footer-admin"
            style={{
              flexShrink: 0,
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0284c7',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              <Shield size={16} />
              <span>{t.eventDetail.adminReviewMode}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ height: '40px', padding: '0 1.6rem', fontSize: '0.86rem', fontWeight: 600 }}
            >
              {t.eventDetail.closePreview}
            </button>
          </div>
        ) : (
          /* Regular User: Pricing calculation & proceed to checkout */
          <div
            className="event-detail-footer-user"
            style={{
              flexShrink: 0,
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                {t.eventDetail.totalPrice}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Rp {((currentTier?.price || 0) * quantity).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="event-detail-footer-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                {t.eventDetail.cancel}
              </button>
              <button
                onClick={() => {
                  if (currentTier) {
                    onProceedToCheckout(event, currentTier, quantity);
                  }
                }}
                className="btn-primary"
                style={{ padding: '0.75rem 1.75rem', gap: '0.55rem' }}
              >
                <span>{t.eventDetail.proceedToPayment}</span>
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Desktop Default */
        .event-detail-cover {
          height: 220px;
        }
        .event-seating-image {
          max-height: 380px;
        }

        /* 1. MONITOR 24" KE ATAS (>= 1680px) */
        @media (min-width: 1680px) {
          .event-detail-cover {
            height: 250px;
          }
          .event-seating-image {
            max-height: 420px;
          }
        }

        /* 2. TABLET (601px - 1023px) */
        @media (max-width: 1023px) and (min-width: 601px) {
          .event-detail-cover {
            height: 190px;
          }
          .event-seating-image {
            max-height: 320px;
          }
        }

        /* 3. MOBILE (<= 600px) */
        @media (max-width: 600px) {
          .event-detail-cover {
            height: 155px;
          }
          .event-detail-body {
            padding: 1rem 0.95rem 1.25rem !important;
          }
          .event-seating-image {
            max-height: 220px;
          }
          .event-detail-footer-user {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.9rem !important;
            padding: 0.95rem 1rem !important;
          }
          .event-detail-footer-user-actions {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .event-detail-footer-user-actions .btn-primary {
            flex: 1 !important;
            justify-content: center !important;
          }
          .event-detail-footer-admin {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.85rem !important;
            padding: 0.95rem 1rem !important;
          }
          .event-detail-footer-admin button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
