import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  async function submit(values: LoginFormValues) {
    try {
      setApiError(null);
      await login(values.email, values.password);
      reset();
      onSuccess?.();
      navigate('/feed');
    } catch (error: any) {
      const message = error.message || 'Login failed. Please try again.';
      setApiError(message);
      console.error('Login error:', error);
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

      <div className="mb-6">
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

      <button
        type="submit"
        className="w-full rounded-lg py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="mt-4 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;
