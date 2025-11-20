import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/state/auth'
import { loginApi, registerApi, refreshApi } from '@/lib/authApi'
import { getDeviceHash } from '@/utils/deviceFingerprint'
import { saveTokens, clearTokens, getAccessToken, getRefreshToken } from '@/utils/tokenManager'

export function useAuth() {
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const client = useQueryClient()

  // Check auth on mount
  const { isLoading: authLoading } = useQuery(
    ['authStatus'],
    async () => {
      const token = getAccessToken()
      if (token && !isTokenExpired(token)) {
        return { authenticated: true }
      }
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const response = await refreshApi(refreshToken)
          setToken(response.accessToken)
          saveTokens(response.accessToken, response.refreshToken)
          return { authenticated: true }
        } catch (error) {
          clearTokens()
          return { authenticated: false }
        }
      }
      return { authenticated: false }
    },
    { staleTime: 5 * 60 * 1000, retry: false }
  )

  const login = useMutation(
    (dto: any) => loginApi({ ...dto, deviceHash: getDeviceHash() }),
    {
      onSuccess: (data: any) => {
        const token = data.accessToken
        const refresh = data.refreshToken
        setUser(data.user || { id: data.userId, email: data.email })
        setToken(token)
        saveTokens(token, refresh)
        client.invalidateQueries(['me'])
        client.invalidateQueries(['authStatus'])
        navigate('/')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Login failed'
        console.error('Login error:', message)
      }
    }
  )

  const register = useMutation(
    (dto: any) => registerApi({ ...dto, deviceHash: getDeviceHash() }),
    {
      onSuccess: (data: any) => {
        const token = data.accessToken
        const refresh = data.refreshToken
        setUser(data.user || { id: data.userId, email: data.email })
        setToken(token)
        saveTokens(token, refresh)
        client.invalidateQueries(['me'])
        client.invalidateQueries(['authStatus'])
        navigate('/onboarding')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Registration failed'
        console.error('Register error:', message)
      }
    }
  )

  const refresh = useMutation(
    () => {
      const token = getRefreshToken()
      if (!token) throw new Error('No refresh token')
      return refreshApi(token)
    },
    {
      onSuccess: (data: any) => {
        setToken(data.accessToken)
        saveTokens(data.accessToken, data.refreshToken)
        client.invalidateQueries(['authStatus'])
      },
      onError: () => {
        logout()
      }
    }
  )

  function logout() {
    signOut()
    clearTokens()
    client.clear()
    navigate('/login')
  }

  return { login, register, refresh, logout, authLoading }
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = JSON.parse(atob(token.split('.')[1]))
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export default useAuth
