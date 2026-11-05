'use client';

import React from 'react';
import { IBooking } from '@/lib/types';
import { ScanLine, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminCheckInTabProps {
  bookings: IBooking[];
  scanCode: string;
  setScanCode: (s: string) => void;
  scanLoading: boolean;
  scanResult: {
    success: boolean;
    message: string;
    alreadyCheckedIn?: boolean;
    booking?: IBooking;
  } | null;
  onExecuteCheckIn: (codeToUse?: string) => void;
}

export default function AdminCheckInTab({
  bookings,
  scanCode,
  setScanCode,
  scanLoading,
  scanResult,
  onExecuteCheckIn,
}: AdminCheckInTabProps) {
  return (
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
            onExecuteCheckIn();
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
                  onExecuteCheckIn(b.bookingCode);
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
  );
}

