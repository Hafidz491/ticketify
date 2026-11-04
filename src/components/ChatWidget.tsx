'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ChevronDown,
  Ticket,
  HelpCircle,
  Tag,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  error?: boolean;
  timestamp: Date;
  isClosingOffer?: boolean;
}

const QUICK_SUGGESTIONS_ID = [
  { icon: Music, label: 'Konser yang ada apa aja?', text: 'Konser apa saja yang tersedia di Ticketify saat ini?' },
  { icon: Ticket, label: 'Tiket Coldplay berapa?', text: 'Berapa harga tiket konser Coldplay dan apa saja kategorinya?' },
  { icon: Tag, label: 'Ada kode promo?', text: 'Ada kode promo atau voucher diskon apa saja yang bisa saya pakai?' },
  { icon: HelpCircle, label: 'Cara pesan tiket?', text: 'Bagaimana langkah-langkah pesan tiket konser sampai dapat e-ticket?' },
];

const QUICK_SUGGESTIONS_EN = [
  { icon: Music, label: 'What concerts are available?', text: 'What concerts are currently available on Ticketify?' },
  { icon: Ticket, label: 'How much are Coldplay tickets?', text: 'What are the ticket prices and tiers for Coldplay?' },
  { icon: Tag, label: 'Any promo codes available?', text: 'What promo codes or discount vouchers can I use?' },
  { icon: HelpCircle, label: 'How to book tickets?', text: 'What are the steps to book concert tickets and receive an e-ticket?' },
];

function createWelcomeMessage(name?: string, lang: 'id' | 'en' = 'id'): Message {
  const isEn = lang === 'en';
  const displayName = name ? `**${name}**` : (isEn ? 'Ticketify Friend' : 'Sobat Ticketify');
  return {
    id: 'welcome',
    role: 'assistant',
    content: isEn
      ? `Hello, ${displayName}! I am **Tixi** 🎵, Ticketify's smart AI assistant.

I am ready to help you with:
• 🎟️ Discover & recommend latest music concerts
• 💰 Check ticket tiers, seating charts & prices
• 🏷️ Latest promo codes & discounts info
• 📱 Guide from booking to official E-Ticket QR Code

Type any question below, or select a quick topic!`
      : `Halo, ${displayName}! Saya **Tixi** 🎵, asisten AI pintar dari Ticketify.

Saya siap membantu kamu seputar:
• 🎟️ Cari & rekomendasi konser musik terkini
• 💰 Cek kategori tiket, denah kursi & harga
• 🏷️ Info kode promo diskon terbaru
• 📱 Panduan pemesanan hingga E-Ticket QR Code

Ketik pertanyaan apa saja di bawah, atau pilih topik yang ingin kamu tanyakan!`,
    timestamp: new Date(),
  };
}

/** Render markdown-lite: bold, bullet lists, newlines */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const boldParts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = boldParts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );

    // Bullet list
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <span
          key={i}
          style={{
            display: 'block',
            paddingLeft: '0.6rem',
            marginTop: i === 0 ? 0 : '0.2rem',
            position: 'relative',
          }}
        >
          {rendered}
        </span>
      );
    }

    return (
      <React.Fragment key={i}>
        {i > 0 && line === '' ? <br /> : null}
        {rendered}
        {i < lines.length - 1 && line !== '' ? '\n' : null}
      </React.Fragment>
    );
  });
}

