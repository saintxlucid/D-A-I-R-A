'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Account</h2>
      <RegisterForm />
      <p className="text-center mt-6 text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
