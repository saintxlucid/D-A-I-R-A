import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuth from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export function LoginForm() {
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const { login } = useAuth()

  async function submit(values: any) {
    await login.mutateAsync(values)
  }

  return (
    <form onSubmit={submit} className="w-full">
      <label className="block">
        <span className="sr-only">Email</span>
        <input type="email" {...register('email')} placeholder="Email" className="w-full rounded-md p-3 bg-neutral-900" />
      </label>

      <label className="block mt-3">
        <span className="sr-only">Password</span>
        <input type="password" {...register('password')} placeholder="Password" className="w-full rounded-md p-3 bg-neutral-900" />
      </label>

      <button type="submit" className="mt-4 w-full rounded-md py-3 bg-indigo-600 text-white" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default LoginForm
