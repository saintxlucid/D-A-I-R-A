import Link from 'next/link';
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">DAIRA</h1>
      <p className="mb-8">Global cultural social platform</p>
      <Link href="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded">Sign Up</Link>
    </main>
  );
}
