'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Welcome Back</h2>
      <LoginForm />
      <p className="text-center mt-6 text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
