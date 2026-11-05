'use client';

import React from 'react';
import { IBooking } from '@/lib/types';
import { Search, FileSpreadsheet, RefreshCw, ScanLine } from 'lucide-react';

interface AdminOrdersTabProps {
  bookings: IBooking[];
  ordersLoading: boolean;
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  totalRevenue: number;
  totalTicketsSold: number;
  totalOrders: number;
  onExportCSV: () => void;
  onRefresh: () => void;
  onOpenCheckIn: (bookingCode: string) => void;
}

export default function AdminOrdersTab({
  bookings,
  ordersLoading,
  orderSearch,
  setOrderSearch,
  totalRevenue,
  totalTicketsSold,
  totalOrders,
  onExportCSV,
  onRefresh,
  onOpenCheckIn,
}: AdminOrdersTabProps) {
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
            onClick={onExportCSV}
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

          <button onClick={onRefresh} className="btn-secondary" style={{ height: '34px', fontSize: '0.78rem', gap: '0.35rem' }}>
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
                        onClick={() => onOpenCheckIn(b.bookingCode)}
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
  );
}

