'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type Language = 'id' | 'en';

export interface Translations {
  // Navigation
  nav: {
    searchPlaceholder: string;
    adminPanel: string;
    adminDashboard: string;
    createEvent: string;
    manageEvents: string;
    ordersList: string;
    myTickets: string;
    savedWishlist: string;
    accountSettings: string;
    logout: string;
    loginRegister: string;
    lightMode: string;
    darkMode: string;
    switchLang: string;
  };
  // Hero section
  hero: {
    scheduleBadge: string;
    titleStart: string;
    titleGradient: string;
    titleEnd: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    viewDetails: string;
    buyTickets: string;
    ticketsLeft: string;
    soldOut: string;
    startingFrom: string;
    featuredEvent: string;
    categories: Record<string, string>;
    cities: Record<string, string>;
    allCities: string;
  };
  // Catalog / Events page
  catalog: {
    allEventsTitle: string;
    categoryPrefix: string;
    showingEvents: (count: number) => string;
    resetFilter: string;
    noEventsTitle: string;
    noEventsDesc: string;
    showAllButton: string;
    startingFrom: string;
    available: string;
    fewLeft: string;
    book: string;
    concertDetails: string;
  };
  // Event Detail Modal
  eventDetail: {
    concertDetails: string;
    tabTickets: string;
    tabSeating: string;
    tabTerms: string;
    tabSeatingAdmin: string;
    tabTermsAdmin: string;
    selectTier: string;
    ticketAmount: string;
    maxTickets: string;
    quotaLeft: string;
    soldOut: string;
    includedPerks: string;
    totalPrice: string;
    bookNow: string;
    saveEvent: string;
    saved: string;
    artistLineup: string;
    eventDescription: string;
    termsTitle: string;
    organizer: string;
    stageLayoutNotice: string;
    adminActionNotice: string;
    editEventButton: string;
    available: string;
    tickets: string;
    perPerson: string;
    ticketQuantity: string;
    stageLayout: string;
    officialLayout: string;
    tierAndPrice: string;
    lineup: string;
    entryTerms: string;
    adminReviewMode: string;
    closePreview: string;
    cancel: string;
    proceedToPayment: string;
    adminPreview: string;
    closeModal: string;
  };
  // Login Prompt Modal
  loginPrompt: {
    title: string;
    description: string;
    savedNotice: string;
    loginButton: string;
    cancelButton: string;
  };
  // Checkout Modal
  checkout: {
    modalTitle: string;
    countdownNotice: string;
    step1: string;
    step2: string;
    step3: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    idNumberLabel: string;
    idNumberPlaceholder: string;
    idNumberHint: string;
    promoCodeLabel: string;
    promoPlaceholder: string;
    applyPromo: string;
    summaryTitle: string;
    ticketCategory: string;
    ticketQuantity: string;
    pricePerTicket: string;
    subtotal: string;
    promoDiscount: string;
    serviceFee: string;
    totalPayment: string;
    paymentMethodTitle: string;
    payNow: string;
    processing: string;
    secureNotice: string;
    whatsapp: string;
    identityNumber: string;
    identityPlaceholder: string;
    paymentMethod: string;
    hasPromo: string;
    removeVoucher: string;
    recommendedVouchers: string;
    ticketsCount: string;
    voucherDiscount: string;
    cancel: string;
    pay: string;
    sessionExpired: string;
    sessionExpiredDesc: string;
    authRequired: string;
    loginToBook: string;
    loginDesc: string;
    loginNow: string;
    fillAllData: string;
    bookingFailed: string;
    systemError: string;
    verifiedAccount: string;
    confirmOrder: string;
    countdownText: string;
    buyerData: string;
    fullName: string;
    email: string;
  };
  // E-Ticket Modal
  eticket: {
    title: string;
    bookingCode: string;
    showQrNotice: string;
    statusConfirmed: string;
    downloadPdf: string;
    saveImage: string;
    addToCalendar: string;
    ticketCategory: string;
    venue: string;
    date: string;
    buyerName: string;
    paymentMethod: string;
    totalAmount: string;
    officialETicket: string;
    paid: string;
    category: string;
    quantity: string;
    pax: string;
    scanAtEntrance: string;
    savingImage: string;
    downloadPng: string;
    printPdf: string;
    close: string;
  };
  // My Tickets
  myTickets: {
    title: string;
    searchPlaceholder: string;
    noTicketsTitle: string;
    noTicketsDesc: string;
    browseConcerts: string;
    viewTicket: string;
    ticketsSaved: string;
    noTickets: string;
    paid: string;
    viewQr: string;
  };
  // Saved Tickets (Wishlist)
  savedTickets: {
    title: string;
    noSavedTitle: string;
    noSavedDesc: string;
    exploreConcerts: string;
    bookNow: string;
    remove: string;
    wishlistCount: string;
    savedInAccount: string;
    savedInBrowser: string;
    login: string;
    noSaved: string;
    from: string;
    buyTicket: string;
    deleteTitle: string;
    delete: string;
    manageInDashboard: string;
  };
  // Auth Modal
  auth: {
    tabLogin: string;
    tabRegister: string;
    roleUser: string;
    roleAdmin: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    phoneLabel: string;
    idNumberLabel: string;
    confirmPasswordLabel: string;
    loginSubmit: string;
    registerSubmit: string;
    noAccount: string;
    hasAccount: string;
    registerNow: string;
    loginNow: string;
    demoNote: string;
    idNumberAdmin: string;
    idNumberUser: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    processing: string;
    loginHere: string;
    nameRequired: string;
    emailInvalid: string;
    passwordMin: string;
    passwordMismatch: string;
    registerError: string;
    welcomeTitle: string;
    registerTitle: string;
    welcomeSubtitle: string;
    registerSubtitle: string;
    chooseRole: string;
    loginAs: string;
    registerAs: string;
    roleUserDesc: string;
    roleAdminDesc: string;
    userRoleExplain: string;
    adminRoleExplain: string;
    demoAdmin: string;
    demoUser: string;
    oneClickLogin: string;
    fullName: string;
    fullNamePlaceholderAdmin: string;
    fullNamePlaceholder: string;
    email: string;
    phone: string;
    demoLoginError: string;
    fillEmailPassword: string;
    loginError: string;
  };
  // Footer
  footer: {
    officialTickets: string;
    officialTicketsDesc: string;
    instantETicket: string;
    instantETicketDesc: string;
    instantEticket: string;
    instantEticketDesc: string;
    support247: string;
    support247Desc: string;
    terms: string;
    privacy: string;
    faq: string;
    copyright: string;
  };
  // Chat Widget
  chat: {
    onlineTitle: string;
    virtualAssistant: string;
    suggestionsTitle: string;
    inputPlaceholder: string;
    sendTooltip: string;
    closeChat: string;
    newChat: string;
    closeOfferTitle: string;
    closeOfferBtn: string;
    continueChatBtn: string;
    disclaimer: string;
    assistantTitle: string;
    assistantSubtitle: string;
    newConversation: string;
    close: string;
    quickTopics: string;
    send: string;
    footerNotice: string;
    scrollToBottom: string;
    closeConversationBtn: string;
    keepAskingBtn: string;
  };
  // Toast notifications
  toast: {
    loginSuccessResume: (title: string) => string;
    loginRequiredNotice: string;
    paymentSuccessTitle: string;
    paymentSuccessText: (title: string, tier: string, code: string) => string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    nav: {
      searchPlaceholder: 'Cari konser atau artis...',
      adminPanel: 'Admin Panel',
      adminDashboard: 'Dashboard Admin',
      createEvent: 'Buat Event Baru',
      manageEvents: 'Kelola Event & Kuota',
      ordersList: 'Daftar Pesanan Tiket',
      myTickets: 'Daftar Tiket Saya',
      savedWishlist: 'Konser Tersimpan (Wishlist)',
      accountSettings: 'Pengaturan Akun',
      logout: 'Keluar (Logout)',
      loginRegister: 'Masuk / Daftar',
      lightMode: 'Ganti ke Light Mode',
      darkMode: 'Ganti ke Dark Mode',
      switchLang: 'Ganti ke English',
    },
    hero: {
      scheduleBadge: 'Jadwal Konser & Acara 2026',
      titleStart: 'Pesan Tiket ',
      titleGradient: 'Konser & Acara',
      titleEnd: ' Pilihanmu.',
      subtitle: 'Platform resmi pemesanan tiket pertunjukan musik dan festival dengan E-Ticket instan ber-QR code.',
      searchPlaceholder: 'Cari konser atau artis favorit...',
      searchButton: 'Cari Acara',
      viewDetails: 'Lihat Detail',
      buyTickets: 'Beli Tiket Sekarang',
      ticketsLeft: 'Sisa Tiket',
      soldOut: 'Tiket Habis',
      startingFrom: 'Mulai dari',
      featuredEvent: 'Featured Event',
      categories: {
        All: 'Semua',
        Concert: 'Konser Musik',
        Festival: 'Festival',
        Theater: 'Seni & Teater',
        Comedy: 'Standup Comedy',
        Conference: 'Konferensi',
      },
      cities: {
        Jakarta: 'Jakarta',
        Bandung: 'Bandung',
        Surabaya: 'Surabaya',
        Tangerang: 'Tangerang',
        Bali: 'Bali',
      },
      allCities: 'Semua Kota',
    },
    catalog: {
      allEventsTitle: 'Semua Konser & Acara',
      categoryPrefix: 'Kategori: ',
      showingEvents: (count: number) => `Menampilkan ${count} pertunjukan musik pilihan terbaik`,
      resetFilter: 'Reset Filter',
      noEventsTitle: 'Tidak ada konser yang ditemukan',
      noEventsDesc: 'Coba sesuaikan kata kunci pencarian atau ubah filter kategori dan kota.',
      showAllButton: 'Tampilkan Semua Acara',
      startingFrom: 'Mulai dari',
      available: 'Tersedia',
      fewLeft: 'Sisa Sedikit',
      book: 'Pesan',
      concertDetails: 'Detail Konser',
    },
    eventDetail: {
      concertDetails: 'Detail Konser',
      tabTickets: 'Pilih Tiket',
      tabSeating: 'Denah Kursi',
      tabTerms: 'Ketentuan & Info',
      tabSeatingAdmin: 'Denah Kursi & Tata Panggung',
      tabTermsAdmin: 'Ketentuan & Info Acara',
      selectTier: 'Pilih Kategori Tiket',
      ticketAmount: 'Jumlah Tiket',
      maxTickets: 'Maks. 4 tiket per akun',
      quotaLeft: 'Sisa kuota',
      soldOut: 'Habis',
      includedPerks: 'Keuntungan Kategori:',
      totalPrice: 'Total Harga',
      bookNow: 'Pesan Tiket Sekarang',
      saveEvent: 'Simpan ke Wishlist',
      saved: 'Tersimpan di Wishlist',
      artistLineup: 'Lineup Artis & Bintang Tamu',
      eventDescription: 'Deskripsi Acara',
      termsTitle: 'Syarat & Ketentuan Masuk',
      organizer: 'Penyelenggara Resmi',
      stageLayoutNotice: 'Peta venue dan tata panggung resmi dari promotor acara.',
      adminActionNotice: 'Anda masuk sebagai Admin Promotor.',
      editEventButton: 'Edit Konser Ini di Panel Admin',
      available: 'Tersedia',
      tickets: 'tiket',
      perPerson: 'per orang',
      ticketQuantity: 'Jumlah Tiket',
      stageLayout: 'Denah Kursi & Panggung',
      officialLayout: 'Tata letak resmi panggung',
      tierAndPrice: 'Kategori Tiket & Harga',
      lineup: 'Lineup Artis & Tamu Spesial',
      entryTerms: 'Syarat & Ketentuan Masuk',
      adminReviewMode: 'Mode Pratinjau Promotor Admin (Hanya Review)',
      closePreview: 'Tutup Pratinjau',
      cancel: 'Batal',
      proceedToPayment: 'Lanjut ke Pembayaran',
      adminPreview: 'Pratinjau Admin',
      closeModal: 'Tutup modal',
    },
    loginPrompt: {
      title: 'Login Diperlukan',
      description: 'Kamu perlu login terlebih dahulu untuk memesan tiket. Setelah login, kamu akan langsung diarahkan ke halaman pembayaran.',
      savedNotice: 'Pilihan tiket kamu akan tetap tersimpan dan otomatis dilanjutkan setelah login berhasil.',
      loginButton: 'Login untuk Pesan Tiket',
      cancelButton: 'Batal, Kembali ke Daftar Konser',
    },
    checkout: {
      modalTitle: 'Pemesanan Tiket',
      countdownNotice: 'Selesaikan pemesanan Anda dalam',
      step1: 'Data Pembeli',
      step2: 'Ringkasan & Promo',
      step3: 'Pembayaran',
      fullNameLabel: 'Nama Lengkap (sesuai KTP/ID)',
      fullNamePlaceholder: 'cth. John Doe',
      emailLabel: 'Email Pengiriman E-Ticket',
      emailPlaceholder: 'cth. email@anda.com',
      phoneLabel: 'Nomor WhatsApp / HP',
      phonePlaceholder: 'cth. 08123456789',
      idNumberLabel: 'Nomor Identitas (NIK KTP / Paspor)',
      idNumberPlaceholder: 'cth. 3171012345670001',
      idNumberHint: 'Wajib asli untuk verifikasi wristband di venue.',
      promoCodeLabel: 'Punya Kode Promo / Voucher?',
      promoPlaceholder: 'Masukkan kode voucher (cth. KONSER2026)',
      applyPromo: 'Pasang',
      summaryTitle: 'Ringkasan Pesanan',
      ticketCategory: 'Kategori Tiket',
      ticketQuantity: 'Jumlah',
      pricePerTicket: 'Harga Satuan',
      subtotal: 'Subtotal Tiket',
      promoDiscount: 'Potongan Promo',
      serviceFee: 'Biaya Layanan Platform',
      totalPayment: 'Total Pembayaran',
      paymentMethodTitle: 'Pilih Metode Pembayaran',
      payNow: 'Bayar Sekarang',
      processing: 'Memproses Tiket...',
      secureNotice: 'Transaksi 100% aman dengan enkripsi bank berstandar industri.',
      whatsapp: 'Nomor WhatsApp / HP',
      identityNumber: 'Nomor Identitas (NIK KTP / Paspor)',
      identityPlaceholder: 'NIK KTP / Nomor Paspor',
      paymentMethod: 'Metode Pembayaran',
      hasPromo: 'Punya Kode Promo / Voucher?',
      removeVoucher: 'Hapus Voucher',
      recommendedVouchers: 'Voucher Rekomendasi (Klik untuk pasang):',
      ticketsCount: 'tiket',
      voucherDiscount: 'Potongan Voucher',
      cancel: 'Batal',
      pay: 'Bayar',
      sessionExpired: 'Waktu Pemesanan Habis',
      sessionExpiredDesc: 'Sesi checkout Anda telah berakhir. Silakan pilih kembali tiket yang ingin dipesan.',
      authRequired: 'Login Diperlukan',
      loginToBook: 'Masuk untuk Melanjutkan Pembayaran',
      loginDesc: 'Untuk mengamankan E-Ticket ber-QR code dan riwayat pesanan Anda, silakan login ke akun Ticketify terlebih dahulu.',
      loginNow: 'Masuk Sekarang',
      fillAllData: 'Mohon lengkapi semua data pembeli (Nama, Email, HP, dan No. Identitas).',
      bookingFailed: 'Pemesanan Gagal',
      systemError: 'Terjadi kesalahan sistem saat memproses pemesanan.',
      verifiedAccount: 'Akun Terverifikasi',
      confirmOrder: 'Konfirmasi Pesanan Tiket',
      countdownText: 'Selesaikan pemesanan Anda dalam:',
      buyerData: 'Data Pembeli Tiket',
      fullName: 'Nama Lengkap (sesuai ID/KTP)',
      email: 'Email Penerima E-Ticket',
    },
    eticket: {
      title: 'E-Ticket Resmi',
      bookingCode: 'Kode Booking',
      showQrNotice: 'Tunjukkan QR Code ini pada petugas gerbang penukaran wristband.',
      statusConfirmed: 'TERKONFIRMASI RESMI',
      downloadPdf: 'Unduh E-Ticket (PDF)',
      saveImage: 'Simpan Gambar (PNG)',
      addToCalendar: 'Google Calendar',
      ticketCategory: 'Kategori Tiket',
      venue: 'Lokasi Venue',
      date: 'Waktu Acara',
      buyerName: 'Nama Pemegang Tiket',
      paymentMethod: 'Metode Pembayaran',
      totalAmount: 'Total Dibayar',
      officialETicket: 'E-Ticket Resmi',
      paid: 'LUNAS',
      category: 'Kategori',
      quantity: 'Jumlah',
      pax: 'Pax',
      scanAtEntrance: 'SCAN SAAT MASUK KE VENUE',
      savingImage: 'Menyimpan...',
      downloadPng: 'Simpan Gambar (PNG)',
      printPdf: 'Cetak / Simpan PDF',
      close: 'Tutup',
    },
    myTickets: {
      title: 'Daftar Tiket Saya',
      searchPlaceholder: 'Cari tiket berdasarkan kode atau judul...',
      noTicketsTitle: 'Belum Ada Tiket yang Dipesan',
      noTicketsDesc: 'Kamu belum memesan tiket konser apapun. Yuk cari konser impianmu sekarang!',
      browseConcerts: 'Jelajahi Konser',
      viewTicket: 'Lihat E-Ticket',
      ticketsSaved: 'tiket tersimpan',
      noTickets: 'Belum Ada Tiket yang Dipesan',
      paid: 'LUNAS',
      viewQr: 'Lihat QR',
    },
    savedTickets: {
      title: 'Konser Tersimpan (Wishlist)',
      noSavedTitle: 'Belum Ada Konser Disimpan',
      noSavedDesc: 'Klik ikon bookmark pada kartu konser untuk menyimpannya ke daftar wishlist kamu.',
      exploreConcerts: 'Cari Konser Seru',
      bookNow: 'Pesan Tiket',
      remove: 'Hapus dari Wishlist',
      wishlistCount: 'konser tersimpan',
      savedInAccount: 'Tersimpan di akun',
      savedInBrowser: 'Tersimpan di browser ini (Mode Tamu)',
      login: 'Masuk untuk sinkronisasi',
      noSaved: 'Belum Ada Konser Disimpan',
      from: 'Mulai',
      buyTicket: 'Beli Tiket',
      deleteTitle: 'Hapus dari wishlist',
      delete: 'Hapus',
      manageInDashboard: 'Kelola semua di Dashboard',
    },
    auth: {
      tabLogin: 'Masuk',
      tabRegister: 'Daftar',
      roleUser: 'Pengguna / Penonton',
      roleAdmin: 'Admin Promotor',
      emailLabel: 'Alamat Email',
      passwordLabel: 'Kata Sandi',
      nameLabel: 'Nama Lengkap',
      phoneLabel: 'Nomor WhatsApp / HP',
      idNumberLabel: 'Nomor Identitas (NIK KTP / Paspor)',
      confirmPasswordLabel: 'Konfirmasi Kata Sandi',
      loginSubmit: 'Masuk Sekarang',
      registerSubmit: 'Daftar Akun Baru',
      noAccount: 'Belum punya akun Ticketify?',
      hasAccount: 'Sudah punya akun?',
      registerNow: 'Daftar sekarang',
      loginNow: 'Masuk sekarang',
      demoNote: 'Akun Demo: admin@ticketify.com (admin123) atau demo@ticketify.com (password123)',
      idNumberAdmin: 'Nomor Identifikasi Promotor (Admin)',
      idNumberUser: 'Nomor Identitas (NIK KTP / Paspor)',
      password: 'Kata Sandi',
      passwordPlaceholder: 'Minimal 6 karakter',
      confirmPassword: 'Konfirmasi Kata Sandi',
      confirmPasswordPlaceholder: 'Ulangi kata sandi',
      processing: 'Memproses...',
      loginHere: 'Masuk di sini',
      nameRequired: 'Nama lengkap wajib diisi',
      emailInvalid: 'Format email tidak valid',
      passwordMin: 'Password minimal 6 karakter',
      passwordMismatch: 'Konfirmasi kata sandi tidak cocok',
      registerError: 'Gagal melakukan registrasi',
      welcomeTitle: 'Selamat Datang Kembali!',
      registerTitle: 'Buat Akun Baru',
      welcomeSubtitle: 'Masuk ke akun Ticketify untuk memesan tiket & mengelola acara',
      registerSubtitle: 'Daftar sekarang untuk mulai memesan tiket konser resmi',
      chooseRole: 'Pilih Peran Akun',
      loginAs: 'Login sebagai',
      registerAs: 'Daftar sebagai',
      roleUserDesc: 'Penonton konser',
      roleAdminDesc: 'Promotor & manajemen event',
      userRoleExplain: 'Mode Penonton: Jelajahi, simpan wishlist, dan pesan tiket konser resmi dengan E-Ticket instan.',
      adminRoleExplain: 'Mode Admin Promotor: Buat event baru, kelola stok tiket & kategori harga, dan pantau penjualan.',
      demoAdmin: '1-Click Demo Login (Admin Promotor)',
      demoUser: '1-Click Demo Login (Penonton)',
      oneClickLogin: 'Coba Demo',
      fullName: 'Nama Lengkap',
      fullNamePlaceholderAdmin: 'Nama Lengkap / Nama Promotor',
      fullNamePlaceholder: 'cth. Budi Santoso',
      email: 'Alamat Email',
      phone: 'Nomor WhatsApp / HP',
      demoLoginError: 'Gagal masuk dengan akun demo',
      fillEmailPassword: 'Email dan kata sandi wajib diisi',
      loginError: 'Gagal masuk, periksa email dan kata sandi Anda',
    },
    footer: {
      officialTickets: '100% Tiket Resmi',
      officialTicketsDesc: 'Bekerja sama langsung dengan promotor resmi terverifikasi.',
      instantETicket: 'E-Ticket Instan',
      instantETicketDesc: 'QR code resmi terbit seketika saat pembayaran selesai.',
      instantEticket: 'E-Ticket Instan',
      instantEticketDesc: 'QR code resmi terbit seketika saat pembayaran selesai.',
      support247: 'Bantuan 24/7',
      support247Desc: 'Layanan pelanggan responsif untuk setiap penonton.',
      terms: 'Syarat & Ketentuan',
      privacy: 'Kebijakan Privasi',
      faq: 'Pusat Bantuan (FAQ)',
      copyright: `© ${new Date().getFullYear()} Ticketify. Hak Cipta Dilindungi.`,
    },
    chat: {
      onlineTitle: 'Online — Asisten Ticketify',
      virtualAssistant: 'Asisten Virtual',
      suggestionsTitle: 'Saran Topik Cepat:',
      inputPlaceholder: 'Tanya Tixi apa saja (bebas ketik)...',
      sendTooltip: 'Kirim pesan',
      closeChat: 'Tutup',
      newChat: 'Mulai percakapan baru',
      closeOfferTitle: 'Tawaran Selesai',
      closeOfferBtn: 'Ya, tutup obrolan',
      continueChatBtn: 'Masih ada pertanyaan',
      disclaimer: 'Tixi AI siap membantu seputar konser & tiket di Ticketify.',
      assistantTitle: 'Tanya Tixi AI',
      assistantSubtitle: 'Online — Asisten Resmi Ticketify',
      newConversation: 'Mulai percakapan baru',
      close: 'Tutup',
      quickTopics: 'Topik Populer',
      send: 'Kirim pesan',
      footerNotice: 'Tixi adalah asisten AI resmi Ticketify. Respons digenerate secara otomatis.',
      scrollToBottom: 'Gulir ke bawah',
      closeConversationBtn: 'Ya, tutup obrolan',
      keepAskingBtn: 'Masih ada pertanyaan',
    },
    toast: {
      loginSuccessResume: (title: string) => `Login berhasil! Langsung melanjutkan pembayaran tiket ${title}`,
      loginRequiredNotice: 'Silakan login terlebih dahulu. Tiket pilihanmu akan otomatis dilanjutkan setelah login.',
      paymentSuccessTitle: 'Pembayaran Berhasil! 🎉',
      paymentSuccessText: (title: string, tier: string, code: string) =>
        `Tiket konser "${title}" (${tier}) dengan kode ${code} berhasil diterbitkan. Silakan cek E-Ticket Anda.`,
    },
  },
  en: {
    nav: {
      searchPlaceholder: 'Search concerts or artists...',
      adminPanel: 'Admin Panel',
      adminDashboard: 'Admin Dashboard',
      createEvent: 'Create New Event',
      manageEvents: 'Manage Events & Quotas',
      ordersList: 'Ticket Orders List',
      myTickets: 'My Tickets List',
      savedWishlist: 'Saved Concerts (Wishlist)',
      accountSettings: 'Account Settings',
      logout: 'Sign Out',
      loginRegister: 'Sign In / Register',
      lightMode: 'Switch to Light Mode',
      darkMode: 'Switch to Dark Mode',
      switchLang: 'Switch to Bahasa Indonesia',
    },
    hero: {
      scheduleBadge: '2026 Concert & Event Lineup',
      titleStart: 'Book Tickets to ',
      titleGradient: 'Concerts & Events',
      titleEnd: ' You Love.',
      subtitle: 'The official ticket booking platform for music shows and festivals with instant QR code E-Tickets.',
      searchPlaceholder: 'Search your favorite artist or event...',
      searchButton: 'Search Events',
      viewDetails: 'View Details',
      buyTickets: 'Buy Tickets Now',
      ticketsLeft: 'Tickets Left',
      soldOut: 'Sold Out',
      startingFrom: 'Starting from',
      featuredEvent: 'Featured Event',
      categories: {
        All: 'All',
        Concert: 'Music Concerts',
        Festival: 'Festivals',
        Theater: 'Arts & Theater',
        Comedy: 'Standup Comedy',
        Conference: 'Conferences',
      },
      cities: {
        Jakarta: 'Jakarta',
        Bandung: 'Bandung',
        Surabaya: 'Surabaya',
        Tangerang: 'Tangerang',
        Bali: 'Bali',
      },
      allCities: 'All Cities',
    },
    catalog: {
      allEventsTitle: 'All Concerts & Events',
      categoryPrefix: 'Category: ',
      showingEvents: (count: number) => `Showing ${count} curated music experiences`,
      resetFilter: 'Reset Filters',
      noEventsTitle: 'No concerts found',
      noEventsDesc: 'Try adjusting your search query or changing category and city filters.',
      showAllButton: 'Show All Events',
      startingFrom: 'From',
      available: 'Available',
      fewLeft: 'Almost Gone',
      book: 'Book',
      concertDetails: 'Concert Details',
    },
    eventDetail: {
      concertDetails: 'Concert Details',
      tabTickets: 'Select Tickets',
      tabSeating: 'Seating Layout',
      tabTerms: 'Terms & Info',
      tabSeatingAdmin: 'Seating & Stage Layout',
      tabTermsAdmin: 'Event Terms & Guidelines',
      selectTier: 'Select Ticket Tier',
      ticketAmount: 'Ticket Quantity',
      maxTickets: 'Max 4 tickets per order',
      quotaLeft: 'Quota remaining',
      soldOut: 'Sold Out',
      includedPerks: 'Tier Privileges:',
      totalPrice: 'Total Price',
      bookNow: 'Book Tickets Now',
      saveEvent: 'Save to Wishlist',
      saved: 'Saved in Wishlist',
      artistLineup: 'Artist Lineup & Special Guests',
      eventDescription: 'Event Description',
      termsTitle: 'Terms & Entry Requirements',
      organizer: 'Official Organizer',
      stageLayoutNotice: 'Official venue and seating layout provided by promoter.',
      adminActionNotice: 'You are signed in as Promoter Admin.',
      editEventButton: 'Edit This Event in Admin Panel',
      available: 'Available',
      tickets: 'tickets',
      perPerson: 'per person',
      ticketQuantity: 'Ticket Quantity',
      stageLayout: 'Seating & Stage Layout',
      officialLayout: 'Official stage layout for',
      tierAndPrice: 'Ticket Tiers & Pricing',
      lineup: 'Artist Lineup & Special Guests',
      entryTerms: 'Terms & Conditions of Entry',
      adminReviewMode: 'Promoter Admin Preview Mode (Review Only)',
      closePreview: 'Close Preview',
      cancel: 'Cancel',
      proceedToPayment: 'Proceed to Payment',
      adminPreview: 'Admin Preview',
      closeModal: 'Close modal',
    },
    loginPrompt: {
      title: 'Sign In Required',
      description: 'You need to sign in before booking tickets. After signing in, you will be redirected straight to the checkout page.',
      savedNotice: 'Your ticket selection will remain saved and automatically continue upon sign in.',
      loginButton: 'Sign In to Book Tickets',
      cancelButton: 'Cancel, Return to Concerts',
    },
    checkout: {
      modalTitle: 'Ticket Checkout',
      countdownNotice: 'Complete your booking within',
      step1: 'Buyer Info',
      step2: 'Summary & Promo',
      step3: 'Payment',
      fullNameLabel: 'Full Name (as per ID/Passport)',
      fullNamePlaceholder: 'e.g. John Doe',
      emailLabel: 'E-Ticket Delivery Email',
      emailPlaceholder: 'e.g. email@example.com',
      phoneLabel: 'WhatsApp / Mobile Number',
      phonePlaceholder: 'e.g. 08123456789',
      idNumberLabel: 'ID Number (National ID / Passport)',
      idNumberPlaceholder: 'e.g. 3171012345670001',
      idNumberHint: 'Required for wristband collection at the venue.',
      promoCodeLabel: 'Have a Promo Code or Voucher?',
      promoPlaceholder: 'Enter voucher code (e.g. KONSER2026)',
      applyPromo: 'Apply',
      summaryTitle: 'Order Summary',
      ticketCategory: 'Ticket Tier',
      ticketQuantity: 'Quantity',
      pricePerTicket: 'Price per Ticket',
      subtotal: 'Ticket Subtotal',
      promoDiscount: 'Promo Discount',
      serviceFee: 'Platform Service Fee',
      totalPayment: 'Total Payment',
      paymentMethodTitle: 'Select Payment Method',
      payNow: 'Pay Now',
      processing: 'Processing Tickets...',
      secureNotice: '100% secure transaction with industry-standard bank encryption.',
      whatsapp: 'WhatsApp / Mobile Number',
      identityNumber: 'Identity Number (ID / Passport)',
      identityPlaceholder: 'National ID / Passport Number',
      paymentMethod: 'Payment Method',
      hasPromo: 'Have a Promo Code or Voucher?',
      removeVoucher: 'Remove Voucher',
      recommendedVouchers: 'Recommended Vouchers (Click to apply):',
      ticketsCount: 'tickets',
      voucherDiscount: 'Voucher Discount',
      cancel: 'Cancel',
      pay: 'Pay',
      sessionExpired: 'Booking Session Expired',
      sessionExpiredDesc: 'Your checkout session has expired. Please reselect the tickets you wish to purchase.',
      authRequired: 'Sign In Required',
      loginToBook: 'Sign In to Proceed to Payment',
      loginDesc: 'To secure your QR code E-Ticket and order history, please sign in to your Ticketify account first.',
      loginNow: 'Sign In Now',
      fillAllData: 'Please fill in all buyer information (Name, Email, Phone, and ID Number).',
      bookingFailed: 'Booking Failed',
      systemError: 'A system error occurred while processing your booking.',
      verifiedAccount: 'Verified Account',
      confirmOrder: 'Confirm Ticket Order',
      countdownText: 'Complete your booking within:',
      buyerData: 'Ticket Buyer Information',
      fullName: 'Full Name (as per ID/Passport)',
      email: 'E-Ticket Recipient Email',
    },
    eticket: {
      title: 'Official E-Ticket',
      bookingCode: 'Booking Code',
      showQrNotice: 'Present this QR Code at the gate for wristband check-in.',
      statusConfirmed: 'OFFICIALLY CONFIRMED',
      downloadPdf: 'Download E-Ticket (PDF)',
      saveImage: 'Save Image (PNG)',
      addToCalendar: 'Google Calendar',
      ticketCategory: 'Ticket Category',
      venue: 'Venue Location',
      date: 'Event Time',
      buyerName: 'Ticket Holder Name',
      paymentMethod: 'Payment Method',
      totalAmount: 'Total Paid',
      officialETicket: 'Official E-Ticket',
      paid: 'PAID',
      category: 'Category',
      quantity: 'Quantity',
      pax: 'Pax',
      scanAtEntrance: 'SCAN UPON ENTRANCE TO VENUE',
      savingImage: 'Saving...',
      downloadPng: 'Save Image (PNG)',
      printPdf: 'Print / Save PDF',
      close: 'Close',
    },
    myTickets: {
      title: 'My Tickets',
      searchPlaceholder: 'Search tickets by code or title...',
      noTicketsTitle: 'No Tickets Booked Yet',
      noTicketsDesc: "You haven't purchased any tickets yet. Explore your dream concerts today!",
      browseConcerts: 'Browse Concerts',
      viewTicket: 'View E-Ticket',
      ticketsSaved: 'tickets booked',
      noTickets: 'No Tickets Booked Yet',
      paid: 'PAID',
      viewQr: 'View QR',
    },
    savedTickets: {
      title: 'Saved Concerts (Wishlist)',
      noSavedTitle: 'No Saved Concerts Yet',
      noSavedDesc: 'Click the bookmark icon on any concert card to save it to your wishlist.',
      exploreConcerts: 'Explore Exciting Concerts',
      bookNow: 'Book Tickets',
      remove: 'Remove from Wishlist',
      wishlistCount: 'saved concerts',
      savedInAccount: 'Saved to account',
      savedInBrowser: 'Saved in this browser (Guest Mode)',
      login: 'Sign in to sync',
      noSaved: 'No Saved Concerts Yet',
      from: 'From',
      buyTicket: 'Buy Ticket',
      deleteTitle: 'Remove from saved wishlist',
      delete: 'Remove',
      manageInDashboard: 'Manage all in Dashboard',
    },
    auth: {
      tabLogin: 'Sign In',
      tabRegister: 'Register',
      roleUser: 'Attendee / User',
      roleAdmin: 'Promoter Admin',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      nameLabel: 'Full Name',
      phoneLabel: 'WhatsApp / Phone Number',
      idNumberLabel: 'Identity Number (ID / Passport)',
      confirmPasswordLabel: 'Confirm Password',
      loginSubmit: 'Sign In Now',
      registerSubmit: 'Create New Account',
      noAccount: "Don't have a Ticketify account?",
      hasAccount: 'Already have an account?',
      registerNow: 'Register here',
      loginNow: 'Sign in here',
      demoNote: 'Demo Accounts: admin@ticketify.com (admin123) or demo@ticketify.com (password123)',
      idNumberAdmin: 'Promoter Identification Number (Admin)',
      idNumberUser: 'Identity Number (ID / Passport)',
      password: 'Password',
      passwordPlaceholder: 'Minimum 6 characters',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Repeat password',
      processing: 'Processing...',
      loginHere: 'Sign in here',
      nameRequired: 'Full name is required',
      emailInvalid: 'Invalid email address format',
      passwordMin: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match',
      registerError: 'Registration failed',
      welcomeTitle: 'Welcome Back!',
      registerTitle: 'Create New Account',
      welcomeSubtitle: 'Sign in to Ticketify to book tickets & manage events',
      registerSubtitle: 'Register now to start booking official concert tickets',
      chooseRole: 'Select Account Role',
      loginAs: 'Sign in as',
      registerAs: 'Register as',
      roleUserDesc: 'Concert attendee',
      roleAdminDesc: 'Promoter & event manager',
      userRoleExplain: 'Attendee Mode: Browse, save wishlists, and book official tickets with instant QR E-Tickets.',
      adminRoleExplain: 'Promoter Admin Mode: Create new events, manage ticket stocks & pricing tiers, and monitor sales.',
      demoAdmin: '1-Click Demo Sign In (Promoter Admin)',
      demoUser: '1-Click Demo Sign In (Attendee)',
      oneClickLogin: 'Try Demo',
      fullName: 'Full Name',
      fullNamePlaceholderAdmin: 'Full Name / Promoter Name',
      fullNamePlaceholder: 'e.g. John Doe',
      email: 'Email Address',
      phone: 'WhatsApp / Mobile Number',
      demoLoginError: 'Failed to sign in with demo account',
      fillEmailPassword: 'Email and password are required',
      loginError: 'Failed to sign in, please check your email and password',
    },
    footer: {
      officialTickets: '100% Official Tickets',
      officialTicketsDesc: 'Direct partnerships with verified official concert promoters.',
      instantETicket: 'Instant E-Tickets',
      instantETicketDesc: 'Official QR codes issued immediately upon payment completion.',
      instantEticket: 'Instant E-Tickets',
      instantEticketDesc: 'Official QR codes issued immediately upon payment completion.',
      support247: '24/7 Support',
      support247Desc: 'Responsive customer assistance for every concert-goer.',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      faq: 'Help Center (FAQ)',
      copyright: `© ${new Date().getFullYear()} Ticketify. All Rights Reserved.`,
    },
    chat: {
      onlineTitle: 'Online — Ticketify Assistant',
      virtualAssistant: 'Virtual Assistant',
      suggestionsTitle: 'Quick Topic Suggestions:',
      inputPlaceholder: 'Ask Tixi anything (type freely)...',
      sendTooltip: 'Send message',
      closeChat: 'Close',
      newChat: 'Start new conversation',
      closeOfferTitle: 'Closing Offer',
      closeOfferBtn: 'Yes, close chat',
      continueChatBtn: 'I still have questions',
      disclaimer: 'Tixi AI is ready to help you with concerts and tickets on Ticketify.',
      assistantTitle: 'Ask Tixi AI',
      assistantSubtitle: 'Online — Ticketify Official Assistant',
      newConversation: 'Start new conversation',
      close: 'Close',
      quickTopics: 'Popular Topics',
      send: 'Send message',
      footerNotice: 'Tixi is Ticketify official AI assistant. Responses are generated automatically.',
      scrollToBottom: 'Scroll to bottom',
      closeConversationBtn: 'Yes, close chat',
      keepAskingBtn: 'I have more questions',
    },
    toast: {
      loginSuccessResume: (title: string) => `Signed in successfully! Resuming checkout for ${title}`,
      loginRequiredNotice: 'Please sign in first. Your selected tickets will resume automatically upon signing in.',
      paymentSuccessTitle: 'Payment Successful! 🎉',
      paymentSuccessText: (title: string, tier: string, code: string) =>
        `Concert ticket "${title}" (${tier}) with booking code ${code} was successfully issued. Check your E-Ticket now.`,
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ticketify-language') as Language;
    if (saved === 'id' || saved === 'en') {
      setLanguageState(saved);
      document.documentElement.setAttribute('lang', saved);
    } else {
      document.documentElement.setAttribute('lang', 'id');
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('ticketify-language', newLang);
      document.documentElement.setAttribute('lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((curr) => {
      const next: Language = curr === 'id' ? 'en' : 'id';
      try {
        localStorage.setItem('ticketify-language', next);
        document.documentElement.setAttribute('lang', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useMemo(() => translations[language], [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
