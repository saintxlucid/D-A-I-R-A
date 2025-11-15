import React from 'react'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login.mutateAsync({ email, password })
    } catch (err) {
      console.error('Login failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <label className="block">
        <span className="sr-only">Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md p-3 bg-neutral-900" required />
      </label>

      <label className="block mt-3">
        <span className="sr-only">Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md p-3 bg-neutral-900" required />
      </label>

      <button type="submit" className="mt-4 w-full rounded-md py-3 bg-indigo-600 text-white" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default LoginForm
