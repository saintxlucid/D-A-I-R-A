import Link from 'next/link';
export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-100">
      <Link href="/" className="text-xl font-bold">DAIRA</Link>
      <nav>
        <Link href="/auth/login" className="mr-4">Login</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </header>
  );
}
