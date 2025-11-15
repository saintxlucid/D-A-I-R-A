import React from 'react'
import { useAuthStore } from '@/state/auth'

// We explicitly avoid using localStorage for tokens to reduce XSS risk.
// Tokens are held in memory via the Zustand store; refresh tokens should be stored
// server-side in HTTP-only cookies to avoid JS-accessible storage.
export function saveTokens(accessToken: string | null) {
  useAuthStore.setState({ token: accessToken })
}

export function clearTokens() {
  useAuthStore.setState({ token: null })
}

export function useTokenSync() {
  // No-op: we're not storing sensitive token data in localStorage.
  // Keep this hook for potential cross-tab messaging via BroadcastChannel or cookie polling.
  React.useEffect(() => {
    // future: implement BroadcastChannel sync for tokens if required
    return () => {}
  }, [])
}
