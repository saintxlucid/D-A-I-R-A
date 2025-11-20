import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthStore {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;

  // Helpers
  isTokenExpired: (token?: string) => boolean;
  getTokenExpiry: (token?: string) => number | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      isTokenExpired: (token?: string) => {
        const t = token || get().accessToken;
        if (!t) return true;

        try {
          const decoded = jwtDecode<{ exp: number }>(t);
          if (!decoded.exp) return true;
          return Date.now() >= decoded.exp * 1000;
        } catch {
          return true;
        }
      },

      getTokenExpiry: (token?: string) => {
        const t = token || get().accessToken;
        if (!t) return null;

        try {
          const decoded = jwtDecode<{ exp: number }>(t);
          return decoded.exp ? decoded.exp * 1000 - Date.now() : null;
        } catch {
          return null;
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
