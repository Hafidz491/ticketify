'use client';

import React, { useState, useEffect } from 'react';
import { IEvent, TicketTier } from '@/lib/types';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import { SEATING_PRESETS } from '@/lib/seatingPresets';
import ImagePicker from '@/components/ImagePicker';
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  Loader2,
  Layers,
  FileText,
  Music,
  Check,
  Compass,
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Stadion GBK Night', url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Jazz Festival Live', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'EDM Stage Lights', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rock Band Crowd', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Orchestra Hall', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Indie Sunset Acoustic', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
];

interface AdminEditEventModalProps {
  event: IEvent | null;
  onClose: () => void;
  onSaved: (updatedEvent: IEvent) => void;
}

export default function AdminEditEventModal({
  event,
  onClose,
  onSaved,
}: AdminEditEventModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<IEvent['category']>('Concert');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [image, setImage] = useState('');
  const [seatingImage, setSeatingImage] = useState(SEATING_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [lineupText, setLineupText] = useState('');
  const [termsText, setTermsText] = useState('');
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [organizer, setOrganizer] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'seating' | 'tickets' | 'description'>('info');

  // Populate form with current event data whenever modal opens
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setArtist(event.artist || '');
      setCategory(event.category || 'Concert');
      setDate(event.date || '');
      setTime(event.time || '');
      setVenue(event.venue || '');
      setCity(event.city || '');
      setImage(event.image || '');
      setSeatingImage(event.seatingImage || SEATING_PRESETS[0].url);
      setDescription(event.description || '');
      setIsFeatured(Boolean(event.isFeatured));
      setLineupText(Array.isArray(event.lineup) ? event.lineup.join('\n') : '');
      setTermsText(Array.isArray(event.terms) ? event.terms.join('\n') : '');
      setOrganizer(event.organizer || 'Ticketify Official');
      setTiers(
        Array.isArray(event.ticketTiers)
          ? JSON.parse(JSON.stringify(event.ticketTiers))
          : []
      );
      setActiveTab('info');
    }
  }, [event]);

  if (!event) return null;

  // Tier manipulation
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
      alert('Minimal harus ada 1 kategori tiket');
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !venue.trim() || !date) {
      await showErrorAlert({
        title: 'Data Belum Lengkap',
        text: 'Mohon lengkapi seluruh kolom wajib yang bertanda bintang (*).',
      });
      return;
    }

    try {
      setSaving(true);
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
        description: description.trim(),
        isFeatured,
        lineup,
        terms,
        organizer: organizer.trim() || 'Ticketify Official',
        ticketTiers: tiers.map((t) => ({
          ...t,
          price: Number(t.price),
          quota: Number(t.quota),
          available: Number(t.available ?? t.quota),
        })),
      };

      const res = await fetch(`/api/events/${event._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui konser');
      }

      await showSuccessAlert({
        title: 'Perubahan Tersimpan!',
        text: `Data konser "${data.event.title}" berhasil diperbarui.`,
        timer: 2500,
      });

      onSaved(data.event);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      await showErrorAlert({
        title: 'Gagal Menyimpan',
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const totalQuota = tiers.reduce((acc, t) => acc + (Number(t.quota) || 0), 0);
  const totalAvailable = tiers.reduce((acc, t) => acc + (Number(t.available) || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content admin-edit-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
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
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Music size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isFeatured ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                    color: isFeatured ? '#d97706' : 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  {isFeatured ? 'FEATURED BANNER' : 'REGULAR'}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  ID: {event._id}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, marginTop: '0.15rem' }}>
                Detail &amp; Edit Konser: {event.title}
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" title="Tutup Modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          className="admin-edit-tabs no-scrollbar"
          style={{
            padding: '0.5rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            gap: '0.5rem',
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`btn-secondary ${activeTab === 'info' ? 'btn-primary' : ''}`}
            style={{ height: '34px', fontSize: '0.78rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Calendar size={14} />
            <span>1. Info &amp; Waktu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seating')}
            className={`btn-secondary ${activeTab === 'seating' ? 'btn-primary' : ''}`}
            style={{ height: '34px', fontSize: '0.78rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Compass size={14} />
            <span>2. Denah Kursi Panggung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`btn-secondary ${activeTab === 'tickets' ? 'btn-primary' : ''}`}
            style={{ height: '34px', fontSize: '0.78rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Layers size={14} />
            <span>3. Tiket &amp; Kuota ({tiers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`btn-secondary ${activeTab === 'description' ? 'btn-primary' : ''}`}
            style={{ height: '34px', fontSize: '0.78rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <FileText size={14} />
            <span>4. Deskripsi &amp; Lineup</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form
          id="admin-edit-form"
          onSubmit={handleSave}
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* TAB 1: INFORMASI UTAMA & LOKASI */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Nama Konser / Acara *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul konser"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Artis / Musisi Utama *
                  </label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Nama artis atau band"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Kategori Acara *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                      color: 'var(--text-primary)',
                    }}
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
                    Tampilkan di Banner Utama (Featured Carousel)
                  </label>
                  <div
                    style={{
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="edit-isFeatured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="edit-isFeatured" style={{ fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                      Slide di Banner Utama (Auto-slide 3s)
                    </label>
                  </div>
                </div>
              </div>

              {/* Date & Location */}
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
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Waktu Konser *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="19:30 WIB"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Nama Venue / Tempat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Stadion Gelora Bung Karno"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Kota *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
              </div>

              {/* Poster Image — ImagePicker (Local Upload + URL) */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <ImagePicker
                  value={image}
                  onChange={setImage}
                  label="Gambar Poster Konser"
                  required
                />
              </div>
            </div>
          )}

          {/* TAB 2: DENAH KURSI PANGGUNG (SEATING CHART SELECTION) */}
          {activeTab === 'seating' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '0.25rem' }}>
                  Pilih Format Denah Kursi &amp; Tata Panggung
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Pilih salah satu denah resmi konser di bawah ini atau gunakan gambar denah kustom Anda.
                </p>
              </div>

              {/* Preset Cards Grid */}
              <div className="responsive-seating-grid">
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
                      {/* Mini Thumbnail */}
                      <div style={{ height: '120px', width: '100%', backgroundColor: '#090d16', overflow: 'hidden' }}>
                        <img
                          src={preset.url}
                          alt={preset.label}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
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
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom URL Input */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Atau Masukkan URL Denah Kustom:
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

              {/* Live Preview of Selected Seating Layout */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                  Pratinjau Denah Terpilih:
                </label>
                <div
                  style={{
                    maxWidth: '520px',
                    margin: '0 auto',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#090d16',
                    border: '1px solid var(--border-default)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={seatingImage || SEATING_PRESETS[0].url}
                    alt="Pratinjau Denah"
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KATEGORI TIKET, HARGA & KUOTA */}
          {activeTab === 'tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                    Kategori &amp; Kuota Tiket
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Total {totalAvailable} tiket tersedia dari kuota {totalQuota} tiket
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTier}
                  className="btn-secondary"
                  style={{ height: '32px', fontSize: '0.76rem', gap: '0.35rem' }}
                >
                  <Plus size={13} />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    className="responsive-tier-row-edit"
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
                        placeholder="Contoh: VIP Standing"
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-glass-input)',
                          fontSize: '0.8rem',
                        }}
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
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-glass-input)',
                            fontSize: '0.8rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                          Total Kuota
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tier.quota}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleUpdateTier(idx, 'quota', val);
                          }}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-glass-input)',
                            fontSize: '0.8rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                          Sisa Kuota
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={tier.available ?? tier.quota}
                          onChange={(e) => handleUpdateTier(idx, 'available', Number(e.target.value))}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-glass-input)',
                            fontSize: '0.8rem',
                          }}
                        />
                      </div>
                    </div>

                    <div className="responsive-tier-action-row">
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        title="Hapus Kategori"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DESKRIPSI, LINEUP & SYARAT */}
          {activeTab === 'description' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Deskripsi Lengkap Konser
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan detail konser, pengalaman pertunjukan, dll..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-glass-input)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div className="responsive-two-col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Lineup Artis Pendukung (1 per baris)
                  </label>
                  <textarea
                    rows={4}
                    value={lineupText}
                    onChange={(e) => setLineupText(e.target.value)}
                    placeholder="Musisi 1&#10;Musisi 2&#10;Opening Act"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Syarat &amp; Ketentuan Masuk (1 per baris)
                  </label>
                  <textarea
                    rows={4}
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    placeholder="Wajib membawa KTP asli&#10;Dilarang membawa kamera profesional"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Nama Penyelenggara / Promotor
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Ticketify Official Promotor"
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
            </div>
          )}
        </form>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary"
            style={{ height: '38px', fontSize: '0.84rem', padding: '0 1.25rem' }}
          >
            Batal
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              form="admin-edit-form"
              disabled={saving}
              className="btn-primary"
              style={{ height: '38px', fontSize: '0.84rem', padding: '0 1.5rem', gap: '0.45rem' }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .admin-edit-modal-content {
            border-radius: var(--radius-lg) !important;
            width: 98% !important;
          }
          .admin-edit-tabs {
            padding: 0.4rem 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
