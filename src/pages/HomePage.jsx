import { useState, useCallback, useRef, useEffect } from 'react'
import { getStudentById } from '../lib/supabase'
import { useSound } from '../hooks/useSound'
import QRScanner from '../components/QRScanner'
import StudentCard from '../components/StudentCard'
import ManualEntry from '../components/ManualEntry'
import ScanHistory from '../components/ScanHistory'
import ConnectionStatus from '../components/ConnectionStatus'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * HomePage — main scanner page.
 * Features:
 *  - Start/Stop camera QR scanning
 *  - Manual ID entry
 *  - Student card with approve button
 *  - Today's scan history
 *  - Sound feedback
 *  - 10-second auto-reset timer for final states
 */
export default function HomePage() {
  const [scannerActive, setScannerActive]   = useState(false)
  const [loading, setLoading]               = useState(false)
  const [student, setStudent]               = useState(null)
  const [notFound, setNotFound]             = useState(false)
  const [error, setError]                   = useState(null)
  const [lastScannedId, setLastScannedId]   = useState(null)
  const [historyKey, setHistoryKey]         = useState(0) // triggers ScanHistory refresh

  const { playSuccess, playWarning, playError } = useSound()
  const resetTimeoutRef = useRef(null)

  // Clear any active auto-reset timer
  const clearResetTimer = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }, [])

  // Start a 10-second timer to auto-clear the scanned results
  const triggerResetTimer = useCallback(() => {
    clearResetTimer()
    resetTimeoutRef.current = setTimeout(() => {
      setStudent(null)
      setNotFound(false)
      setError(null)
    }, 10000)
  }, [clearResetTimer])

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearResetTimer()
  }, [clearResetTimer])

  /** Core lookup logic — used by both QR scan and manual entry */
  const lookupStudent = useCallback(async (id) => {
    if (!id) return
    const cleanId = id.trim()

    clearResetTimer()
    setLoading(true)
    setStudent(null)
    setNotFound(false)
    setError(null)
    setLastScannedId(cleanId)

    const { data, error: err } = await getStudentById(cleanId)

    if (err && err.code !== 'PGRST116') {
      // PGRST116 = "no rows found", which is handled below
      console.error('[HomePage] Lookup error:', err)
      setError(`Database error: ${err.message || 'Unknown error'}`)
      playError()
      triggerResetTimer() // Clear error after 10s
    } else if (!data) {
      setNotFound(true)
      playError()
      triggerResetTimer() // Clear "Not Found" state after 10s
    } else if (data.attendance) {
      setStudent(data)
      playWarning() // Already checked in
      triggerResetTimer() // Clear "Already Checked In" card after 10s
    } else {
      setStudent(data)
      playSuccess()
      // Note: We do NOT set the timer here because the volunteer needs time to click "Approve Entry"
    }

    setLoading(false)
  }, [playError, playSuccess, playWarning, clearResetTimer, triggerResetTimer])

  /** Called when QR scanner fires */
  const handleScan = useCallback((id) => {
    lookupStudent(id)
  }, [lookupStudent])

  /** Called after student card approves entry */
  const handleApproved = useCallback((updatedStudent) => {
    setStudent(updatedStudent)
    setHistoryKey((k) => k + 1) // refresh scan history
    playSuccess()
    triggerResetTimer() // Auto-clear approved student card after 10s
  }, [playSuccess, triggerResetTimer])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Page Header ── */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl md:text-5xl font-black tracking-tight mb-3"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #39ff14 60%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          QR Attendance Scanner
        </h1>
        <p className="text-gray-500 font-mono text-sm">
          Scan QR codes to mark student attendance instantly
        </p>
        <div className="flex justify-center mt-3 md:hidden">
          <ConnectionStatus />
        </div>
      </div>

      {/* ── Main layout: scanner left, card right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* ── Scanner Panel ── */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Camera Scanner</h2>
              <span
                className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
                  scannerActive
                    ? 'border-green-700/50 bg-green-900/30 text-green-400'
                    : 'border-gray-700/50 bg-gray-900/30 text-gray-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${scannerActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}
                />
                {scannerActive ? 'LIVE' : 'STOPPED'}
              </span>
            </div>

            {/* Scanner */}
            <QRScanner
              isActive={scannerActive}
              onScan={handleScan}
              pauseMs={2000}
            />

            {/* Start / Stop buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setScannerActive(true)}
                disabled={scannerActive}
                className="btn-neon flex-1 text-sm py-3"
                id="start-scanner-btn"
              >
                ▶ Start Scanner
              </button>
              <button
                onClick={() => setScannerActive(false)}
                disabled={!scannerActive}
                className="btn-outline flex-1 text-sm py-3"
                id="stop-scanner-btn"
              >
                ■ Stop Scanner
              </button>
            </div>
          </div>

          {/* ── Manual Entry ── */}
          <div className="glass-card p-5">
            <h2 className="font-semibold text-white mb-3">Manual ID Entry</h2>
            <ManualEntry onSearch={lookupStudent} loading={loading} />
          </div>
        </div>

        {/* ── Result Panel ── */}
        <div className="flex flex-col gap-4">
          {/* Loading */}
          {loading && (
            <div className="glass-card p-10 flex flex-col items-center gap-4 animate-fade-in">
              <Spinner size="lg" />
              <div>
                <p className="text-gray-400 text-sm text-center">Looking up student…</p>
                <p className="text-gray-600 text-xs text-center font-mono mt-1">{lastScannedId}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="animate-slide-up">
              <ErrorMessage message={error} type="error" onDismiss={() => setError(null)} />
            </div>
          )}

          {/* Not Found */}
          {!loading && notFound && (
            <div className="glass-card p-8 text-center animate-slide-up"
              style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75" />
                  <svg className="w-20 h-20 relative z-10 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="8" />
                    <path d="M33 33 L67 67 M67 33 L33 67" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <p className="text-red-400 font-bold text-xl mb-2">Student Not Found</p>
              <p className="text-gray-500 text-sm font-mono break-all">{lastScannedId}</p>
              <p className="text-gray-600 text-xs mt-2">
                No registration found for this ID.
              </p>
            </div>
          )}

          {/* Student Card */}
          {!loading && student && (
            <div className="animate-slide-up">
              <StudentCard
                student={student}
                onApproved={handleApproved}
              />
            </div>
          )}

          {/* Idle placeholder */}
          {!loading && !error && !notFound && !student && (
            <div className="glass-card p-10 flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: 240 }}>
              <div className="text-5xl opacity-20">🎫</div>
              <p className="text-gray-600 text-sm font-mono">Waiting for scan…</p>
              <p className="text-gray-700 text-xs">
                Start the camera or type an ID manually
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Scan History ── */}
      <ScanHistory refreshTrigger={historyKey} />
    </div>
  )
}
