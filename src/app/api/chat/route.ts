import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllEvents } from '@/lib/dataStore';
import { AVAILABLE_PROMOS } from '@/lib/promos';

export const dynamic = 'force-dynamic';

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

function buildSystemPrompt(
  userName: string,
  isFirstResponse: boolean,
  eventsSummary: string,
  promosSummary: string,
  language: 'id' | 'en' = 'id'
): string {
  const isEn = language === 'en';
  const greetingRule = isFirstResponse
    ? isEn
      ? `PRIMARY MANDATORY RULE:
This is your first response to the user. You MUST start the first sentence of your response by greeting the user's name clearly EXACTLY ONCE at the very beginning of the response, namely: "Hello, ${userName}!".
NEVER repeat the greeting with the user's name more than once!`
      : `ATURAN WAJIB PALING UTAMA:
Ini adalah respon pertamamu kepada pengguna. Kamu HARUS mengawali kalimat pertama balasanmu dengan menyapa nama pengguna secara jelas CUKUP SATU KALI SAJA di awal respon, yaitu: "Halo, ${userName}!".
JANGAN PERNAH mengulang sapaan nama pengguna lebih dari satu kali!`
    : isEn
    ? `USER:
The user you are speaking with is named "${userName}".`
    : `PENGGUNA:
Pengguna yang sedang berbincang denganmu bernama "${userName}".`;

  const languageInstruction = isEn
    ? `LANGUAGE: You MUST reply entirely in natural, fluent, and friendly English. Respect British or American spelling.`
    : `BAHASA: Kamu HARUS membalas sepenuhnya dalam bahasa Indonesia yang santun, kasual-profesional, dan enak dibaca.`;

  return `You are "Tixi" 🎵 — Ticketify's smart, friendly, and interactive official AI assistant.
Ticketify is the leading ticketing platform for music concerts, festivals, theatre, comedy, sports, and entertainment in Indonesia.

${greetingRule}

${languageInstruction}

PERSONALITY & COMMUNICATION STYLE OF TIXI:
- Smart, interactive, enthusiastic, warm, and expressive like a good music buddy.
- Do not sound like a rigid FAQ bot! Answer custom typed queries smoothly and contextually.
- Chat casually when users want music recommendations, ask who you are, or say hi, connecting it to music and concerts on Ticketify.
- Use neat Markdown formatting: **bold** for emphasis, tidy bullet lists, and appropriate emojis to make it lively.
- If the user asks something completely outside Ticketify (e.g. calculus formulas, complex coding, politics), respond politely with a touch of humor and guide them back to music, concerts, or tickets on Ticketify.

CURRENT CONCERTS & EVENTS ON TICKETIFY:
${eventsSummary || 'Various top-tier artist concerts (Coldplay, Bruno Mars, Music Festivals, etc) in Jakarta, Bandung, Surabaya, Bali.'}

ACTIVE PROMO CODES ON TICKETIFY:
${promosSummary || '• TICKETIFYNEW (15% Off)\n• PROMOHEMAT10 (10% Off)\n• VIPSPECIAL (Rp 150,000 Off)\n• KONSER2026 (Flat Rp 50,000 Off)'}

COMPLETE TICKETIFY SYSTEM GUIDE:
1. Booking Steps:
   - Select an event on home page or use search/category filters.
   - Click "View Details" on the desired event.
   - Choose ticket tier (e.g. CAT 1, Festival, or VIP) and quantity.
   - Click "Book Now" (if not logged in, system prompts login/registration).
   - Apply promo voucher code if available.
   - Choose payment method and complete payment.
   - Official QR-coded E-Ticket is immediately issued and downloadable as PNG or PDF.
2. E-Ticket & Venue Gate Entrance:
   - E-Tickets are stored in "My Tickets" / User Dashboard.
   - Present the official QR Code at the venue check-in gate.
   - Attendees must bring original government photo ID.
3. Payment Options:
   - QRIS Instant (GoPay, OVO, Dana, ShopeePay, BCA Mobile, etc).
   - Bank Virtual Accounts (BCA, Mandiri, BNI, BRI).
4. Refund Policy:
   - All purchased tickets are strictly non-refundable, unless there is an official event cancellation by the promoters.
5. Support:
   - For promoter inquiries or support: contact admin@ticketify.com.`;
}

