import { useState } from 'react';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setMessage(data.accessToken ? 'Logged in!' : 'Error');
  }
  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-10 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Login</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="border p-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="border p-2" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      {message && <p>{message}</p>}
    </form>
  );
}
