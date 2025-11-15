import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/state/auth'
import { loginApi, registerApi } from '@/lib/authApi'
import { getDeviceHash } from '@/utils/deviceFingerprint'
import { saveTokens, clearTokens } from '@/utils/tokenManager'

export function useAuth() {
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const client = useQueryClient()

  const login = useMutation((dto: any) => loginApi({ ...dto, deviceHash: getDeviceHash() }), {
    onSuccess: (data: any) => {
      const token = data.token || data.tokens?.accessToken || data.accessToken
      const refresh = data.refreshToken || data.tokens?.refreshToken
      setUser(data.user)
      setToken(token)
      saveTokens(token)
      client.invalidateQueries(['me'])
      navigate('/')
    }
  })

  const register = useMutation((dto: any) => registerApi({ ...dto, deviceHash: getDeviceHash() }), {
    onSuccess: (data: any) => {
      const token = data.token || data.tokens?.accessToken
      const refresh = data.refreshToken || data.tokens?.refreshToken
      setUser(data.user)
      setToken(token)
      saveTokens(token)
      client.invalidateQueries(['me'])
      navigate('/')
    }
  })

  function logout() {
    signOut()
    clearTokens()
    client.clear()
    navigate('/login')
  }

  return { login, register, logout }
}

export default useAuth
