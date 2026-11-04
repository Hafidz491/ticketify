'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Ticket,
  CreditCard,
  ShieldCheck,
  Building,
  Mail,
  MessageCircle,
} from 'lucide-react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

interface FAQItem {
  id: string;
  category: 'tickets' | 'payment' | 'terms' | 'promoter';
  question: string;
  answer: string;
}

const FAQ_ITEMS_ID: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'tickets',
    question: 'Bagaimana cara menerima dan menggunakan E-Ticket setelah memesan?',
    answer:
      'Setelah pembayaran berhasil dikonfirmasi, E-Ticket Anda langsung terbit seketika dengan QR Code resmi. Anda dapat melihat tiket di menu "Daftar Tiket" pada Dashboard Pengguna, mengunduh tiket dalam format gambar resolusi tinggi (PNG), atau mencetaknya dalam bentuk fisik/PDF. Pada hari-H konser, cukup tunjukkan QR Code pada petugas di pintu masuk (gate check-in).',
  },
  {
    id: 'faq-2',
    category: 'tickets',
    question: 'Apakah E-Ticket harus dicetak di kertas atau cukup lewat HP?',
    answer:
      'Cukup tunjukkan E-Ticket digital melalui smartphone Anda. Pastikan layar HP dalam kondisi cukup terang saat petugas gerbang memindai (scan) QR Code.',
  },
  {
    id: 'faq-3',
    category: 'tickets',
    question: 'Apakah saya bisa menambahkan jadwal konser ke Google Calendar?',
    answer:
      'Bisa! Pada tampilan E-Ticket Anda, klik tombol "Google Calendar". Jadwal konser beserta lokasi venue dan detail tiket akan otomatis tersimpan di kalender pribadi Anda.',
  },
  {
    id: 'faq-4',
    category: 'payment',
    question: 'Metode pembayaran apa saja yang tersedia di Ticketify?',
    answer:
      'Ticketify mendukung QRIS Instant (BCA, Mandiri, GoPay, OVO, Dana, ShopeePay), BCA Virtual Account, dan Mandiri/BNI Virtual Account dengan verifikasi instan real-time tanpa upload bukti manual.',
  },
  {
    id: 'faq-5',
    category: 'payment',
    question: 'Berapa batas waktu untuk menyelesaikan pembayaran?',
    answer:
      'Setiap pemesanan diberikan batas waktu 15 menit untuk menyelesaikan pembayaran. Countdown timer akan muncul di layar checkout Anda. Jika waktu habis, kuota tiket akan otomatis dikembalikan ke sistem agar adil bagi pembeli lain.',
  },
  {
    id: 'faq-6',
    category: 'payment',
    question: 'Bagaimana cara menggunakan kode promo atau voucher diskon?',
    answer:
      'Pada jendela checkout pembayaran, Anda akan menemukan kolom "Punya Kode Promo / Voucher?". Ketikkan kode voucher Anda (contoh: TICKETIFYNEW, PROMOHEMAT10, VIPSPECIAL, atau KONSER2026) lalu klik tombol "Terapkan". Potongan harga akan langsung memotong total pembayaran Anda.',
  },
  {
    id: 'faq-7',
    category: 'terms',
    question: 'Apakah tiket yang sudah dibeli dapat di-refund atau dibatalkan?',
    answer:
      'Sesuai ketentuan umum promotor resmi, tiket konser yang telah dibayar bersifat non-refundable (tidak dapat dikembalikan) kecuali ada pembatalan resmi acara oleh pihak penyelenggara atau promotor.',
  },
  {
    id: 'faq-8',
    category: 'terms',
    question: 'Identitas apa saja yang wajib dibawa saat penukaran atau masuk konser?',
    answer:
      'Pengunjung wajib membawa kartu identitas diri asli yang masih berlaku (KTP / Paspor / SIM / Kartu Pelajar) yang namanya sesuai dengan data pemesan yang tertera di E-Ticket.',
  },
  {
    id: 'faq-9',
    category: 'promoter',
    question: 'Bagaimana cara promotor menambahkan konser baru dan denah panggung?',
    answer:
      'Login sebagai akun Admin/Promotor, lalu buka tab "Buat Event Baru". Anda dapat mengisi detail konser, menentukan kategori tiket & kuota, memilih gambar panggung, serta memilih denah kursi (Festival Arena, Stadium, Amphitheater, atau Jazz Club) dari preset SVG berkualitas tinggi.',
  },
  {
    id: 'faq-10',
    category: 'promoter',
    question: 'Bagaimana petugas gerbang melakukan verifikasi tiket di venue?',
    answer:
      'Petugas pintu masuk dapat membuka tab "Gate Check-In" di Admin Panel, lalu mengetikkan atau memindai kode tiket penonton. Sistem akan memvalidasi keaslian tiket secara real-time dan secara otomatis mencegah tiket ganda (duplicate ticket entry).',
  },
  {
    id: 'faq-11',
    category: 'promoter',
    question: 'Apakah data penjualan tiket promotor dapat diekspor ke Microsoft Excel?',
    answer:
      'Ya! Pada tab "Penjualan Tiket", klik tombol "Ekspor Laporan (Excel)". File spreadsheet .csv dengan format UTF-8 BOM akan otomatis diunduh dengan rincian lengkap transaksi, diskon voucher, nama pembeli, dan status check-in.',
  },
];

