'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, TicketTier, IBooking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { validatePromoCode, AVAILABLE_PROMOS, PromoCode } from '@/lib/promos';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Clock,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface CheckoutModalProps {
  event: IEvent | null;
  tier: TicketTier | null;
  quantity: number;
  onClose: () => void;
  onBookingSuccess: (booking: IBooking) => void;
}

export default function CheckoutModal({
  event,
  tier,
  quantity,
  onClose,
  onBookingSuccess,
}: CheckoutModalProps) {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS Instant');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 15-Minute Payment Countdown Timer (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  // Promo Code Engine State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showErrorAlert({
            title: t.checkout.sessionExpired,
            text: t.checkout.sessionExpiredDesc,
          }).then(() => onClose());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose, t]);

  // Format countdown mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-sync form with logged in user profile
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setIdNumber(user.identityNumber || '');
    }
  }, [user]);

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

  if (!event || !tier) return null;

  const serviceFee = 15000;
  const subtotal = tier.price * quantity;
  const grandTotal = Math.max(0, subtotal + serviceFee - discountAmount);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = codeToApply || promoInput;
    setPromoError('');
    setPromoMessage('');

    const res = validatePromoCode(code, subtotal);
    if (!res.valid) {
      setPromoError(res.message);
      setAppliedPromo(null);
      setDiscountAmount(0);
      return;
    }

    setAppliedPromo(res.promo || null);
    setDiscountAmount(res.discountAmount);
    setPromoMessage(res.message);
    setPromoInput(res.code);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoMessage('');
    setPromoError('');
  };

  // If user is not logged in, prompt login before allowing checkout
  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '460px',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              margin: '0 auto 1.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={26} />
          </div>

          <div
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-surface-elevated)',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            {t.checkout.authRequired}
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.65rem' }}>
            {t.checkout.loginToBook}
          </h3>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {t.checkout.loginDesc}
          </p>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tier.name}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {quantity}x {t.checkout.ticketsCount} • Total Rp {grandTotal.toLocaleString('id-ID')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.setItem(
                    'ticketify_pending_checkout',
                    JSON.stringify({ event, tier, quantity })
                  );
                } catch {
                  // ignore
                }
                onClose();
                openAuthModal('login');
              }}
              className="btn-primary"
              style={{ width: '100%', height: '42px', justifyContent: 'center', gap: '0.45rem' }}
            >
              <UserCheck size={16} />
              <span>{t.checkout.loginNow}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ width: '100%', height: '38px', justifyContent: 'center', fontSize: '0.82rem' }}
            >
              {t.checkout.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !idNumber.trim()) {
      setErrorMsg(t.checkout.fillAllData);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          eventId: event._id,
          tierId: tier.id,
          quantity,
          buyer: {
            fullName: fullName.trim(),
            email: email.trim(),
            phoneNumber: phone.trim(),
            identityNumber: idNumber.trim(),
          },
          paymentMethod,
          discountAmount,
          promoCode: appliedPromo?.code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t.checkout.bookingFailed);
      }

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 250);
      } catch {
        // ignore
      }

      // Clear any pending checkout from session
      try {
        sessionStorage.removeItem('ticketify_pending_checkout');
      } catch {
        // ignore
      }

      onBookingSuccess(data.booking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.checkout.systemError;
      setErrorMsg(msg);
      await showErrorAlert({
        title: t.checkout.bookingFailed,
        text: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content checkout-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
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
        {/* Header (Pinned) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {t.checkout.verifiedAccount}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{t.checkout.confirmOrder}</h3>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '34px', height: '34px', borderRadius: '50%' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Payment Countdown Bar */}
        <div
          style={{
            padding: '0.65rem 1.5rem',
            backgroundColor: timeLeft < 180 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: timeLeft < 180 ? '#ef4444' : 'var(--text-primary)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={15} />
            <span>{t.checkout.countdownText}</span>
          </div>
          <div
            style={{
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: timeLeft < 180 ? '#ef4444' : 'var(--accent-primary)',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Form with Scrollable Body and Pinned Footer */}
        <form
          onSubmit={handlePay}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        >
          {/* Scrollable Form Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              padding: '1.35rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.35rem',
            }}
          >
            {errorMsg && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Concert & Order Summary */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem 1.25rem',
                display: 'flex',
                gap: '1.15rem',
                alignItems: 'center',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <img
                src={event.image}
                alt={event.title}
                style={{
                  width: '85px',
                  height: '62px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '0.96rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0,
                  }}
                >
                  {event.title}
                </h4>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'block',
                    marginTop: '0.25rem',
                  }}
                >
                  {tier.name} • {quantity} {t.checkout.ticketsCount}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Buyer Information */}
            <div>
              <h4
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  marginBottom: '0.85rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t.checkout.buyerData}
              </h4>

              <div
                className="checkout-buyer-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem 0.85rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.45rem', fontWeight: 600 }}>
                    {t.checkout.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.checkout.fullNamePlaceholder}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.45rem', fontWeight: 600 }}>
                    {t.checkout.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.45rem', fontWeight: 600 }}>
                    {t.checkout.whatsapp}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.45rem', fontWeight: 600 }}>
                    {t.checkout.identityNumber}
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={t.checkout.identityPlaceholder}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <h4
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  marginBottom: '0.85rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t.checkout.paymentMethod}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'QRIS Instant', label: 'QRIS', icon: QrCode },
                  { id: 'BCA Virtual Account', label: 'BCA VA', icon: Building2 },
                  { id: 'Mandiri / BNI VA', label: 'Mandiri VA', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '0.85rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '1.5px solid var(--text-primary)'
                          : '1px solid var(--border-default)',
                        backgroundColor: isSelected
                          ? 'var(--bg-surface-elevated)'
                          : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={20} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code & Voucher Section */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.15rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Tag size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>{t.checkout.hasPromo}</span>
                </div>
                {appliedPromo && (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {t.checkout.removeVoucher}
                  </button>
                )}
              </div>

              {/* Promo input field & button */}
              <div style={{ display: 'flex', gap: '0.55rem' }}>
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError('');
                  }}
                  placeholder={t.checkout.promoPlaceholder}
                  disabled={Boolean(appliedPromo)}
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '0 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-glass-input)',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyPromo()}
                  disabled={Boolean(appliedPromo) || !promoInput.trim()}
                  className="btn-secondary"
                  style={{
                    height: '38px',
                    padding: '0 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.checkout.applyPromo}
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              {!appliedPromo && (
                <div style={{ marginTop: '0.65rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {t.checkout.recommendedVouchers}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {AVAILABLE_PROMOS.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleApplyPromo(p.code)}
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px dashed var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title={p.description}
                      >
                        <span>{p.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback messages */}
              {promoMessage && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                  <span>{promoMessage}</span>
                </div>
              )}

              {promoError && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: '0.76rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{promoError}</span>
                </div>
              )}
            </div>

            {/* Pricing Calculation Breakdown */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.84rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{t.checkout.subtotal} ({quantity}x {t.checkout.ticketsCount})</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{t.checkout.serviceFee}</span>
                <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={13} />
                    {t.checkout.voucherDiscount} ({appliedPromo?.code})
                  </span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  marginTop: '0.35rem',
                  paddingTop: '0.55rem',
                  borderTop: '1px dashed var(--border-subtle)',
                }}
              >
                <span>{t.checkout.totalPayment}</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Pinned Action Buttons Footer */}
          <div
            style={{
              flexShrink: 0,
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              gap: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
              style={{ flex: 1, height: '44px', justifyContent: 'center', fontSize: '0.86rem', fontWeight: 600 }}
            >
              {t.checkout.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ flex: 2, height: '44px', justifyContent: 'center', gap: '0.55rem', fontSize: '0.88rem', fontWeight: 700 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.checkout.processing}</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>{t.checkout.pay} Rp {grandTotal.toLocaleString('id-ID')}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .checkout-modal-content {
            border-radius: var(--radius-lg) !important;
            width: 100% !important;
          }
          .checkout-buyer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