function generateSmartFallback(query: string, userName: string, isFirstResponse: boolean, language: 'id' | 'en' = 'id'): string {
  const isEn = language === 'en';
  const prefix = isFirstResponse ? (isEn ? `Hello, ${userName}! ` : `Halo, ${userName}! `) : '';
  const q = query.toLowerCase();

  if (isEn) {
    if (q.includes('promo') || q.includes('discount') || q.includes('voucher') || q.includes('code')) {
      return `${prefix}Great news! You can use these active promo codes on Ticketify:\n\n• **TICKETIFYNEW** — 15% off up to Rp 75,000 (new users)\n• **PROMOHEMAT10** — 10% off up to Rp 100,000 with no minimum spend\n• **VIPSPECIAL** — Direct Rp 150,000 discount on orders min. Rp 1,500,000\n• **KONSER2026** — Flat Rp 50,000 off for all ticket categories\n\nYou can enter the code in the *Promo Code* field during checkout! 🎟️✨`;
    }

    if (q.includes('coldplay')) {
      return `${prefix}For **Coldplay: Music of the Spheres World Tour** at Gelora Bung Karno (GBK) Main Stadium Jakarta, tickets are available in:\n\n• **Ultimate Experience (VIP)**: Rp 8,500,000\n• **Festival A (Standing Front Stage)**: Rp 3,200,000\n• **CAT 1 (Numbered Seating)**: Rp 2,600,000\n• **CAT 2 (General Tribune)**: Rp 1,450,000\n\nClick Coldplay on the home page to inspect the stage layout and book before tickets sell out! 🪐🌈`;
    }

    if (q.includes('bruno mars') || q.includes('bruno')) {
      return `${prefix}**Bruno Mars: Live in Jakarta 2026** at Jakarta International Stadium (JIS) is going to be spectacular! Available tiers:\n\n• **Gold VIP Package**: Rp 7,200,000\n• **Festival Standing**: Rp 2,850,000\n• **CAT 1 Seated**: Rp 2,100,000\n• **CAT 2 Seated**: Rp 1,250,000\n\nBook now by clicking *View Details* on the Bruno Mars card on Ticketify! 🕺✨`;
    }

    if (q.includes('how to book') || q.includes('buy ticket') || q.includes('order')) {
      return `${prefix}Booking tickets on Ticketify is quick and simple:\n\n1. Select your favorite concert on the home page.\n2. Click **View Details** to check tiers and seating blueprints.\n3. Choose ticket tier and quantity.\n4. Click **Book Now** (log in if you haven't yet).\n5. Enter a promo code (if any) and select your payment method (QRIS, Bank VA, etc).\n6. After payment completes, your official QR E-Ticket is immediately ready to view or download! 🎫`;
    }

    if (q.includes('refund') || q.includes('cancel')) {
      return `${prefix}Per promoter policies on Ticketify, paid tickets are **strictly non-refundable and non-cancellable**, unless the event is officially cancelled by the organizers. Please ensure your schedule and tier selection before checkout! 🙏`;
    }

    return `${prefix}Thank you for contacting Tixi! I can help you find upcoming concerts, check ticket categories, seating plans, promo codes, or booking steps. What would you like to know? 🎵`;
  }

  // Indonesian fallback
  if (q.includes('promo') || q.includes('diskon') || q.includes('voucher') || q.includes('potongan') || q.includes('hemat')) {
    return `${prefix}Ada kabar baik! Kamu bisa gunakan kode promo aktif di Ticketify berikut ini:\n\n• **TICKETIFYNEW** — Diskon 15% s.d Rp 75.000 (khusus pengguna baru)\n• **PROMOHEMAT10** — Diskon 10% s.d Rp 100.000 tanpa minimum belanja\n• **VIPSPECIAL** — Potongan langsung Rp 150.000 untuk transaksi min. Rp 1.500.000\n• **KONSER2026** — Potongan flat Rp 50.000 untuk semua kategori tiket\n\nKamu bisa langsung masukkan kodenya di bagian *Kode Promo* saat checkout tiket ya! 🎟️✨`;
  }

  if (q.includes('coldplay')) {
    return `${prefix}Untuk konser **Coldplay: Music of the Spheres World Tour** di Stadion Utama Gelora Bung Karno (GBK) Jakarta, tiket tersedia dalam beberapa kategori:\n\n• **Ultimate Experience (VIP)**: Rp 8.500.000\n• **Festival A (Standing Front Stage)**: Rp 3.200.000\n• **CAT 1 (Numbered Seating)**: Rp 2.600.000\n• **CAT 2 (General Tribune)**: Rp 1.450.000\n\nKamu bisa klik konser Coldplay di beranda untuk melihat denah panggung dan langsung pesan tiketmu sebelum kuotanya habis! 🪐🌈`;
  }

  if (q.includes('bruno mars') || q.includes('bruno')) {
    return `${prefix}Konser **Bruno Mars: Live in Jakarta 2026** di Jakarta International Stadium (JIS) hadir dengan pertunjukan spektakuler! Kategori tiket yang tersedia:\n\n• **Gold VIP Package**: Rp 7.200.000\n• **Festival Standing**: Rp 2.850.000\n• **CAT 1 Seated**: Rp 2.100.000\n• **CAT 2 Seated**: Rp 1.250.000\n\nPesan sekarang lewat tombol *Lihat Detail* pada poster Bruno Mars di beranda Ticketify ya! 🕺✨`;
  }

  if (q.includes('cara pesan') || q.includes('beli tiket') || q.includes('order')) {
    return `${prefix}Cara memesan tiket di Ticketify sangat mudah:\n\n1. Cari dan pilih konser yang ingin kamu tonton di beranda.\n2. Klik tombol **Lihat Detail** untuk melihat info lengkap dan denah panggung.\n3. Pilih tier/kategori tiket serta jumlah yang diinginkan.\n4. Klik **Pesan Sekarang** (login akun terlebih dahulu jika belum login).\n5. Masukkan kode promo (jika ada) dan pilih metode pembayaran (QRIS, VA Bank, dsb).\n6. Setelah pembayaran berhasil, E-Ticket ber-QR Code langsung terbit dan bisa diunduh! 🎫`;
  }

  if (q.includes('refund') || q.includes('batal') || q.includes('kembali uang')) {
    return `${prefix}Sesuai dengan ketentuan umum promotor di Ticketify, tiket yang sudah berhasil dibeli **tidak dapat di-refund atau dibatalkan**, kecuali jika ada pembatalan resmi acara dari pihak promotor/penyelenggara. Pastikan jadwal dan kategori yang kamu pilih sudah sesuai sebelum checkout ya! 🙏`;
  }

  if (q.includes('halo') || q.includes('hai') || q.includes('siapa kamu') || q.includes('pagi') || q.includes('siang') || q.includes('malam')) {
    return `${prefix}Saya **Tixi** 🎵, asisten AI resmi dari Ticketify! Saya siap membantu kamu mencari tiket konser terbaik, info harga tiket, promo potongan harga, hingga panduan seputar e-ticket.\n\nLagi ada konser atau musisi favorit yang pengen kamu tonton di Ticketify? Kasih tahu saya ya, biar saya bantu rekomendasikan! 😊`;
  }

  return `${prefix}Terima kasih atas pertanyaannya! Di Ticketify kamu bisa memesan tiket konser musisi top seperti Coldplay, Bruno Mars, festival musik, dan pertunjukan seru lainnya dengan sistem E-Ticket QR Code instan.\n\nKamu bisa menanyakan rekomendasi konser, harga tiket per kategori, voucher promo aktif, atau cara pemesanan. Ada yang ingin kamu ketahui lebih lanjut? 🎵✨`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        {
          error: 'API key belum dikonfigurasi. Tambahkan GEMINI_API_KEY di .env.local',
          configured: false,
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const rawMessages: ChatMessage[] = body.messages ?? [];
    const userName = (typeof body.userName === 'string' && body.userName.trim())
      ? body.userName.trim()
      : 'user';
    const language: 'id' | 'en' = body.language === 'en' ? 'en' : 'id';

    if (!rawMessages.length) {
      return NextResponse.json({ error: language === 'en' ? 'Message cannot be empty' : 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    // Determine if this is the first assistant response
    const isFirstResponse = !rawMessages.some(
      (m) => m.role === 'model' || m.role === 'assistant'
    );

    // Fetch live events and promos to inject into system prompt
    let eventsSummary = '';
    try {
      const events = await getAllEvents();
      eventsSummary = events
        .slice(0, 15)
        .map(
          (e) =>
            `• "${e.title}" (${e.artist}) | Kategori: ${e.category} | Tanggal: ${e.date} (${e.time}) | Lokasi: ${e.venue}, ${e.city} | Tiket: ${e.ticketTiers.map((t) => `${t.name} (Rp ${t.price.toLocaleString('id-ID')})`).join(', ')}`
        )
        .join('\n');
    } catch (err) {
      console.warn('[Tixi] Could not load events for prompt:', err);
    }

    const promosSummary = AVAILABLE_PROMOS.map(
      (p) => `• Kode: "${p.code}" — ${p.title}: ${p.description}`
    ).join('\n');

    const systemPrompt = buildSystemPrompt(userName, isFirstResponse, eventsSummary, promosSummary, language);

    // Sanitize message history for Gemini (strict alternation, starts with user, non-empty)
    const sanitizedHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    const previousMessages = rawMessages.slice(0, -1);

    for (const msg of previousMessages) {
      const text = (msg.content || '').trim();
      if (!text) continue;
      const role: 'user' | 'model' =
        msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user';

      // First item must be 'user'
      if (sanitizedHistory.length === 0 && role !== 'user') {
        continue;
      }

      const last = sanitizedHistory[sanitizedHistory.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n${text}`;
      } else {
        sanitizedHistory.push({
          role,
          parts: [{ text }],
        });
      }
    }

    const lastMessage = rawMessages[rawMessages.length - 1];
    const userPrompt = lastMessage?.content?.trim() || '';

    if (!userPrompt) {
      return NextResponse.json({ error: language === 'en' ? 'Question cannot be empty' : 'Pertanyaan tidak boleh kosong' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let streamResult: any = null;
    let usedModel = '';

    // Attempt streaming with candidate models in priority order
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.75,
            topP: 0.95,
          },
        });

        const chat = model.startChat({ history: sanitizedHistory });
        streamResult = await chat.sendMessageStream(userPrompt);
        usedModel = modelName;
        break;
      } catch (err: any) {
        console.warn(`[Tixi] Model ${modelName} failed (${err?.status || err?.message}). Trying next...`);
      }
    }

    // If all models failed or were unavailable, use smart fallback generator
    if (!streamResult) {
      console.warn('[Tixi] All Gemini models failed or unavailable. Using intelligent domain fallback.');
      const fallbackText = generateSmartFallback(userPrompt, userName, isFirstResponse, language);
      return new Response(fallbackText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Stream response directly to client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error('[Tixi] Stream processing error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Tixi-Model': usedModel,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada chatbot';
    console.error('[Tixi] Chat endpoint error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
