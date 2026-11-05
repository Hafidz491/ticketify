'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IEvent } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, MapPin, ArrowUpRight, Star, Eye } from 'lucide-react';

interface EventCardProps {
  event: IEvent;
  index?: number;
  onSelect: (event: IEvent) => void;
}

const DEFAULT_CONCERT_IMAGE = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

export default function EventCard({ event, index = 0, onSelect }: EventCardProps) {
  const { user, isEventSaved, toggleSaveEvent } = useAuth();
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState(event.image || DEFAULT_CONCERT_IMAGE);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(event.image || DEFAULT_CONCERT_IMAGE);
  }, [event.image]);

  const isSaved = isEventSaved(event._id) || isEventSaved(event.slug);
  const lowestPrice = Math.min(...event.ticketTiers.map((t) => t.price));
  const totalAvailable = event.ticketTiers.reduce((acc, t) => acc + t.available, 0);

  // Scroll Reveal: Fade & slide card into view as user scrolls down
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const formattedDate = new Date(event.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(event)}
      className={`glass-card event-scroll-card ${isVisible ? 'is-revealed' : ''}`}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        transitionDelay: isVisible ? `${(index % 4) * 80}ms` : '0ms',
      }}
    >
      {/* Event Cover Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '190px',
          overflow: 'hidden',
        }}
      >
        <img
          src={imgSrc}
          alt={event.title}
          loading="lazy"
          onError={() => setImgSrc(DEFAULT_CONCERT_IMAGE)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="event-card-img"
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10, 11, 15, 0.7) 0%, transparent 60%)',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          <span
            className="micro-label"
            style={{
              padding: '0.22rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {t.hero.categories[event.category] || event.category}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                padding: '0.22rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                color: totalAvailable < 50 ? '#f87171' : '#34d399',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <span className={totalAvailable < 50 ? 'radar-warning-dot' : 'radar-live-dot'} />
              <span>{totalAvailable < 50 ? t.catalog.fewLeft : t.catalog.available}</span>
            </span>
          </div>
        </div>

        {/* Artist overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            right: '12px',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              opacity: 0.85,
            }}
          >
            {event.artist}
          </span>
        </div>
      </div>

      {/* Details Content */}
      <div
        style={{
          padding: '1.25rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.06rem',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: '0.65rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.title}
          </h3>

          {/* Date & Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.45rem',
            }}
          >
            <Calendar size={14} style={{ opacity: 0.75, flexShrink: 0 }} />
            <span>
              {formattedDate} • {event.time}
            </span>
          </div>

          {/* Venue & City */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.55rem',
            }}
          >
            <MapPin size={14} style={{ opacity: 0.75, flexShrink: 0 }} />
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {event.venue}, {event.city}
            </span>
          </div>
        </div>

        {/* Bottom Price & Action */}
        <div
          className="event-card-bottom-row"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.95rem',
            marginTop: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              {t.catalog.startingFrom}
            </span>
            <span
              className="tabular-num text-gradient-price"
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
              }}
            >
              Rp {lowestPrice.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            className="btn-secondary"
            style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(event);
            }}
            title={user?.role === 'admin' ? (language === 'id' ? 'Lihat denah kursi dan ketentuan konser' : 'View seating layout and concert terms') : (language === 'id' ? 'Pesan tiket konser' : 'Book concert tickets')}
          >
            <span>{user?.role === 'admin' ? t.catalog.concertDetails : t.catalog.book}</span>
            {user?.role === 'admin' ? <Eye size={14} /> : <ArrowUpRight size={14} />}
          </button>
        </div>
      </div>

      <style jsx>{`
        div:hover .event-card-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
}
