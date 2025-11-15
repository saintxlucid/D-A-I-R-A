import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/state/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()
  
  async function handleLogin() {
    setIsLoading(true)
    
    try {
      // TODO: Replace with real auth flow (OTP/email → verify → JWT)
      // Mock response for now
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const mockResponse = {
        token: 'demo.jwt.token',
        user: {
          id: 1,
          handle: 'saintxlucid',
          name: 'Saint Lucid',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saintxlucid',
        },
      }
      
      setToken(mockResponse.token)
      setUser(mockResponse.user)
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass mx-auto max-w-sm w-full p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 gradient-brand bg-clip-text text-transparent">
          D·A·I·R·A
        </h1>
        <p className="text-neutral-400 text-sm mb-6">Welcome back</p>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-4 w-full rounded-xl bg-neutral-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          disabled={isLoading}
        />
        
        <button
          onClick={handleLogin}
          disabled={isLoading || !email.trim()}
          className="mt-4 w-full gradient-brand rounded-xl py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}