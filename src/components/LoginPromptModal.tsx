'use client';

import React, { useEffect, useRef } from 'react';
import { LogIn, X, Ticket, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LoginPromptModalProps {
  onLogin: () => void;
  onCancel: () => void;
}

export default function LoginPromptModal({ onLogin, onCancel }: LoginPromptModalProps) {
  const { t, language } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while prompt is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Animate card in on next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.opacity = '1';
          cardRef.current.style.transform = 'translateY(0) scale(1)';
        }
      });
    });

    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onCancel();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'lpm-backdrop-in 0.25s ease forwards',
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
          padding: '2rem 2rem 1.75rem',
          position: 'relative',
          opacity: 0,
          transform: 'translateY(24px) scale(0.96)',
          transition: 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1), transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label={language === 'id' ? 'Tutup' : 'Close'}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface-elevated)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
        >
          <X size={15} />
        </button>

        {/* Icon Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <Ticket size={26} style={{ color: 'var(--text-primary)', opacity: 0.9 }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          {t.loginPrompt.title}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: '1.5rem',
          }}
        >
          {t.loginPrompt.description}
        </p>

        {/* Info note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
          }}
        >
          <ShieldCheck size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.loginPrompt.savedNotice}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={onLogin}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            <LogIn size={17} />
            <span>{t.loginPrompt.loginButton}</span>
          </button>

          <button
            onClick={onCancel}
            className="btn-ghost"
            style={{
              width: '100%',
              padding: '0.72rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-secondary)',
            }}
          >
            {t.loginPrompt.cancelButton}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes lpm-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
