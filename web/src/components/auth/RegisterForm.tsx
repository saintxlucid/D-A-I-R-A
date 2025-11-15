import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuth from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  password: z.string().min(6),
})

export function RegisterForm() {
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const { register: registerUser } = useAuth()

  async function submit(values: any) {
    await registerUser.mutateAsync(values)
  }

  return (
    <form onSubmit={submit} className="w-full">
      <input type="email" {...register('email')} placeholder="Email" className="w-full rounded-md p-3 bg-neutral-900" />
      <input type="text" {...register('username')} placeholder="Handle" className="w-full rounded-md p-3 bg-neutral-900 mt-3" />
      <input type="password" {...register('password')} placeholder="Password" className="w-full rounded-md p-3 bg-neutral-900 mt-3" />

      <button type="submit" className="mt-4 w-full rounded-md py-3 bg-green-600 text-white" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Registering…' : 'Create account'}
      </button>
    </form>
  )
}

export default RegisterForm
