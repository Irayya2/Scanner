import { Link, useLocation } from 'react-router-dom'
import ConnectionStatus from './ConnectionStatus'

/**
 * Navbar — top navigation bar with neon branding and route links.
 */
export default function Navbar() {
  const location = useLocation()

  const navLinks = [
    { to: '/',       label: 'Scanner', icon: '📷' },
    { to: '/search', label: 'Search',  icon: '🔍' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-16 border-b border-white/10"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'rgba(57,255,20,0.15)',
            border: '1px solid rgba(57,255,20,0.4)',
            color: '#39ff14',
            boxShadow: '0 0 12px rgba(57,255,20,0.2)',
          }}
        >
          QR
        </div>
        <span className="font-bold text-sm md:text-base text-white tracking-tight">
          QR Attendance <span style={{ color: '#39ff14' }}>Scanner</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              id={`nav-${link.label.toLowerCase()}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { background: '#39ff14', color: '#000' } : undefined}
            >
              <span className="hidden sm:inline">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Connection status */}
      <div className="hidden md:block">
        <ConnectionStatus />
      </div>
    </nav>
  )
}
