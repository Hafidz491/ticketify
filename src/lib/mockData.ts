import { IEvent } from './types';

export const INITIAL_EVENTS: IEvent[] = [
  {
    _id: 'evt-101',
    title: 'Coldplay: Music of the Spheres World Tour',
    slug: 'coldplay-music-of-the-spheres-jakarta',
    artist: 'Coldplay',
    category: 'Concert',
    date: '2026-11-15',
    time: '19:30 WIB',
    venue: 'Stadion Utama Gelora Bung Karno (GBK)',
    city: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    description: 'Kembalinya Coldplay ke panggung megah GBK Jakarta dengan aransemen spektakuler, gelang LED kinetic Xylobands, kembang api ramah lingkungan, dan lagu-lagu hits legendaris seperti Fix You, Yellow, Viva La Vida, hingga album terbaru.',
    lineup: ['Coldplay', 'Rahmania Astrini (Special Guest)', 'Chvrches'],
    terms: [
      'Minimal usia 14 tahun untuk area festival berdiri.',
      'Wajib membawa identitas resmi (KTP/SIM/Paspor) saat penukaran wristband.',
      'Dilarang membawa kamera profesional, laser, dan botol minum berbahan keras.',
      'E-Ticket tidak dapat dipindahtangankan tanpa surat kuasa bermeterai.'
    ],
    isFeatured: true,
    organizer: 'PK Entertainment & TEM Presents',
    ticketTiers: [
      {
        id: 'tier-1',
        name: 'Ultimate Experience (VIP)',
        price: 8500000,
        quota: 100,
        available: 18,
        perks: ['Akses panggung eksklusif', 'Soundcheck session', 'Official tour merchandise bundle', 'Lounge VIP & Free Flow Snack']
      },
      {
        id: 'tier-2',
        name: 'Festival A (Standing Front Stage)',
        price: 3200000,
        quota: 1500,
        available: 142,
        perks: ['Area berdiri paling depan panggung', 'Early entry 1 jam lebih awal', 'Wristband eksklusif']
      },
      {
        id: 'tier-3',
        name: 'CAT 1 (Numbered Seating)',
        price: 2600000,
        quota: 3000,
        available: 480,
        perks: ['Tempat duduk bernomor tier bawah', 'Sudut pandang panggung lurus dan jernih']
      },
      {
        id: 'tier-4',
        name: 'CAT 2 (General Tribune)',
        price: 1450000,
        quota: 5000,
        available: 920,
        perks: ['Tempat duduk tribun tengah', 'Akses audio visual optimal']
      }
    ]
  },
  {
    _id: 'evt-102',
    title: 'Bruno Mars: Live in Jakarta 2026',
    slug: 'bruno-mars-live-in-jakarta',
    artist: 'Bruno Mars',
    category: 'Concert',
    date: '2026-10-24',
    time: '20:00 WIB',
    venue: 'Jakarta International Stadium (JIS)',
    city: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    description: 'Penyanyi peraih 15 Grammy Awards Bruno Mars hadir memukau ribuan penggemar dengan vokal emas, tarian memikat, dan irama funk-pop enerjik dari 24K Magic, Uptown Funk, Versace on the Floor, hingga Leave the Door Open.',
    lineup: ['Bruno Mars', 'The Hooligans'],
    terms: [
      'Satu transaksi maksimal pembelian 4 tiket.',
      'Penonton wajib mengenakan alas kaki tertutup.',
      'Pintu gerbang dibuka mulai pukul 16:00 WIB.'
    ],
    isFeatured: true,
    organizer: 'Live Nation & PK Entertainment',
    ticketTiers: [
      {
        id: 'bm-tier-1',
        name: 'Gold VIP Package',
        price: 7200000,
        quota: 200,
        available: 35,
        perks: ['VIP Reserved Seating Terbaik', 'Laminated VIP Pass & Lanyard', 'Merchandise Khusus', 'Jalur Masuk Khusus']
      },
      {
        id: 'bm-tier-2',
        name: 'Festival Standing',
        price: 2850000,
        quota: 2500,
        available: 310,
        perks: ['Area berdiri dekat catwalk panggung', 'Aura konser maksimal']
      },
      {
        id: 'bm-tier-3',
        name: 'CAT 1 Seated',
        price: 2100000,
        quota: 4000,
        available: 580,
        perks: ['Numbered Seating nyaman tribun barat']
      },
      {
        id: 'bm-tier-4',
        name: 'CAT 3 Upper Tribune',
        price: 1100000,
        quota: 6000,
        available: 1200,
        perks: ['Numbered Seating tribun atas dengan panorama penuh JIS']
      }
    ]
  },
  {
    _id: 'evt-103',
    title: 'NIKI: The Buzz World Tour - Asia Finale',
    slug: 'niki-the-buzz-world-tour-jakarta',
    artist: 'NIKI (Nicole Zefanya)',
    category: 'Concert',
    date: '2026-12-05',
    time: '19:00 WIB',
    venue: 'ICE BSD Hall 5-6',
    city: 'Tangerang',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    description: 'Penyanyi dan penulis lagu kebanggaan Indonesia, NIKI, kembali pulang dengan penampilan termegah untuk menutup tur dunia album terbarunya "Buzz". Bersiap bernyanyi bersama untuk Oceans & Engines, Lowkey, Backburner, dan High School in Jakarta.',
    lineup: ['NIKI', 'Special Opening Acts from 88rising'],
    terms: [
      'Semua kategori festival berdiri bebas.',
      'Dilarang membawa banner berukuran lebih dari A4.',
      'Sediakan kartu vaksinasi / sertifikat kesehatan bila diperlukan.'
    ],
    isFeatured: true,
    organizer: '88rising & AEG Presents',
    ticketTiers: [
      {
        id: 'niki-1',
        name: 'Early Bird Festival',
        price: 950000,
        quota: 1000,
        available: 12,
        perks: ['Tiket festival dengan harga spesial', 'Akses masuk reguler']
      },
      {
        id: 'niki-2',
        name: 'General Admission (GA)',
        price: 1350000,
        quota: 3500,
        available: 420,
        perks: ['Akses seluruh area festival berdiri', 'Sensasi sing-along dekat panggung']
      },
      {
        id: 'niki-3',
        name: 'VIP Experience Pass',
        price: 2750000,
        quota: 300,
        available: 45,
        perks: ['Fast track queue', 'Priority front pit standing', 'Signed Tour Poster', 'Exclusive T-Shirt']
      }
    ]
  },
  {
    _id: 'evt-104',
    title: 'Sheila on 7: Tunggu Aku di Bandung 2026',
    slug: 'sheila-on-7-tunggu-aku-di-bandung',
    artist: 'Sheila on 7',
    category: 'Concert',
    date: '2026-10-10',
    time: '18:30 WIB',
    venue: 'Stadion Si Jalak Harupat',
    city: 'Bandung',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    description: 'Nostalgia tiada tara bersama Duta, Eross, dan Adam! Nyanyikan setiap lirik lagu masa remaja seperti Sephia, Dan, Melompat Lebih Tinggi, hingga Sahabat Sejati di bawah langit sejuk kota kembang Bandung.',
    lineup: ['Sheila on 7', 'Goodnight Electric', 'The Adams'],
    terms: [
      'Tiket yang sah hanya yang dibeli melalui platform resmi Ticketify.',
      'Anak di bawah 5 tahun tidak dianjurkan memasuki area festival demi keselamatan.'
    ],
    isFeatured: false,
    organizer: 'Antara Suara',
    ticketTiers: [
      {
        id: 'so7-1',
        name: 'Festival Berdiri (Reguler)',
        price: 550000,
        quota: 6000,
        available: 310,
        perks: ['Area rumput lapangan bola', 'Bebas berdiri dan bernyanyi']
      },
      {
        id: 'so7-2',
        name: 'Tribun VIP Barat',
        price: 850000,
        quota: 2000,
        available: 95,
        perks: ['Tempat duduk bernomor', 'Atap tribun terlindung', 'Snack box']
      },
      {
        id: 'so7-3',
        name: 'Tribun Timur & Utara',
        price: 400000,
        quota: 8000,
        available: 1100,
        perks: ['Tempat duduk tribun nyaman']
      }
    ]
  },
  {
    _id: 'evt-105',
    title: 'Jakarta International Java Jazz Festival 2026',
    slug: 'java-jazz-festival-2026',
    artist: 'Various International & Local Artists',
    category: 'Festival',
    date: '2026-11-20',
    time: '15:00 WIB',
    venue: 'JIEXPO Kemayoran',
    city: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    description: 'Festival jazz tahunan terbesar di belahan bumi selatan. Menampilkan lebih dari 10 panggung musik bersamaan dengan deretan musisi jazz, R&B, soul, funk legendaris dunia dan talenta lokal berbakat.',
    lineup: ['Laufey', 'Jacob Collier', 'Tom Misch', 'Maliq & D’Essentials', 'Kahitna', 'Andien'],
    terms: [
      'Tiket 3-Day Pass berlaku untuk semua stage umum.',
      'Special Show membutuhkan tiket tambahan tersendiri.',
      'Gelang RFID wajib di-tap di setiap gerbang panggung.'
    ],
    isFeatured: false,
    organizer: 'Java Festival Production',
    ticketTiers: [
      {
        id: 'jj-1',
        name: 'Daily Pass (Friday)',
        price: 750000,
        quota: 3000,
        available: 640,
        perks: ['Akses seluruh stage umum hari Jumat']
      },
      {
        id: 'jj-2',
        name: 'Daily Pass (Saturday)',
        price: 900000,
        quota: 3500,
        available: 480,
        perks: ['Akses seluruh stage umum hari Sabtu (Prime Day)']
      },
      {
        id: 'jj-3',
        name: '3-Day Full Pass Package',
        price: 1850000,
        quota: 2500,
        available: 215,
        perks: ['Akses penuh Jumat, Sabtu, Minggu', 'Hemat 30%', 'Merchandise Pin Edisi 2026']
      }
    ]
  },
  {
    _id: 'evt-106',
    title: 'Dewa 19 Featuring All Stars: Stadium Tour 2026',
    slug: 'dewa-19-all-stars-surabaya',
    artist: 'Dewa 19 feat. Ari Lasso, Once Mekel, Ello, Virzha',
    category: 'Concert',
    date: '2026-12-12',
    time: '19:00 WIB',
    venue: 'Stadion Gelora Bung Tomo',
    city: 'Surabaya',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80',
    description: 'Konser stadion kolosal persembahan Ahmad Dhani dan Dewa 19 berkolaborasi dengan gitaris dan vokalis rock legendaris Amerika & dunia. Lebih dari 35 lagu hits sepanjang 3 dekade.',
    lineup: ['Dewa 19', 'Ari Lasso', 'Once Mekel', 'Virzha', 'Ello', 'Dino Jelusick', 'Derek Sherinian'],
    terms: [
      'Pemeriksaan tas ketat di gerbang stadion.',
      'Anak di bawah usia 12 tahun wajib didampingi orang tua berbayar.'
    ],
    isFeatured: false,
    organizer: 'Otello Asia',
    ticketTiers: [
      {
        id: 'dewa-1',
        name: 'Festival Reguler',
        price: 520000,
        quota: 5000,
        available: 840,
        perks: ['Area lapangan berdiri']
      },
      {
        id: 'dewa-2',
        name: 'VIP West Grandstand',
        price: 1250000,
        quota: 1500,
        available: 160,
        perks: ['Numbered Seating VIP', 'Goodie Bag Baladewa']
      }
    ]
  }
];
