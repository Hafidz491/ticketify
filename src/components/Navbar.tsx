'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Ticket,
  Sun,
  Moon,
  Search,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Bookmark,
  Settings,
  Shield,
  PlusCircle,
  BarChart3,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  dbConnected?: boolean;
}

export default function Navbar({
  searchQuery = '',
  onSearchChange,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, openAuthModal } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger floating mode when user scrolls down beyond 25px
      setIsScrolled(window.scrollY > 25);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <header className={`nav-header-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav-container-bar">
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ticket size={16} />
          </div>
          <span
            className="text-gradient-logo"
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            ticketify
          </span>
        </Link>

        {/* Global Compact Search Bar (Desktop) */}
        {onSearchChange && (
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '260px',
              display: 'none',
            }}
            className="desktop-search"
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.2rem',
                paddingRight: '0.75rem',
                height: '35px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-glass-input)',
                fontSize: '0.8rem',
                border: '1px solid var(--border-subtle)',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            />
          </div>
        )}

        {/* Action Links & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Language Switcher Toggle (Replaces DB Badge) */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={t.nav.switchLang}
            aria-label="Switch Language"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              height: '34px',
              padding: '0 0.65rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface-elevated)';
            }}
          >
            <Globe size={13} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            <span style={{ color: language === 'id' ? 'var(--text-primary)' : 'var(--text-muted)' }}>ID</span>
            <span style={{ opacity: 0.35, fontSize: '0.65rem' }}>|</span>
            <span style={{ color: language === 'en' ? 'var(--text-primary)' : 'var(--text-muted)' }}>EN</span>
          </button>

          {/* If Logged in as Admin, show direct shortcut to Admin Dashboard */}
          {user && isAdmin && (
            <Link
              href="/admin"
              className="btn-primary hide-on-compact-mobile"
              style={{
                height: '36px',
                padding: '0 0.95rem',
                fontSize: '0.8rem',
                gap: '0.4rem',
                textDecoration: 'none',
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }}
            >
              <Shield size={14} />
              <span>{t.nav.adminPanel}</span>
            </Link>
          )}

          {/* User Authentication Menu / Dashboard */}
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn-primary"
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  fontSize: '0.82rem',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className="hide-on-mobile"
                  style={{
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name.split(' ')[0]}
                </span>
                {isAdmin && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontWeight: 700,
                    }}
                  >
                    ADMIN
                  </span>
                )}
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '250px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
                    padding: '0.5rem',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
                >
                  {/* User Header */}
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {user.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isAdmin ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-elevated)',
                          color: isAdmin ? '#0284c7' : 'var(--text-secondary)',
                          fontWeight: 700,
                        }}
                      >
                        {isAdmin ? 'ADMIN' : 'USER'}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                    </div>
                  </div>

                  {/* ADMIN SPECIFIC MENU ITEMS */}
                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <Shield size={15} color="#0284c7" />
                        <span style={{ fontWeight: 600 }}>{t.nav.adminDashboard}</span>
                      </Link>

                      <Link
                        href="/admin?tab=create"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <PlusCircle size={15} />
                        <span>{t.nav.createEvent}</span>
                      </Link>

                      <Link
                        href="/admin?tab=events"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <LayoutDashboard size={15} />
                        <span>{t.nav.manageEvents}</span>
                      </Link>

                      <Link
                        href="/admin?tab=orders"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <BarChart3 size={15} />
                        <span>{t.nav.ordersList}</span>
                      </Link>
                    </>
                  ) : (
                    /* USER SPECIFIC MENU ITEMS */
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <LayoutDashboard size={15} />
                        <span>{language === 'id' ? 'Dashboard Saya' : 'My Dashboard'}</span>
                      </Link>

                      <Link
                        href="/dashboard?tab=tickets"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <Ticket size={15} />
                        <span>{t.nav.myTickets}</span>
                      </Link>

                      <Link
                        href="/dashboard?tab=wishlist"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <Bookmark size={15} />
                        <span>{t.nav.savedWishlist}</span>
                      </Link>

                      <Link
                        href="/dashboard?tab=settings"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <Settings size={15} />
                        <span>{t.nav.accountSettings}</span>
                      </Link>
                    </>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left',
                    }}
                    className="dropdown-item-hover"
                  >
                    <LogOut size={15} />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="btn-primary"
              style={{
                height: '36px',
                padding: '0 1.05rem',
                fontSize: '0.82rem',
                gap: '0.45rem',
              }}
            >
              <UserIcon size={14} />
              <span>{t.nav.loginRegister}</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title={theme === 'dark' ? t.nav.lightMode : t.nav.darkMode}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </nav>

      <style jsx>{`
        /* Outer Header Wrapper - Floating & Centered */
        .nav-header-wrapper {
          position: sticky;
          top: 14px;
          z-index: 50;
          width: 100%;
          display: flex;
          justify-content: center;
          pointer-events: none;
          padding: 0 1rem;
        }

        /* Fixed 70% Floating Navbar Bar */
        .nav-container-bar {
          pointer-events: auto;
          width: 70%;
          max-width: 1120px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.4rem 0.85rem 0.4rem 1.25rem;
          border-radius: var(--radius-pill);
          background-color: rgba(15, 23, 42, 0.78);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.45);
          transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        /* Light Mode Glassmorphism */
        :global([data-theme='light']) .nav-container-bar {
          background-color: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 28px -8px rgba(0, 0, 0, 0.08);
        }

        /* Scrolled Elevation State: Super smooth lighting transition (no jumping/width changes) */
        .nav-header-wrapper.is-scrolled .nav-container-bar {
          background-color: rgba(15, 23, 42, 0.94);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 14px 38px -8px rgba(0, 0, 0, 0.65);
        }

        :global([data-theme='light']) .nav-header-wrapper.is-scrolled .nav-container-bar {
          background-color: rgba(255, 255, 255, 0.96);
          border-color: rgba(0, 0, 0, 0.12);
          box-shadow: 0 12px 32px -6px rgba(0, 0, 0, 0.12);
        }

        @media (min-width: 768px) {
          .desktop-search {
            display: block !important;
          }
        }

        /* Responsive Width Breakpoints */
        @media (min-width: 1400px) {
          .nav-container-bar {
            width: 70% !important;
          }
        }

        @media (max-width: 1200px) and (min-width: 901px) {
          .nav-container-bar {
            width: 78% !important;
          }
        }

        @media (max-width: 900px) and (min-width: 641px) {
          .nav-container-bar {
            width: 88% !important;
            padding: 0.35rem 0.75rem 0.35rem 1rem !important;
          }
        }

        @media (max-width: 640px) {
          .nav-header-wrapper {
            top: 8px !important;
            padding: 0 0.5rem !important;
          }
          .nav-container-bar {
            width: 100% !important;
            height: 50px !important;
            padding: 0.35rem 0.6rem 0.35rem 0.75rem !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .db-status-pill {
            display: none !important;
          }
        }

        @media (max-width: 400px) {
          .hide-on-compact-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
