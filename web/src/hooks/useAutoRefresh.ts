import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { refreshToken } from '@/lib/refreshApi'
import { saveTokens } from '@/utils/tokenManager'

export function useAutoRefresh() {
  const client = useQueryClient()

  useEffect(() => {
    let mounted = true
    async function attempt() {
      try {
        const data = await refreshToken()
        if (!mounted) return
        const token = data.accessToken || data.token || data.tokens?.accessToken
        saveTokens(token || null)
        client.invalidateQueries(['me'])
      } catch (err) {
        // no-op: refresh failed
      }
    }

    attempt()

    return () => {
      mounted = false
    }
  }, [client])
}

export default useAutoRefresh
