import { useState, useEffect } from 'react'
import { checkConnection } from '../lib/supabase'

/**
 * ConnectionStatus — shows a live Supabase connectivity indicator.
 * Polls every 30 seconds.
 */
export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking') // 'checking' | 'online' | 'offline'

  const check = async () => {
    setStatus('checking')
    const ok = await checkConnection()
    setStatus(ok ? 'online' : 'offline')
  }

  useEffect(() => {
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [])

  const config = {
    checking: { dot: 'bg-yellow-400 animate-pulse', label: 'Connecting…', color: 'text-yellow-400' },
    online:   { dot: 'bg-neon-500 animate-pulse',   label: 'Supabase Online', color: 'text-neon-500' },
    offline:  { dot: 'bg-red-500 animate-pulse',    label: 'Offline', color: 'text-red-400' },
  }

  const c = config[status]

  return (
    <button
      onClick={check}
      title="Click to recheck connection"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-mono hover:border-white/20 transition-all"
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`}
        style={status === 'online' ? { backgroundColor: '#39ff14' } : undefined}
      />
      <span className={c.color}>{c.label}</span>
    </button>
  )
}
