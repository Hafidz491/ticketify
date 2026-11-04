'use client';

import React, { useState, useRef, useMemo } from 'react';
import { IEvent } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Search, Eye } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Swiper core styles
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSectionProps {
  featuredEvents: IEvent[];
  onSelectEvent: (event: IEvent) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function HeroSection({
  featuredEvents = [],
  onSelectEvent,
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchChange,
}: HeroSectionProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = useMemo(
    () => [
      { id: 'All', label: t.hero.categories.All || 'Semua' },
      { id: 'Concert', label: t.hero.categories.Concert || 'Konser Musik' },
      { id: 'Festival', label: t.hero.categories.Festival || 'Festival' },
      { id: 'Theater', label: t.hero.categories.Theater || 'Seni & Teater' },
      { id: 'Comedy', label: t.hero.categories.Comedy || 'Standup Comedy' },
      { id: 'Conference', label: t.hero.categories.Conference || 'Konferensi' },
    ],
    [t]
  );

  const cities = useMemo(
    () => [
      { value: 'All', label: t.hero.allCities },
      { value: 'Jakarta', label: 'Jakarta' },
      { value: 'Bandung', label: 'Bandung' },
      { value: 'Surabaya', label: 'Surabaya' },
      { value: 'Tangerang', label: 'Tangerang' },
      { value: 'Bali', label: 'Bali' },
    ],
    [t]
  );

  const totalSlides = featuredEvents.length;

  return (
    <section style={{ padding: '2rem 0 1.25rem', position: 'relative' }}>
      <div className="container">
        {/* Top Headline */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2rem' }}>
          <div className="badge-float" style={{ marginBottom: '0.85rem' }}>
            <span
              className="badge-glow-purple pill-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.76rem',
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} />
              <span>{t.hero.scheduleBadge}</span>
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4.5vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              marginBottom: '0.75rem',
            }}
          >
            {t.hero.titleStart}
            <span className="text-gradient-aurora">{t.hero.titleGradient}</span>
            {t.hero.titleEnd}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.88rem, 1.8vw, 1.05rem)',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {t.hero.subtitle}
          </p>
        </div>

        {/* Featured Hero Banner Slider powered by Swiper */}
        {totalSlides > 0 && (
          <div
            className="hero-slider-wrapper"
            style={{
              position: 'relative',
              marginBottom: '2rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              loop={totalSlides > 1}
              speed={800}
              autoplay={
                totalSlides > 1
                  ? {
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              grabCursor={totalSlides > 1}
              onSwiper={(swiper) => setSwiperInstance(swiper)}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {featuredEvents.map((evt, idx) => (
                <SwiperSlide key={evt._id || idx}>
                  <div
                    className="glass-card featured-banner-slide-card"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      backgroundImage: `linear-gradient(to top, rgba(10, 11, 15, 0.96) 0%, rgba(10, 11, 15, 0.6) 50%, rgba(10, 11, 15, 0.28) 100%), url(${evt.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-xl)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top Badges */}
                    <div
                      className="slide-top-badges"
                      style={{
                        position: 'absolute',
                        display: 'flex',
                        gap: '0.45rem',
                        flexWrap: 'wrap',
                        zIndex: 10,
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.72)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Sparkles size={12} color="#fbbf24" />
                        <span>Konser Unggulan</span>
                      </span>

                      <span
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.55)',
                          backdropFilter: 'blur(8px)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {evt.category}
                      </span>

                      {totalSlides > 1 && (
                        <span
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {idx + 1} / {totalSlides}
                        </span>
                      )}
                    </div>

                    {/* Event Content Overlay */}
                    <div style={{ maxWidth: '680px', zIndex: 10 }}>
                      <span
                        style={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {evt.artist}
                      </span>

                      <h2
                        className="slide-title"
                        style={{
                          fontWeight: 800,
                          color: '#ffffff',
                          lineHeight: 1.2,
                          marginBottom: '0.65rem',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {evt.title}
                      </h2>

                      {/* Details Bar */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '1rem',
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: '0.84rem',
                          marginBottom: '1.4rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Calendar size={15} style={{ opacity: 0.85 }} />
                          <span>
                            {new Date(evt.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            • {evt.time}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <MapPin size={15} style={{ opacity: 0.85 }} />
                          <span>
                            {evt.venue}, {evt.city}
                          </span>
                        </div>
                      </div>

                      {/* Call to action & price */}
                      <div
                        className="featured-actions-row"
                        style={{ display: 'flex', alignItems: 'center', gap: '1.35rem', flexWrap: 'wrap' }}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectEvent(evt)}
                          className="btn-primary"
                          style={{
                            padding: '0.8rem 1.8rem',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.55rem',
                          }}
                        >
                          <span>{isAdmin ? (language === 'id' ? 'Lihat Detail Konser' : 'View Concert Details') : t.hero.buyTickets}</span>
                          {isAdmin ? <Eye size={16} /> : <ArrowRight size={16} />}
                        </button>

                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '0.2rem' }}>
                            {t.hero.startingFrom}
                          </span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                            Rp{' '}
                            {Math.min(...(evt.ticketTiers || []).map((t) => t.price)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Previous & Next Arrow Controls */}
            {totalSlides > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => swiperInstance?.slidePrev()}
                  aria-label="Slide sebelumnya"
                  className="carousel-control-btn carousel-prev-btn"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => swiperInstance?.slideNext()}
                  aria-label="Slide selanjutnya"
                  className="carousel-control-btn carousel-next-btn"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Custom Dot Indicators */}
                <div className="carousel-dots-container">
                  {featuredEvents.map((evt, idx) => (
                    <button
                      key={evt._id || idx}
                      type="button"
                      onClick={() => swiperInstance?.slideToLoop(idx)}
                      style={{
                        width: activeIndex === idx ? '24px' : '7px',
                        height: '7px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: activeIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      aria-label={`Slide konser ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Global Search and Filter Bar */}
        <div
          className="glass-card"
          style={{
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
            className="filter-grid"
          >
            {/* Search Input Bar */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder={t.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-glass-input)',
                  fontSize: '0.86rem',
                }}
              />
            </div>

            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              style={{
                height: '42px',
                padding: '0 1.25rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-glass-input)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                minWidth: '150px',
              }}
            >
              {cities.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Chips Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.2rem',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? 'var(--text-primary)' : 'var(--border-default)',
                  backgroundColor: selectedCategory === cat.id ? 'var(--text-primary)' : 'transparent',
                  color: selectedCategory === cat.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Carousel Control Buttons Shared */
        .carousel-control-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 25;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .carousel-prev-btn {
          left: 1rem;
        }

        .carousel-next-btn {
          right: 1rem;
        }

        .carousel-control-btn:hover {
          background-color: rgba(0, 0, 0, 0.85) !important;
          transform: translateY(-50%) scale(1.08) !important;
        }

        .carousel-dots-container {
          position: absolute;
          bottom: 1.25rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          z-index: 25;
        }

        .slide-top-badges {
          top: 1.25rem;
          left: 1.25rem;
        }

        /* 1. MONITOR 24" KE ATAS (>= 1680px) */
        @media (min-width: 1680px) {
          .featured-banner-slide-card {
            min-height: 480px !important;
            padding: 3.5rem 3rem !important;
          }
          .slide-title {
            font-size: 2.7rem !important;
          }
        }

        /* 2. LAPTOP 16" (1440px - 1679px) */
        @media (min-width: 1440px) and (max-width: 1679px) {
          .featured-banner-slide-card {
            min-height: 440px !important;
            padding: 3rem 2.5rem !important;
          }
          .slide-title {
            font-size: 2.3rem !important;
          }
        }

        /* 3. NOTEBOOK & STANDARD LAPTOP 13"-15" (1025px - 1439px) */
        @media (min-width: 1025px) and (max-width: 1439px) {
          .featured-banner-slide-card {
            min-height: 400px !important;
            padding: 2.5rem 2rem !important;
          }
          .slide-title {
            font-size: 2.1rem !important;
          }
        }

        /* 4. TABLET (641px - 1024px) */
        @media (min-width: 641px) and (max-width: 1024px) {
          .featured-banner-slide-card {
            min-height: 370px !important;
            padding: 2rem 1.5rem !important;
          }
          .slide-title {
            font-size: 1.75rem !important;
          }
        }

        /* 5. MOBILE PHONE (<= 640px) */
        @media (max-width: 640px) {
          .featured-banner-slide-card {
            min-height: 330px !important;
            padding: 1.25rem 0.95rem !important;
          }
          .slide-title {
            font-size: 1.35rem !important;
            margin-bottom: 0.45rem !important;
          }
          .slide-top-badges {
            top: 0.85rem !important;
            left: 0.85rem !important;
          }
          .carousel-control-btn {
            width: 32px !important;
            height: 32px !important;
          }
          .carousel-prev-btn {
            left: 0.35rem !important;
          }
          .carousel-next-btn {
            right: 0.35rem !important;
          }
          .carousel-dots-container {
            bottom: 0.85rem !important;
            right: 0.85rem !important;
          }
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
          .featured-actions-row {
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
}
