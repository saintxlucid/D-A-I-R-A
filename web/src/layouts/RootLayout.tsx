import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/state/auth'

export default function RootLayout() {
  const { user, signOut } = useAuthStore()
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: '��' },
    { path: '/reels', label: 'Reels', icon: '🎬' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
  ]
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="glass sticky top-0 z-50 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-brand bg-clip-text text-transparent">
            D·A·I·R·A
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hover:text-white transition ${
                  location.pathname === item.path ? 'text-white' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to={`/${user?.handle}`} className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.handle}`}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
            </Link>
            <button onClick={signOut} className="text-sm text-neutral-400 hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Mobile bottom nav */}
      <nav className="md:hidden glass fixed bottom-0 left-0 right-0 border-t border-neutral-800">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-xs ${
                location.pathname === item.path ? 'text-white' : 'text-neutral-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}