'use client';

import React, { useState } from 'react';
import { IEvent, TicketTier } from '@/lib/types';
import { SEATING_PRESETS } from '@/lib/seatingPresets';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import { Shield, PlusCircle, Trash2, Plus, Check } from 'lucide-react';

export const PRESET_IMAGES = [
  { label: 'Stadion GBK Night', url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Jazz Festival Live', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'EDM Stage Lights', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rock Band Crowd', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Orchestra Hall', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Indie Sunset Acoustic', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
];

interface AdminCreateTabProps {
  onCreated: () => void;
  organizerName?: string;
  showToast: (msg: string) => void;
}

export default function AdminCreateTab({ onCreated, organizerName, showToast }: AdminCreateTabProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<IEvent['category']>('Concert');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30 WIB');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Jakarta');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [seatingImage, setSeatingImage] = useState(SEATING_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [lineupText, setLineupText] = useState('');
  const [termsText, setTermsText] = useState('Wajib membawa kartu identitas diri resmi.\nTiket tidak dapat di-refund atau dipindahtangankan tanpa izin.');
  const [submitting, setSubmitting] = useState(false);

  // Ticket Tiers
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      id: 'tier-init-1',
      name: 'Festival Regular (Standing)',
      price: 650000,
      quota: 1500,
      available: 1500,
      perks: ['Akses area festival depan panggung', 'Free gelang festival'],
    },
    {
      id: 'tier-init-2',
      name: 'VIP Front Row Experience',
      price: 1850000,
      quota: 300,
      available: 300,
      perks: ['Akses area khusus terdepan panggung', 'Lounge VIP ber-AC', 'Official Merch T-Shirt'],
    },
  ]);

  const handleUpdateTier = (index: number, field: keyof TicketTier, value: any) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      name: `Kategori Tiket ${tiers.length + 1}`,
      price: 500000,
      quota: 500,
      available: 500,
      perks: ['Akses konser resmi'],
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) {
      showToast('Minimal harus ada 1 kategori tiket');
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !venue.trim() || !date) {
      showToast('Harap lengkapi semua kolom wajib bintang (*)');
      return;
    }

    try {
      setSubmitting(true);
      const lineup = lineupText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (lineup.length === 0) lineup.push(artist.trim());

      const terms = termsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        category,
        date,
        time: time.trim(),
        venue: venue.trim(),
        city: city.trim(),
        image: image.trim(),
        seatingImage: seatingImage.trim() || SEATING_PRESETS[0].url,
        description: description.trim() || 'Pertunjukan musik eksklusif dan spektakuler.',
        isFeatured,
        lineup,
        terms,
        ticketTiers: tiers.map((t) => ({
          ...t,
          available: Number(t.quota),
          price: Number(t.price),
          quota: Number(t.quota),
        })),
        organizer: organizerName || 'Promotor Ticketify',
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menerbitkan event');
      }

      await showSuccessAlert({
        title: 'Konser Berhasil Diterbitkan! 🎉',
        text: `Konser "${data.event.title}" telah aktif dan siap dipesan oleh penonton.`,
      });

      // Reset form
      setTitle('');
      setArtist('');
      setVenue('');
      setDate('');
      setDescription('');
      setSeatingImage(SEATING_PRESETS[0].url);

      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      await showErrorAlert({
        title: 'Gagal Menerbitkan Konser',
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.3rem' }}>
          <Shield size={14} />
          <span>FORM INPUT KONSER ADMIN</span>
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Input & Terbitkan Konser Baru
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Tambahkan konser atau festival musik terbaru. Konser yang diterbitkan akan langsung muncul di halaman eksplorasi dan dapat dipesan oleh pengguna.
        </p>
      </div>

      {/* Event Creation Form */}
      <form
        onSubmit={handleCreateEvent}
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* 1. Basic Information */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            1. Informasi Utama Acara
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Nama Konser / Acara *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bruno Mars Live in Jakarta 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Artis / Musisi Utama *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bruno Mars"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Kategori Acara *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem', color: 'var(--text-primary)' }}
              >
                <option value="Concert">Concert</option>
                <option value="Festival">Festival</option>
                <option value="Theater">Theater</option>
                <option value="Comedy">Comedy</option>
                <option value="Conference">Conference</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Jadikan Konser Unggulan (Hero Banner)
              </label>
              <div style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isFeatured" style={{ fontSize: '0.84rem', cursor: 'pointer' }}>
                  Tampilkan di Banner Utama (Featured)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Date, Time & Location */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            2. Waktu & Lokasi
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tanggal Acara *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Waktu Mulai *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 19:30 WIB"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Nama Tempat / Venue *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Stadion Madya GBK Senayan"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Kota *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jakarta"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Poster Image & Presets */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            3. Gambar Poster Konser
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                URL Gambar Poster *
              </label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{ width: '100%', height: '42px', padding: '0 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.84rem' }}
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Atau pilih gambar preset beresolusi tinggi:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PRESET_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className="btn-secondary"
                    style={{
                      height: '28px',
                      fontSize: '0.72rem',
                      padding: '0 0.65rem',
                      backgroundColor: image === p.url ? 'var(--text-primary)' : undefined,
                      color: image === p.url ? 'var(--text-inverse)' : undefined,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview */}
            {image && (
              <div style={{ marginTop: '0.5rem', width: '220px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>

        {/* 4. Seating Chart Selection */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            4. Gambar Denah Kursi &amp; Tata Panggung (Seating Chart)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Pilih layout denah kursi konser di bawah ini agar penonton dan promotor dapat melihat tata panggung dengan jelas.
          </p>

          {/* Preset Seating Diagrams Grid */}
          <div className="responsive-seating-grid" style={{ marginBottom: '1rem' }}>
            {SEATING_PRESETS.map((preset) => {
              const isSelected = seatingImage === preset.url;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSeatingImage(preset.url)}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  <div style={{ height: '110px', width: '100%', backgroundColor: '#090d16', overflow: 'hidden' }}>
                    <img
                      src={preset.url}
                      alt={preset.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                          color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                          fontWeight: 700,
                        }}
                      >
                        {preset.type}
                      </span>

                      {isSelected && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Check size={13} />
                          <span>Dipilih</span>
                        </span>
                      )}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {preset.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {preset.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom URL Input & Live Preview */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '260px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                URL Denah Kursi Terpilih (atau Kustom)
              </label>
              <input
                type="text"
                value={seatingImage}
                onChange={(e) => setSeatingImage(e.target.value)}
                placeholder="/seating/... atau https://..."
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-glass-input)',
                  fontSize: '0.84rem',
                }}
              />
            </div>

            <div
              style={{
                width: '160px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#090d16',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={seatingImage || SEATING_PRESETS[0].url}
                alt="Preview Denah"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        {/* 5. Ticket Tiers & Pricing */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              5. Kategori Tiket, Harga &amp; Kuota
            </h3>
            <button
              type="button"
              onClick={handleAddTier}
              className="btn-secondary"
              style={{ height: '30px', fontSize: '0.76rem', gap: '0.35rem' }}
            >
              <Plus size={13} />
              <span>Tambah Kategori</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {tiers.map((tier, idx) => (
              <div
                key={tier.id}
                className="responsive-tier-row-create"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                    placeholder="Contoh: CAT 1 (Numbered Seating)"
                    style={{ width: '100%', height: '36px', padding: '0 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.8rem' }}
                  />
                </div>

                <div className="responsive-tier-subgrid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={tier.price}
                      onChange={(e) => handleUpdateTier(idx, 'price', Number(e.target.value))}
                      style={{ width: '100%', height: '36px', padding: '0 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                      Kuota Tiket
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tier.quota}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleUpdateTier(idx, 'quota', val);
                        handleUpdateTier(idx, 'available', val);
                      }}
                      style={{ width: '100%', height: '36px', padding: '0 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                <div className="responsive-tier-action-row">
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="btn-icon"
                    style={{ width: '32px', height: '32px', color: '#ef4444' }}
                    title="Hapus Kategori Tiket"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Description & Rules */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            6. Deskripsi &amp; Syarat Ketentuan
          </h3>

          <div className="responsive-two-col">
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Deskripsi Konser
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsikan pengalaman konser yang akan dinikmati penonton..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Syarat & Ketentuan Masuk (Pisahkan per baris)
              </label>
              <textarea
                rows={4}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass-input)', fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ height: '44px', padding: '0 2rem', fontSize: '0.9rem', gap: '0.5rem', fontWeight: 700 }}
          >
            {submitting ? (
              <span>Menerbitkan Konser...</span>
            ) : (
              <>
                <PlusCircle size={16} />
                <span>Terbitkan Konser Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

