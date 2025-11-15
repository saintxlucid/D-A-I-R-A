import React from 'react'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register.mutateAsync({ email, password, username })
    } catch (err) {
      console.error('Register failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md p-3 bg-neutral-900" required />
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Handle" className="w-full rounded-md p-3 bg-neutral-900 mt-3" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md p-3 bg-neutral-900 mt-3" required />

      <button type="submit" className="mt-4 w-full rounded-md py-3 bg-green-600 text-white" disabled={loading}>
        {loading ? 'Registering…' : 'Create account'}
      </button>
    </form>
  )
}

export default RegisterForm
