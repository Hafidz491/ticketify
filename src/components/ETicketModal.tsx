'use client';

import React, { useEffect, useState, useRef } from 'react';
import { IBooking } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  X,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Check,
  Download,
  CalendarPlus,
  Loader2,
} from 'lucide-react';

interface ETicketModalProps {
  booking: IBooking | null;
  onClose: () => void;
}

export default function ETicketModal({ booking, onClose }: ETicketModalProps) {
  const { language, t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      QRCode.toDataURL(
        booking.qrCodeData || `TICKETIFY:${booking.bookingCode}:${booking.eventTitle}`,
        {
          width: 170,
          margin: 1,
          color: {
            dark: '#111827',
            light: '#ffffff',
          },
        }
      )
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed generating QR code:', err));
    }
  }, [booking]);

  // Lock body scroll when modal is open so only the ticket card can scroll
  useEffect(() => {
    if (!booking) return;
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
  }, [booking]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsDownloadingImage(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `Ticketify-${booking.bookingCode}.png`;
      link.href = dataUrl;
      link.click();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed generating ticket image:', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Konser: ${booking.eventTitle}`);
    const details = encodeURIComponent(
      `E-Ticket Resmi Ticketify\nKode Booking: ${booking.bookingCode}\nKategori: ${booking.tierName}\nJumlah: ${booking.quantity} Tiket\nLokasi: ${booking.eventVenue}, ${booking.eventCity}\n\nHarap tunjukkan QR Code pada E-Ticket saat memasuki venue konser.`
    );
    const location = encodeURIComponent(`${booking.eventVenue}, ${booking.eventCity}`);

    let startIso = '';
    let endIso = '';
    try {
      const cleanDate = booking.eventDate.split('T')[0].replace(/-/g, '');
      const timeMatch = booking.eventTime.match(/(\d{1,2})[:.](\d{2})/);
      const hours = timeMatch ? timeMatch[1].padStart(2, '0') : '19';
      const mins = timeMatch ? timeMatch[2] : '00';
      startIso = `${cleanDate}T${hours}${mins}00`;
      const endHours = String((parseInt(hours, 10) + 3) % 24).padStart(2, '0');
      endIso = `${cleanDate}T${endHours}${mins}00`;
    } catch {
      startIso = '20261115T190000';
      endIso = '20261115T220000';
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const formattedDate = new Date(booking.eventDate).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 1rem))',
          padding: '1.25rem',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Printable Ticket Stub */}
        <div ref={printRef} className="ticket-wrapper printable-area">
          {/* Cover Strip */}
          <div style={{ position: 'relative', height: '130px', width: '100%' }}>
            <img
              src={booking.eventImage}
              alt={booking.eventTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(10,11,15,0.85) 0%, rgba(10,11,15,0.2) 100%)',
              }}
            />

            <button
              onClick={onClose}
              className="btn-icon no-print"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#ffffff',
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              <Check size={12} />
              <span>{t.eticket.officialETicket}</span>
            </div>

            <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {booking.eventTitle}
              </h3>
            </div>
          </div>

          {/* Ticket Information Section */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface)' }}>
            {/* Booking Code & Status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  {t.eticket.bookingCode}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--text-primary)',
                  }}
                >
                  {booking.bookingCode}
                </span>
              </div>

              <div
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--status-success)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                {t.eticket.paid}
              </div>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                  {t.eticket.category}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{booking.tierName}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                  {t.eticket.quantity}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                  {booking.quantity} {t.eticket.pax}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                  {t.eticket.buyerName}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                  {booking.buyer.fullName}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                  {t.eticket.paymentMethod}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                  {booking.paymentMethod}
                </span>
              </div>
            </div>

            {/* Venue & Schedule */}
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} style={{ opacity: 0.7 }} />
                <span>{formattedDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} style={{ opacity: 0.7 }} />
                <span>{booking.eventTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} style={{ opacity: 0.7 }} />
                <span>
                  {booking.eventVenue}, {booking.eventCity}
                </span>
              </div>
            </div>

            {/* STUB CUTOUT NOTCHES & DASHED PERFORATION */}
            <div className="ticket-notch-left" />
            <div className="ticket-notch-right" />
            <div className="ticket-dashed-line" />

            {/* Scannable QR Code Section */}
            <div
              style={{
                paddingTop: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  marginBottom: '0.65rem',
                }}
              >
                {t.eticket.scanAtEntrance}
              </span>

              <div
                style={{
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'inline-block',
                }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Ticket QR Code"
                    style={{ width: '135px', height: '135px', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '135px',
                      height: '135px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    Generating...
                  </div>
                )}
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                AUTH: {booking.bookingCode}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.65rem',
            marginTop: '1.15rem',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleDownloadImage}
            disabled={isDownloadingImage}
            className="btn-primary"
            style={{ padding: '0.65rem 1.15rem', fontSize: '0.84rem' }}
          >
            {isDownloadingImage ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>{t.eticket.savingImage}</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>{t.eticket.downloadPng}</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{ padding: '0.65rem 1rem', fontSize: '0.84rem' }}
          >
            <Printer size={15} />
            <span>{t.eticket.printPdf}</span>
          </button>

          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <CalendarPlus size={15} />
            <span>Google Calendar</span>
          </a>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.65rem 1rem', fontSize: '0.84rem' }}
          >
            <span>{t.eticket.close}</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 500px) {
          .printable-area {
            width: 100% !important;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: fixed;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 440px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
