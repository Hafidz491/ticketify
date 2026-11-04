'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, TicketTier } from '@/lib/types';
import { X, Plus, Trash2, Calendar, MapPin, Sparkles, Loader2 } from 'lucide-react';
import ImagePicker from '@/components/ImagePicker';

interface CreateEventModalProps {
  onClose: () => void;
  onEventCreated: (event: IEvent) => void;
}

export default function CreateEventModal({
  onClose,
  onEventCreated,
}: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<'Concert' | 'Festival' | 'Theater' | 'Comedy' | 'Conference'>('Concert');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30 WIB');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Jakarta');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      id: 't-1',
      name: 'Festival Standing',
      price: 500000,
      quota: 500,
      available: 500,
      perks: ['Akses area festival utama'],
    },
    {
      id: 't-2',
      name: 'VIP Experience',
      price: 1200000,
      quota: 100,
      available: 100,
      perks: ['Akses paling depan', 'Free souvenir'],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `t-${Date.now()}`,
      name: 'Kategori Baru',
      price: 350000,
      quota: 300,
      available: 300,
      perks: ['Akses umum'],
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (idx: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== idx));
    }
  };

  const handleTierChange = (idx: number, field: keyof TicketTier, value: any) => {
    const updated = [...tiers];
    updated[idx] = { ...updated[idx], [field]: value };
    setTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !artist.trim() || !venue.trim() || !date) {
      setErrorMsg('Mohon lengkapi judul, artis, venue, dan tanggal event.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artist,
          category,
          date,
          time,
          venue,
          city,
          image,
          description: description || `Konser spektakuler persembahan ${artist} di ${venue}.`,
          ticketTiers: tiers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat event baru');
      }

      onEventCreated(data.event);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: 'min(92vh, calc(100dvh - 1.5rem))',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.85rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Publikasikan Event / Konser Baru</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Ticketify Event Organizer Portal
            </span>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--rose-accent)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main Info */}
          <div className="create-event-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Nama Konser / Acara
              </label>
              <input
                type="text"
                placeholder="Misal: Coldplay: Music of the Spheres Jakarta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Artis / Lineup Utama
              </label>
              <input
                type="text"
                placeholder="Misal: Coldplay"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Kategori Acara
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="Concert">Konser Musik</option>
                <option value="Festival">Festival</option>
                <option value="Theater">Seni & Teater</option>
                <option value="Comedy">Standup Comedy</option>
                <option value="Conference">Konferensi</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Waktu / Jam
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="19:30 WIB"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Venue / Lokasi Gedung
              </label>
              <input
                type="text"
                placeholder="Stadion Gelora Bung Karno"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Kota
              </label>
              <input
                type="text"
                placeholder="Jakarta"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <ImagePicker
                value={image}
                onChange={setImage}
                label="Gambar Poster Konser"
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Deskripsi Konser
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan gambaran pertunjukan dan keseruan konser..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
          </div>

          {/* Ticket Tiers Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Kategori & Harga Tiket</h4>
              <button
                type="button"
                onClick={handleAddTier}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                <Plus size={14} />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {tiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="tier-inputs-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nama Kategori (misal VIP)"
                    value={tier.name}
                    onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Harga (IDR)"
                    value={tier.price}
                    onChange={(e) => handleTierChange(idx, 'price', Number(e.target.value))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Kuota Tiket"
                    value={tier.quota}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleTierChange(idx, 'quota', val);
                      handleTierChange(idx, 'available', val);
                    }}
                    required
                  />
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      style={{ color: 'var(--status-danger)', padding: '0.4rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '0.8rem 1.8rem' }}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan ke MongoDB...</span>
                </>
              ) : (
                <span>Terbitkan Konser</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          :global(.create-event-grid) {
            grid-template-columns: 1fr !important;
          }
          :global(.tier-inputs-row) {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
