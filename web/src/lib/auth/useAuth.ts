import React from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type User = {
  id: string;
  username?: string;
  email?: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User | null, accessToken: string | null) => void;
  clearAuth: () => void;
  refresh: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        isLoading: false,
        error: null,

        setAuth(user, accessToken) {
          set({ user, accessToken, error: null });
        },

        clearAuth() {
          set({ user: null, accessToken: null, error: null });
        },

        async refresh() {
          try {
            // Backend refresh uses HttpOnly cookie -> returns new access token + user
            const res = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });

            if (!res.ok) {
              get().clearAuth();
              return false;
            }

            const payload = await res.json();
            get().setAuth(payload.user, payload.accessToken);
            return true;
          } catch (err) {
            get().clearAuth();
            return false;
          }
        },

        async login(email, password) {
          set({ isLoading: true, error: null });
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include', // for refresh cookie
              body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({ message: 'Login failed' }));
              throw new Error(err.message || 'Login failed');
            }

            const payload = await res.json();
            get().setAuth(payload.user, payload.accessToken);
          } catch (err: any) {
            set({ error: err.message || 'Login failed', isLoading: false });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        async logout() {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
          } finally {
            get().clearAuth();
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          // Don't persist accessToken (keep it memory-only)
        }),
      }
    )
  )
);

/**
 * Auto-refresh on window focus
 * Silently refreshes token when user returns to tab
 */
export function useAuthRefreshOnFocus() {
  const refresh = useAuthStore((s) => s.refresh);
  React.useEffect(() => {
    let mounted = true;
    const handler = async () => {
      if (!mounted) return;
      await refresh();
    };
    window.addEventListener('focus', handler);
    return () => {
      mounted = false;
      window.removeEventListener('focus', handler);
    };
  }, [refresh]);
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  return useAuthStore((s) => !!s.user && !!s.accessToken);
}

/**
 * Get current user
 */
export function useUser() {
  return useAuthStore((s) => s.user);
}
