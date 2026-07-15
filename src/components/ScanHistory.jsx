import { useState, useEffect, useCallback } from 'react'
import { getTodayScans } from '../lib/supabase'
import Spinner from './Spinner'

/**
 * ScanHistory — displays today's approved attendance records.
 * Auto-refreshes when refreshTrigger changes.
 *
 * Props:
 *   refreshTrigger — increment this to force a refresh
 */
export default function ScanHistory({ refreshTrigger = 0 }) {
  const [scans, setScans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await getTodayScans()
    if (err) {
      setError('Failed to load scan history.')
    } else {
      setScans(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshTrigger])

  const formatTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h3 className="font-semibold text-white">Today's Scans</h3>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">
            {loading ? 'Loading…' : `${scans.length} entries`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm text-center py-8 px-4">{error}</p>
        ) : scans.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-4xl mb-3 opacity-30">📭</p>
            <p className="text-gray-500 text-sm font-mono">No scans yet today</p>
          </div>
        ) : (
          <table className="w-full neon-table">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Sem</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Div</th>
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan, idx) => (
                <tr key={scan.id} className="animate-fade-in">
                  <td className="px-5 py-3 text-gray-600 font-mono text-xs">{idx + 1}</td>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: '#39ff14' }}>{scan.id}</td>
                  <td className="px-5 py-3 text-white text-sm font-medium">{scan.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-sm hidden sm:table-cell">{scan.sem}</td>
                  <td className="px-5 py-3 text-gray-400 text-sm hidden sm:table-cell">{scan.div}</td>
                  <td className="px-5 py-3 text-gray-300 font-mono text-xs">{formatTime(scan.entry_time)}</td>
                  <td className="px-5 py-3">
                    <span className="badge-success">✅ In</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