export default function ChatWidget() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const pathname = usePathname();

  // Evaluasi 4: Chatbot hanya untuk role user atau yang belum login. Role admin / halaman admin TIDAK ADA chatbot.
  const isAdmin = user?.role === 'admin' || pathname?.startsWith('/admin');

  const userName = useMemo(() => user?.name?.trim() || 'user', [user?.name]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [createWelcomeMessage(undefined, language)]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevUserRef = useRef<string | null | undefined>(user?._id);

  // Avoid hydration mismatch by setting mounted flag
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update welcome message if only 1 message exists when language switches
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [createWelcomeMessage(user?.name, language)];
      }
      return prev;
    });
  }, [language, user?.name]);

  // Evaluasi 2: Ketika user logout dari akunnya, chatbot OTOMATIS ter-reset dan mulai obrolan dari awal
  useEffect(() => {
    const prevUserId = prevUserRef.current;
    const currentUserId = user?._id;

    if (prevUserId && !currentUserId) {
      // User baru saja logout
      abortRef.current?.abort();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      setMessages([createWelcomeMessage(undefined, language)]);
      setInput('');
      setIsStreaming(false);
      setUnreadCount(0);
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } else if (prevUserId !== currentUserId) {
      // User login atau berganti akun
      abortRef.current?.abort();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      setMessages([createWelcomeMessage(user?.name, language)]);
      setInput('');
      setIsStreaming(false);
      setUnreadCount(0);
    }

    prevUserRef.current = currentUserId;
  }, [user?._id, user?.name, language]);

  // Evaluasi 3: Otomatis tawarkan menutup obrolan jika user sudah tidak membalas setelah obrolan berjalan
  useEffect(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    const hasUserMessages = messages.some((m) => m.role === 'user');
    const lastMessage = messages[messages.length - 1];

    // Mulai timer inaktivitas jika chat sedang dibuka, tidak sedang streaming, ada obrolan user,
    // dan pesan terakhir adalah dari asisten (bukan pesan closing offer yang sudah dikirim)
    if (
      isOpen &&
      !isStreaming &&
      hasUserMessages &&
      lastMessage?.role === 'assistant' &&
      !lastMessage.isClosingOffer
    ) {
      // Berikan waktu jeda 45 detik setelah jawaban bot
      inactivityTimerRef.current = setTimeout(() => {
        const friendLabel = language === 'en' ? 'Ticketify Friend' : 'Sobat Ticketify';
        const closingContent = language === 'en'
          ? `Hi ${user?.name ? user.name : friendLabel}, it looks like you've been inactive or your questions are all answered. Is there anything else you'd like to ask, or can Tixi close this conversation? 😊`
          : `Hai ${user?.name ? user.name : friendLabel}, sepertinya kamu sedang tidak aktif atau pertanyaanmu sudah terjawab. Apakah ada hal lain yang masih ingin kamu tanyakan, atau boleh Tixi bantu menutup obrolan ini? 😊`;

        const closingMsg: Message = {
          id: `closing-offer-${Date.now()}`,
          role: 'assistant',
          content: closingContent,
          timestamp: new Date(),
          isClosingOffer: true,
        };
        setMessages((prev) => [...prev, closingMsg]);
      }, 45000);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, isStreaming, messages, user?.name, language]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  // Track scroll position to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    // Scroll when new messages arrive
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.streaming) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Increment unread badge when closed and AI replies
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && !last.streaming) {
        setUnreadCount((c) => c + 1);
      }
    }
  }, [messages, isOpen]);

  // Clear badge when opened
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userText = text.trim();
      if (!userText || isStreaming) return;

      // Bersihkan timer inaktivitas saat user mengirim pesan baru
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date(),
      };

      const assistantId = `ai-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      setIsStreaming(true);
      scrollToBottom();

      // Build history for API (exclude welcome + error messages + streaming placeholder)
      const history = [...messages.filter((m) => m.id !== 'welcome' && !m.error && m.content), userMsg].map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        content: m.content,
      }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            userName,
            language,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (err.configured === false) setIsConfigured(false);
          throw new Error(err.error || 'Gagal menghubungi AI');
        }

        // Read streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('Stream tidak tersedia');

        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snap = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snap, streaming: true } : m
            )
          );
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated, streaming: false } : m
          )
        );
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Koneksi gagal. Coba lagi.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: msg, streaming: false, error: true }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages, scrollToBottom, userName]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;
      sendMessage(input);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setMessages([createWelcomeMessage(user?.name)]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsStreaming(false);
    setIsConfigured(true);
  };

  const handleCloseConversation = () => {
    setIsOpen(false);
    setTimeout(() => {
      handleReset();
    }, 350);
  };

  const handleContinueConversation = () => {
    inputRef.current?.focus();
  };

  const formatTime = (d: Date) => {
    if (!isMounted) return '';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Jangan render apa pun jika role admin atau sedang di halaman admin
  if (isAdmin) {
    return null;
  }

  return (
    <>
      {/* ── Chat Panel ───────────────────────────────────────────── */}
      <div
        data-chat-panel
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: 'clamp(330px, 92vw, 420px)',
          height: 'clamp(500px, 75vh, 640px)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
          transformOrigin: 'bottom right',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(24px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.15rem',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            {/* AI Avatar */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(167,139,250,0.5)',
                flexShrink: 0,
              }}
            >
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                Tixi AI
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.12rem 0.5rem',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
                    color: '#fff',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  TICKETIFY
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#34d399',
                    display: 'inline-block',
                    boxShadow: '0 0 6px #34d399',
                  }}
                />
                {user ? `Online — ${user.name}` : t.chat.assistantSubtitle}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={handleReset}
              title={t.chat.newConversation}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title={t.chat.close}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* API Key warning if missing */}
        {!isConfigured && (
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: 'rgba(245,158,11,0.12)',
              borderBottom: '1px solid rgba(245,158,11,0.2)',
              fontSize: '0.76rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexShrink: 0,
            }}
          >
            <Sparkles size={13} />
            <span>
              Tambahkan{' '}
              <code
                style={{
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.1rem 0.3rem',
                  borderRadius: '4px',
                }}
              >
                GEMINI_API_KEY
              </code>{' '}
              di .env.local
            </span>
          </div>
        )}

        {/* Messages scroll area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '0.55rem',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    msg.role === 'assistant'
                      ? 'linear-gradient(135deg,#a78bfa,#60a5fa)'
                      : 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '0.2rem',
                }}
              >
                {msg.role === 'assistant' ? (
                  <Bot size={14} color="#fff" />
                ) : (
                  <User size={14} style={{ color: 'var(--text-secondary)' }} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius:
                      msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : msg.error
                        ? 'rgba(239,68,68,0.1)'
                        : msg.isClosingOffer
                        ? 'rgba(167,139,250,0.1)'
                        : 'var(--bg-surface-elevated)',
                    border: msg.error
                      ? '1px solid rgba(239,68,68,0.25)'
                      : msg.isClosingOffer
                      ? '1px solid rgba(167,139,250,0.35)'
                      : msg.role === 'user'
                      ? 'none'
                      : '1px solid var(--border-subtle)',
                    color:
                      msg.role === 'user'
                        ? '#fff'
                        : msg.error
                        ? '#ef4444'
                        : 'var(--text-primary)',
                    fontSize: '0.86rem',
                    lineHeight: 1.58,
                    boxShadow:
                      msg.role === 'user'
                        ? '0 4px 14px rgba(79,70,229,0.35)'
                        : 'var(--shadow-sm)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.streaming && msg.content === '' ? (
                    /* Typing indicator animation */
                    <span
                      style={{
                        display: 'inline-flex',
                        gap: '5px',
                        alignItems: 'center',
                        padding: '0.2rem 0.2rem',
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: '#a78bfa',
                            display: 'inline-block',
                            animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    renderMarkdown(msg.content)
                  )}

                  {/* Streaming cursor */}
                  {msg.streaming && msg.content !== '' && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '14px',
                        backgroundColor: '#a78bfa',
                        marginLeft: '3px',
                        verticalAlign: 'middle',
                        animation: 'cursor-blink-chat 0.8s step-end infinite',
                      }}
                    />
                  )}

                  {/* Evaluasi 3: Tombol interaktif untuk tawaran penutupan obrolan */}
                  {msg.isClosingOffer && (
                    <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleCloseConversation}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)';
                        }}
                      >
                        <CheckCircle2 size={13} /> {t.chat.closeConversationBtn}
                      </button>
                      <button
                        onClick={handleContinueConversation}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(167,139,250,0.15)',
                          border: '1px solid rgba(167,139,250,0.35)',
                          color: '#a78bfa',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(167,139,250,0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(167,139,250,0.15)';
                        }}
                      >
                        <MessageCircle size={13} /> {t.chat.keepAskingBtn}
                      </button>
                    </div>
                  )}
                </div>

                <span
                  suppressHydrationWarning
                  style={{
                    fontSize: '0.67rem',
                    color: 'var(--text-muted)',
                    paddingInline: '0.25rem',
                  }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Quick suggestions chips — show after welcome message */}
          {messages.length === 1 && (
            <div style={{ marginTop: '0.2rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={12} color="#a78bfa" />
                {t.chat.quickTopics}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(language === 'en' ? QUICK_SUGGESTIONS_EN : QUICK_SUGGESTIONS_ID).map((q, idx) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q.text)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(167,139,250,0.25)',
                        backgroundColor: 'rgba(167,139,250,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: '0.79rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textAlign: 'left',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(167,139,250,0.16)';
                        e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(167,139,250,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <Icon size={14} color="#a78bfa" style={{ flexShrink: 0 }} />
                      <span>{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: 'var(--shadow-md)',
              zIndex: 2,
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronDown size={13} /> {t.chat.scrollToBottom}
          </button>
        )}

        {/* Input box */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.inputPlaceholder}
              disabled={isStreaming}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                padding: '0.65rem 0.9rem',
                borderRadius: '14px',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                outline: 'none',
                fontFamily: 'inherit',
                maxHeight: '110px',
                overflowY: 'auto',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label={t.chat.send}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  input.trim() && !isStreaming
                    ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                    : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: input.trim() && !isStreaming ? '#fff' : 'var(--text-muted)',
                cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow:
                  input.trim() && !isStreaming ? '0 4px 14px rgba(79,70,229,0.4)' : 'none',
              }}
            >
              <Send size={17} />
            </button>
          </form>
          <p
            style={{
              fontSize: '0.66rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: '0.45rem',
            }}
          >
            {t.chat.footerNotice}
          </p>
        </div>
      </div>

      {/* ── FAB Button ──────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? t.chat.close : t.chat.assistantTitle}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          boxShadow: isOpen
            ? '0 6px 20px rgba(239,68,68,0.5)'
            : '0 6px 24px rgba(79,70,229,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div
          style={{
            transition: 'all 0.25s ease',
            transform: isOpen ? 'rotate(90deg) scale(0.95)' : 'rotate(0deg) scale(1)',
          }}
        >
          {isOpen ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
        </div>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '999px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--bg-app)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Keyframe styles */}
      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes cursor-blink-chat {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (max-width: 480px) {
          [data-chat-panel] {
            right: 12px !important;
            width: calc(100vw - 24px) !important;
            height: 78vh !important;
          }
        }
      `}</style>
    </>
  );
}
