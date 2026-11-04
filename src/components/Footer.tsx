'use client';

import React, { useState } from 'react';
import { Ticket, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import FAQModal from './FAQModal';

export default function Footer() {
  const { t } = useLanguage();
  const [faqOpen, setFaqOpen] = useState(false);
  const [faqCategory, setFaqCategory] = useState('all');

  const openFAQ = (cat: string) => {
    setFaqCategory(cat);
    setFaqOpen(true);
  };
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        padding: '2.5rem 0 1.75rem',
      }}
    >
      <div className="container">
        {/* Value Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            paddingBottom: '2rem',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={17} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.15rem' }}>
                {t.footer.officialTickets}
              </h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {t.footer.officialTicketsDesc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={17} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.15rem' }}>
                {t.footer.instantEticket}
              </h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {t.footer.instantEticketDesc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Headphones size={17} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.15rem' }}>
                {t.footer.support247}
              </h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {t.footer.support247Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Row */}
        <div
          className="footer-bottom-row"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={15} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              ticketify
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => openFAQ('terms')}
              className="btn-ghost"
              style={{ padding: '0.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t.footer.terms}
            </button>
            <button
              type="button"
              onClick={() => openFAQ('terms')}
              className="btn-ghost"
              style={{ padding: '0.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t.footer.privacy}
            </button>
            <button
              type="button"
              onClick={() => openFAQ('all')}
              className="btn-ghost"
              style={{ padding: '0.2rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {t.footer.faq}
            </button>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            © {new Date().getFullYear()} Ticketify. {t.footer.copyright}
          </div>
        </div>
      </div>

      <FAQModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} initialCategory={faqCategory} />

      <style jsx>{`
        @media (max-width: 640px) {
          .footer-bottom-row {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