const FAQ_ITEMS_EN: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'tickets',
    question: 'How do I receive and use my E-Ticket after booking?',
    answer:
      'Once payment is confirmed, your E-Ticket is immediately issued with an official QR code. You can view your ticket in the "My Tickets" section of your Dashboard, download it as a high-resolution PNG image, or print it out as PDF. On concert day, simply present the QR Code to gate staff for check-in.',
  },
  {
    id: 'faq-2',
    category: 'tickets',
    question: 'Do I need to print the E-Ticket or is showing it on my phone sufficient?',
    answer:
      'Displaying the digital E-Ticket on your smartphone is sufficient. Make sure your phone screen brightness is turned up when gate attendants scan the QR Code.',
  },
  {
    id: 'faq-3',
    category: 'tickets',
    question: 'Can I add concert schedules to my Google Calendar?',
    answer:
      'Yes! On your E-Ticket view, click the "Google Calendar" button. The concert schedule, venue location, and booking details will be automatically saved to your calendar.',
  },
  {
    id: 'faq-4',
    category: 'payment',
    question: 'What payment methods are supported on Ticketify?',
    answer:
      'Ticketify supports QRIS Instant (BCA, Mandiri, GoPay, OVO, Dana, ShopeePay), BCA Virtual Account, and Mandiri/BNI Virtual Account with real-time instant verification without manual proof uploads.',
  },
  {
    id: 'faq-5',
    category: 'payment',
    question: 'How much time do I have to complete the payment?',
    answer:
      'Each booking has a 15-minute countdown timer to complete payment. If time expires, the ticket allocation is automatically released back to the system to be fair to other buyers.',
  },
  {
    id: 'faq-6',
    category: 'payment',
    question: 'How do I use a promo code or discount voucher?',
    answer:
      'In the payment checkout modal, locate the "Have a Promo / Voucher Code?" field. Enter your code (e.g. TICKETIFYNEW, PROMOHEMAT10, VIPSPECIAL, or KONSER2026) and click "Apply". The discount will immediately reduce your total payment.',
  },
  {
    id: 'faq-7',
    category: 'terms',
    question: 'Can purchased tickets be refunded or cancelled?',
    answer:
      'Per official promoter policy, paid concert tickets are strictly non-refundable unless the event is officially cancelled by the organizers or promoters.',
  },
  {
    id: 'faq-8',
    category: 'terms',
    question: 'What identification is required at gate entrance?',
    answer:
      'Attendees must bring a valid government-issued ID (ID Card / Passport / Driver License / Student Card) matching the buyer name printed on the E-Ticket.',
  },
  {
    id: 'faq-9',
    category: 'promoter',
    question: 'How do promoters add new concerts and seating maps?',
    answer:
      'Log in as Admin/Promoter, then go to "Create New Event". You can configure concert details, ticket tiers & quotas, artwork, and select seating blueprints (Festival Arena, Stadium, Amphitheater, or Jazz Club) from high-quality SVG presets.',
  },
  {
    id: 'faq-10',
    category: 'promoter',
    question: 'How do gate staff verify tickets at the venue?',
    answer:
      'Gate staff can open the "Gate Check-In" tab in the Admin Panel and scan or type attendee booking codes. The system validates authenticity in real-time and automatically blocks duplicate ticket entries.',
  },
  {
    id: 'faq-11',
    category: 'promoter',
    question: 'Can promoter sales reports be exported to Microsoft Excel?',
    answer:
      'Yes! In the "Ticket Sales" tab, click "Export Report (Excel)". A UTF-8 BOM formatted .csv spreadsheet will automatically download containing complete transactions, discounts, buyer details, and check-in statuses.',
  },
];

