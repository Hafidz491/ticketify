export interface PromoCode {
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 15 for 15%) or fixed amount (e.g. 50000)
  maxDiscount?: number;
  minPurchase?: number;
}

export const AVAILABLE_PROMOS: PromoCode[] = [
  {
    code: 'TICKETIFYNEW',
    title: 'Diskon Pengguna Baru 15%',
    description: 'Diskon 15% s.d Rp 75.000 dengan min. transaksi Rp 200.000',
    type: 'percentage',
    value: 15,
    maxDiscount: 75000,
    minPurchase: 200000,
  },
  {
    code: 'PROMOHEMAT10',
    title: 'Hemat Asik 10%',
    description: 'Diskon 10% s.d Rp 100.000 tanpa minimum transaksi',
    type: 'percentage',
    value: 10,
    maxDiscount: 100000,
    minPurchase: 0,
  },
  {
    code: 'VIPSPECIAL',
    title: 'Potongan VIP Rp 150.000',
    description: 'Potongan langsung Rp 150.000 untuk pembelian minimal Rp 1.500.000',
    type: 'fixed',
    value: 150000,
    minPurchase: 1500000,
  },
  {
    code: 'KONSER2026',
    title: 'Flash Sale Konser 2026',
    description: 'Potongan flat Rp 50.000 untuk semua kategori tiket',
    type: 'fixed',
    value: 50000,
    minPurchase: 100000,
  },
];

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string;
  promo?: PromoCode;
}

export function validatePromoCode(rawCode: string, subtotal: number): PromoValidationResult {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      code: '',
      discountAmount: 0,
      message: 'Silakan masukkan kode promo.',
    };
  }

  const promo = AVAILABLE_PROMOS.find((p) => p.code === code);
  if (!promo) {
    return {
      valid: false,
      code,
      discountAmount: 0,
      message: 'Kode promo tidak ditemukan atau sudah kedaluwarsa.',
    };
  }

  if (promo.minPurchase && subtotal < promo.minPurchase) {
    return {
      valid: false,
      code,
      discountAmount: 0,
      message: `Minimum pembelian untuk voucher ini adalah Rp ${promo.minPurchase.toLocaleString('id-ID')}`,
      promo,
    };
  }

  let discount = 0;
  if (promo.type === 'percentage') {
    discount = Math.round((subtotal * promo.value) / 100);
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else {
    discount = promo.value;
  }

  // discount cannot exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return {
    valid: true,
    code: promo.code,
    discountAmount: discount,
    message: `Selamat! Voucher ${promo.code} berhasil dipasang (Hemat Rp ${discount.toLocaleString('id-ID')}).`,
    promo,
  };
}
