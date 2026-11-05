'use client';

import React from 'react';
import { IEvent } from '@/lib/types';
import Link from 'next/link';
import { Search, RefreshCw, Ticket, Calendar, MapPin, Edit3, Eye, Trash2 } from 'lucide-react';

interface AdminEventsTabProps {
  events: IEvent[];
  eventsLoading: boolean;
  eventSearch: string;
  setEventSearch: (s: string) => void;
  deletingId: string | null;
  onEditEvent: (evt: IEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onRefresh: () => void;
  onSwitchToCreate: () => void;
}

export default function AdminEventsTab({
  events,
  eventsLoading,
  eventSearch,
  setEventSearch,
  deletingId,
  onEditEvent,
  onDeleteEvent,
  onRefresh,
  onSwitchToCreate,
}: AdminEventsTabProps) {
  const filteredEvents = eventSearch.trim()
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
          e.artist.toLowerCase().includes(eventSearch.toLowerCase()) ||
          e.city.toLowerCase().includes(eventSearch.toLowerCase())
      )
    : events;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daftar Konser & Event Terdaftar</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Kelola ketersediaan tiket konser, pantau sisa kuota, atau hapus konser.
          </p>
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari konser atau artis..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              style={{ width: '100%', height: '34px', paddingLeft: '2rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-glass-input)' }}
            />
          </div>
          <button onClick={onRefresh} className="btn-secondary" style={{ height: '34px', fontSize: '0.78rem', gap: '0.35rem' }}>
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {eventsLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Memuat daftar konser...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-hover)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
          <Ticket size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Tidak ada konser yang ditemukan.</p>
          <button onClick={onSwitchToCreate} className="btn-primary" style={{ height: '36px', fontSize: '0.82rem' }}>
            Buat Event Baru
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEvents.map((evt) => {
            const totalQuota = evt.ticketTiers.reduce((acc, t) => acc + (t.quota || 0), 0);
            const totalAvailable = evt.ticketTiers.reduce((acc, t) => acc + (t.available || 0), 0);
            const totalSold = totalQuota - totalAvailable;

            return (
              <div
                key={evt._id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  gap: '1.35rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <img
                  src={evt.image}
                  alt={evt.title}
                  style={{ width: '130px', height: '92px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                />

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {evt.category}
                    </span>
                    {evt.isFeatured && (
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 700 }}>
                        FEATURED
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, lineHeight: 1.35, marginBottom: '0.45rem' }}>
                    {evt.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.15rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      {evt.date} ({evt.time})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} />
                      {evt.venue}, {evt.city}
                    </span>
                  </div>

                  {/* Quota bar */}
                  <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ flex: 1, height: '7px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.round((totalSold / (totalQuota || 1)) * 100))}%`,
                          backgroundColor: '#10b981',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {totalAvailable} sisa dari {totalQuota} tiket
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => onEditEvent(evt)}
                    className="btn-primary"
                    style={{ height: '36px', fontSize: '0.8rem', padding: '0 1rem', gap: '0.45rem', borderRadius: 'var(--radius-md)' }}
                    title="Lihat detail lengkap dan ubah data konser"
                  >
                    <Edit3 size={14} />
                    <span>Detail & Edit</span>
                  </button>

                  <Link
                    href="/"
                    className="btn-secondary"
                    style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.95rem', gap: '0.45rem', textDecoration: 'none', borderRadius: 'var(--radius-md)' }}
                  >
                    <Eye size={14} />
                    <span>Lihat di Web</span>
                  </Link>

                  <button
                    onClick={() => onDeleteEvent(evt._id, evt.title)}
                    disabled={deletingId === evt._id}
                    className="btn-secondary"
                    style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.95rem', gap: '0.45rem', color: '#ef4444', borderRadius: 'var(--radius-md)' }}
                  >
                    <Trash2 size={14} />
                    <span>{deletingId === evt._id ? 'Menghapus...' : 'Hapus Event'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

