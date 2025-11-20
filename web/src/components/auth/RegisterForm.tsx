import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth/useAuth';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes, and underscores'),
    password: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  async function submit(values: RegisterFormValues) {
    try {
      setApiError(null);

      // Call registration endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: values.email,
          username: values.username,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Registration failed (${response.status})`);
      }

      const data = await response.json();

      // Auto-login: set auth state with returned user and token
      if (data.user && data.accessToken) {
        setAuth(data.user, data.accessToken);
      }

      reset();
      onSuccess?.();

      // Redirect to onboarding (profile setup)
      navigate('/onboarding');
    } catch (error: any) {
      const message = error.message || 'Registration failed. Please try again.';
      setApiError(message);
      console.error('Registration error:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="w-full max-w-md mx-auto" noValidate>
      {apiError && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-sm" role="alert">
          {apiError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
          Email address
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          placeholder="you@example.com"
          className="w-full rounded-lg p-3 bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-600 focus:outline-none transition"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-300">
          Username
        </label>
        <input
          id="username"
          type="text"
          {...register('username')}
          placeholder="john_doe"
          className="w-full rounded-lg p-3 bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-600 focus:outline-none transition"
          disabled={isSubmitting}
        />
        {errors.username && (
          <p id="username-error" className="mt-1 text-sm text-red-400">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          placeholder="••••••••"
          className="w-full rounded-lg p-3 bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-600 focus:outline-none transition"
          disabled={isSubmitting}
        />
        {errors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-300">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          placeholder="••••••••"
          className="w-full rounded-lg p-3 bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-600 focus:outline-none transition"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>

      <div className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign in
        </Link>
      </div>
    </form>
  );
}

export default RegisterForm;