export default function FAQModal({ isOpen, onClose, initialCategory = 'all' }: FAQModalProps) {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Lock body scroll when FAQ modal is open
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = language === 'en'
    ? [
        { id: 'all', label: 'All Questions', icon: HelpCircle },
        { id: 'tickets', label: 'E-Ticket & Concerts', icon: Ticket },
        { id: 'payment', label: 'Payment & Promos', icon: CreditCard },
        { id: 'terms', label: 'Terms & Policies', icon: ShieldCheck },
        { id: 'promoter', label: 'Promoters & Gate', icon: Building },
      ]
    : [
        { id: 'all', label: 'Semua Tanya Jawab', icon: HelpCircle },
        { id: 'tickets', label: 'E-Ticket & Konser', icon: Ticket },
        { id: 'payment', label: 'Pembayaran & Promo', icon: CreditCard },
        { id: 'terms', label: 'Syarat & Kebijakan', icon: ShieldCheck },
        { id: 'promoter', label: 'Promotor & Gate', icon: Building },
      ];

  const currentFaqItems = language === 'en' ? FAQ_ITEMS_EN : FAQ_ITEMS_ID;

  const filteredItems = currentFaqItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content faq-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: 'min(90vh, calc(100dvh - 2rem))',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Pinned Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {language === 'en' ? 'Ticketify Help Center & FAQ' : 'Pusat Bantuan & FAQ Ticketify'}
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {language === 'en'
                  ? 'Find guides on booking, official tickets, promo codes, and concert rules'
                  : 'Temukan panduan pemesanan, tiket resmi, kode voucher, dan tata tertib konser'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '34px', height: '34px', borderRadius: '50%' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Search Bar & Categories Header (Pinned) */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder={language === 'en'
                ? 'Search questions (e.g. E-Ticket, promo voucher, refund, check-in)...'
                : 'Cari pertanyaan (misal: E-Ticket, promo voucher, refund, check-in)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '2.4rem',
                paddingRight: '1rem',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingBottom: '0.2rem',
              whiteSpace: 'nowrap',
            }}
          >
            {categories.map((c) => {
              const Icon = c.icon;
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.8rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.76rem',
                    fontWeight: isActive ? 700 : 500,
                    border: isActive
                      ? '1px solid var(--text-primary)'
                      : '1px solid var(--border-default)',
                    backgroundColor: isActive ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={13} />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable FAQ Accordion List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {language === 'en'
                  ? 'No questions matched your search.'
                  : 'Tidak ditemukan pertanyaan yang cocok dengan pencarian Anda.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
              >
                {language === 'en' ? 'Reset Search' : 'Reset Pencarian'}
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: isExpanded
                      ? 'var(--bg-surface-elevated)'
                      : 'var(--bg-surface)',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>{item.question}</span>
                    <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 1.15rem 1.15rem',
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '0.85rem',
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pinned Contact Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {language === 'en'
              ? 'Need further help? Ticketify support team is ready to serve you 24/7.'
              : 'Butuh bantuan lebih lanjut? Tim support Ticketify siap melayani Anda 24/7.'}
          </div>
          <div style={{ display: 'flex', gap: '0.55rem' }}>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Ticketify,%20saya%20butuh%20bantuan%20mengenai%20tiket"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                height: '34px',
                fontSize: '0.76rem',
                gap: '0.35rem',
                textDecoration: 'none',
                color: '#10b981',
              }}
            >
              <MessageCircle size={14} />
              <span>WhatsApp Support</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{ height: '34px', fontSize: '0.76rem', padding: '0 1.25rem' }}
            >
              {language === 'en' ? 'Close' : 'Tutup'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .faq-modal-content {
            border-radius: var(--radius-lg) !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
