'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUserSafe } from '@/lib/types';

interface AuthContextType {
  user: IUserSafe | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    expectedRole?: 'user' | 'admin'
  ) => Promise<{ success: boolean; error?: string; user?: IUserSafe }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    phone?: string;
    identityNumber?: string;
  }) => Promise<{ success: boolean; error?: string; user?: IUserSafe }>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    identityNumber?: string;
    bio?: string;
    avatar?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toggleSaveEvent: (eventId: string) => Promise<boolean>;
  isEventSaved: (eventId: string) => boolean;
  savedEventIds: string[];
  savedCount: number;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isSavedModalOpen: boolean;
  openSavedModal: () => void;
  closeSavedModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserSafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestSavedIds, setGuestSavedIds] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  const openSavedModal = useCallback(() => setIsSavedModalOpen(true), []);
  const closeSavedModal = useCallback(() => setIsSavedModalOpen(false), []);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem('ticketify_cached_user', JSON.stringify(data.user));
        } catch {
          // ignore
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem('ticketify_cached_user');
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Optimistic initial load from localStorage cache
    try {
      const cached = localStorage.getItem('ticketify_cached_user');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    refreshUser();
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string,
    expectedRole?: 'user' | 'admin'
  ) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login gagal' };
      }

      setUser(data.user);
      try {
        localStorage.setItem('ticketify_cached_user', JSON.stringify(data.user));
      } catch {
        // ignore
      }
      closeAuthModal();
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Koneksi jaringan bermasalah' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    phone?: string;
    identityNumber?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Pendaftaran gagal' };
      }

      setUser(resData.user);
      try {
        localStorage.setItem('ticketify_cached_user', JSON.stringify(resData.user));
      } catch {
        // ignore
      }
      closeAuthModal();
      return { success: true, user: resData.user };
    } catch {
      return { success: false, error: 'Koneksi jaringan bermasalah' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    try {
      localStorage.removeItem('ticketify_cached_user');
    } catch {
      // ignore
    }
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    identityNumber?: string;
    bio?: string;
    avatar?: string;
    password?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Gagal memperbarui profil' };
      }

      setUser(resData.user);
      try {
        localStorage.setItem('ticketify_cached_user', JSON.stringify(resData.user));
      } catch {
        // ignore
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Koneksi jaringan bermasalah' };
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ticketify_guest_saved_events');
      if (stored) {
        setGuestSavedIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const activeSavedIds = user ? user.savedEventIds || [] : guestSavedIds;

  const isEventSaved = useCallback(
    (eventId: string): boolean => {
      return activeSavedIds.includes(eventId);
    },
    [activeSavedIds]
  );

  const toggleSaveEvent = async (eventId: string): Promise<boolean> => {
    if (user) {
      const currentSaved = user.savedEventIds || [];
      const willBeSaved = !currentSaved.includes(eventId);
      const newSavedIds = willBeSaved
        ? [...currentSaved, eventId]
        : currentSaved.filter((id) => id !== eventId);

      // 1. Instantaneous Optimistic Update (0ms delay for the user!)
      const updatedUser = { ...user, savedEventIds: newSavedIds };
      setUser(updatedUser);
      try {
        localStorage.setItem('ticketify_cached_user', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }

      // 2. Non-blocking asynchronous server persistence
      fetch('/api/auth/saved-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.savedEventIds) {
            setUser((prev) => (prev ? { ...prev, savedEventIds: data.savedEventIds } : null));
          }
        })
        .catch((err) => {
          console.warn('Failed background sync of saved event, rolling back:', err);
          setUser((prev) => (prev ? { ...prev, savedEventIds: currentSaved } : null));
        });

      return willBeSaved;
    } else {
      // Guest mode: instant update
      const exists = guestSavedIds.includes(eventId);
      const updated = exists
        ? guestSavedIds.filter((id) => id !== eventId)
        : [...guestSavedIds, eventId];

      setGuestSavedIds(updated);
      try {
        localStorage.setItem('ticketify_guest_saved_events', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return !exists;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        toggleSaveEvent,
        isEventSaved,
        savedEventIds: activeSavedIds,
        savedCount: activeSavedIds.length,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isSavedModalOpen,
        openSavedModal,
        closeSavedModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
