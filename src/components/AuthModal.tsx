'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  UserCheck,
} from 'lucide-react';

export default function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuth();
  const { t } = useLanguage();

  // Role choice: 'user' vs 'admin'
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lock body scroll when auth modal is open
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.classList.add('modal-open');

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.classList.remove('modal-open');
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleTabSwitch = (mode: 'login' | 'register') => {
    resetForm();
    openAuthModal(mode);
  };

  const handleQuickDemoLogin = async (roleToUse: 'user' | 'admin') => {
    setErrorMsg(null);
    setLoading(true);
    setSelectedRole(roleToUse);

    const demoEmail = roleToUse === 'admin' ? 'admin@ticketify.com' : 'user@ticketify.com';
    const demoPassword = roleToUse === 'admin' ? 'admin123' : 'password123';

    setEmail(demoEmail);
    setPassword(demoPassword);

    const res = await login(demoEmail, demoPassword, roleToUse);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || t.auth.demoLoginError);
    } else {
      const hasPending = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('ticketify_pending_checkout'));
      if (roleToUse === 'admin') {
        router.push('/admin');
      } else if (hasPending || window.location.pathname === '/') {
        closeAuthModal();
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isLogin) {
      if (!email.trim() || !password) {
        setErrorMsg(t.auth.fillEmailPassword);
        return;
      }

      setLoading(true);
      const res = await login(email.trim(), password, selectedRole);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || t.auth.loginError);
      } else {
        const hasPending = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('ticketify_pending_checkout'));
        if (res.user?.role === 'admin') {
          router.push('/admin');
        } else if (hasPending || window.location.pathname === '/') {
          closeAuthModal();
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      // Register
      if (!name.trim()) {
        setErrorMsg(t.auth.nameRequired);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg(t.auth.emailInvalid);
        return;
      }
      if (password.length < 6) {
        setErrorMsg(t.auth.passwordMin);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg(t.auth.passwordMismatch);
        return;
      }

      setLoading(true);
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        phone: phone.trim(),
        identityNumber: identityNumber.trim(),
      });
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || t.auth.registerError);
      } else {
        const hasPending = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('ticketify_pending_checkout'));
        if (selectedRole === 'admin') {
          router.push('/admin');
        } else if (hasPending || window.location.pathname === '/') {
          closeAuthModal();
        } else {
          router.push('/dashboard');
        }
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal} style={{ zIndex: 9999 }}>
      <div
        className="modal-content auth-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: 'min(92vh, calc(100dvh - 1.5rem))',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header & Close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {isLogin ? t.auth.welcomeTitle : t.auth.registerTitle}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {isLogin ? t.auth.welcomeSubtitle : t.auth.registerSubtitle}
            </p>
          </div>
          <button onClick={closeAuthModal} className="btn-icon" style={{ flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-glass-input)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            style={{
              flex: 1,
              padding: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: isLogin ? 'var(--text-primary)' : 'transparent',
              color: isLogin ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            {t.auth.tabLogin}
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            style={{
              flex: 1,
              padding: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: !isLogin ? 'var(--text-primary)' : 'transparent',
              color: !isLogin ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            {t.auth.tabRegister}
          </button>
        </div>

        {/* ROLE SELECTION BOX */}
        <div style={{ marginBottom: '1.15rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t.auth.chooseRole} ({isLogin ? t.auth.loginAs : t.auth.registerAs}):
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.65rem',
            }}
          >
            {/* User Role Card */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('user');
                if (isLogin && email === 'admin@ticketify.com') {
                  setEmail('user@ticketify.com');
                  setPassword('password123');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: selectedRole === 'user'
                  ? '2px solid var(--text-primary)'
                  : '1px solid var(--border-default)',
                backgroundColor: selectedRole === 'user'
                  ? 'var(--bg-surface-elevated)'
                  : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: selectedRole === 'user' ? 'var(--text-primary)' : 'var(--bg-glass-input)',
                  color: selectedRole === 'user' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UserCheck size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.auth.roleUser}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {t.auth.roleUserDesc}
                </div>
              </div>
            </button>

            {/* Admin Role Card */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                if (isLogin && email === 'user@ticketify.com') {
                  setEmail('admin@ticketify.com');
                  setPassword('admin123');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: selectedRole === 'admin'
                  ? '2px solid var(--text-primary)'
                  : '1px solid var(--border-default)',
                backgroundColor: selectedRole === 'admin'
                  ? 'var(--bg-surface-elevated)'
                  : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: selectedRole === 'admin' ? 'var(--text-primary)' : 'var(--bg-glass-input)',
                  color: selectedRole === 'admin' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.auth.roleAdmin}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {t.auth.roleAdminDesc}
                </div>
              </div>
            </button>
          </div>

          {/* Role explanation subtitle */}
          <div
            style={{
              marginTop: '0.45rem',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
          >
            {selectedRole === 'user' ? t.auth.userRoleExplain : t.auth.adminRoleExplain}
          </div>
        </div>

        {/* 1-Click Quick Demo Login */}
        {isLogin && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={14} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  {selectedRole === 'admin' ? t.auth.demoAdmin : t.auth.demoUser}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {selectedRole === 'admin'
                    ? 'admin@ticketify.com (admin123)'
                    : 'user@ticketify.com (password123)'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(selectedRole)}
              disabled={loading}
              className="btn-secondary"
              style={{
                fontSize: '0.74rem',
                padding: '0.35rem 0.65rem',
                height: '28px',
                gap: '0.3rem',
                flexShrink: 0,
              }}
            >
              <span>{t.auth.oneClickLogin}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#ef4444',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10b981',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {!isLogin && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                {t.auth.fullName}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
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
                  required
                  placeholder={selectedRole === 'admin' ? t.auth.fullNamePlaceholderAdmin : t.auth.fullNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.3rem',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-glass-input)',
                    fontSize: '0.84rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              {t.auth.email}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="email"
                required
                placeholder={selectedRole === 'admin' ? 'admin@ticketify.com' : 'user@ticketify.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.3rem',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-glass-input)',
                  fontSize: '0.84rem',
                }}
              />
            </div>
          </div>

          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {t.auth.phone}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="08123..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '2.3rem',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {selectedRole === 'admin' ? t.auth.idNumberAdmin : t.auth.idNumberUser}
                </label>
                <div style={{ position: 'relative' }}>
                  <CreditCard
                    size={15}
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
                    placeholder={selectedRole === 'admin' ? 'Kode Otorisasi (cth: PROMOTOR2026)' : '16 digit NIK/Paspor...'}
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '2.3rem',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-glass-input)',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem',
              }}
            >
              {t.auth.password}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.3rem',
                  paddingRight: '2.5rem',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-glass-input)',
                  fontSize: '0.84rem',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Only in Register mode) */}
          {!isLogin && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                {t.auth.confirmPassword}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.3rem',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-glass-input)',
                    fontSize: '0.84rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              height: '44px',
              fontSize: '0.9rem',
              marginTop: '0.4rem',
              fontWeight: 700,
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <span>{t.auth.processing}</span>
            ) : isLogin ? (
              <span>{t.auth.loginSubmit} {selectedRole === 'admin' ? t.auth.roleAdmin : t.auth.roleUser}</span>
            ) : (
              <span>{t.auth.registerSubmit} {selectedRole === 'admin' ? t.auth.roleAdmin : t.auth.roleUser}</span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div
          style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          {isLogin ? (
            <>
              {t.auth.noAccount}{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t.auth.registerNow}
              </button>
            </>
          ) : (
            <>
              {t.auth.hasAccount}{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t.auth.loginHere}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 520px) {
          .auth-modal-content {
            padding: 1.25rem 1rem !important;
            border-radius: var(--radius-lg) !important;
            width: 98% !important;
          }
        }
      `}</style>
    </div>
  );
}
