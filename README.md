# 🎟️ Ticketify — Fullstack Concert & Event Ticketing App

Platform pemesanan tiket konser musik dan pertunjukan acara terlengkap, dibangun dengan arsitektur fullstack modern menggunakan **Next.js (App Router)** dan **MongoDB (Mongoose)** dengan estetika minimalis serta dukungan **Light Mode & Dark Mode**.

---

## ✨ Fitur Utama

- 🎨 **Minimalist & Modern Aesthetic**:
  - Palet warna curated (*Electric Indigo*, *Deep Slate/Onyx*, *Neon Emerald & Cyan*).
  - Dual Mode: **Light Mode** & **Dark Mode** toggle dengan animasi halus dan persistensi `localStorage`.
  - Tipografi elegan menggunakan Google Fonts: **Plus Jakarta Sans** & **JetBrains Mono**.
  - Efek kartu *Glassmorphism*, *perforated ticket stubs* dengan cut-out notches khas tiket konser fisik.

- 🎪 **Katalog Konser & Pencarian Real-Time**:
  - Filter kategori instan (*Konser Musik*, *Festival*, *Seni & Teater*, *Standup Comedy*, *Konferensi*).
  - Filter berdasarkan kota (*Jakarta*, *Bandung*, *Surabaya*, *Tangerang*, *Bali*).
  - Pencarian real-time berdasarkan musisi, judul konser, atau nama gedung (venue).

- 🗺️ **Denah Panggung & Kursi Interaktif (Interactive Seating Map)**:
  - Visualisasi tata letak panggung (Stage Utama, VIP Soundcheck Pit, Festival Standing, Tribun Lengkung CAT 1 & 2).
  - Klik langsung pada area panggung untuk memilih kategori tiket.

- ⚡ **Sistem Pemesanan & Pembayaran Instan**:
  - Formulir data pembeli terverifikasi (Nama, Email, WhatsApp, No. KTP/Identitas).
  - Multi metode pembayaran: **QRIS Instant**, **Virtual Account** (BCA/Mandiri/BRI), dan **Kartu Kredit**.
  - Efek selebrasi confetti saat pembayaran berhasil.

- 🎫 **Official E-Ticket & Scannable QR Code**:
  - Terbit langsung secara otomatis setelah checkout.
  - Menghasilkan **QR Code dinamis beresolusi tinggi** untuk discan di gerbang konser.
  - Tombol **Cetak / Simpan PDF** ramah printer.

- 📋 **Tiket Saya (My Tickets)**:
  - Menyimpan riwayat tiket yang telah dibeli secara lokal dan di database.
  - Akses cepat untuk membuka kembali barcode E-Ticket kapan saja.

- ➕ **Organizer Portal (Buat Event Baru)**:
  - Tambahkan konser atau acara baru dengan fleksibilitas menambahkan kategori tiket, kuota, dan harga dinamis.

- 🗄️ **Fullstack MongoDB & Resilient Architecture**:
  - Menggunakan **Mongoose** schema untuk entitas `Event` dan `Booking`.
  - Dilengkapi sistem *fallback memory store* cerdas: jika MongoDB lokal belum berjalan, aplikasi tetap 100% aktif dan interaktif dengan data awal tanpa *crash*.

---

## 🚀 Cara Menjalankan

1. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
2. Buka browser dan kunjungi:
   ```
   http://localhost:3000
   ```

---

## ⚙️ Konfigurasi Database MongoDB

File `.env.local`:
```env
# Koneksi MongoDB (Bisa MongoDB lokal atau MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/ticketify

NEXT_PUBLIC_APP_NAME=Ticketify
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> *Catatan*: Jika `MONGODB_URI` belum dihubungkan ke server MongoDB aktif, aplikasi secara otomatis beralih ke in-memory mock store dengan data konser bawaan (*Coldplay, Bruno Mars, NIKI, Sheila on 7, Java Jazz, Dewa 19*).

---

## 📡 API Endpoints

- `GET /api/events` — Mengambil daftar konser (mendukung query `search`, `category`, `city`).
- `POST /api/events` — Menambahkan event/konser baru.
- `GET /api/events/[id]` — Mengambil detail spesifik satu event.
- `GET /api/bookings` — Mengambil riwayat pemesanan tiket (opsional query `email`).
- `POST /api/bookings` — Membuat pemesanan tiket dan menerbitkan kode booking + QR data.
- `GET /api/bookings/[id]` — Mengambil informasi E-Ticket berdasarkan kode booking.
- `POST /api/seed` — Me-reset atau me-refresh database dengan sampel konser terbaru.
