import { useState, useCallback, useRef, useEffect } from 'react'
import { getStudentById, approveEntry } from '../lib/supabase'
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

  // Start a 5-second timer to auto-clear the scanned results
  const triggerResetTimer = useCallback(() => {
    clearResetTimer()
    resetTimeoutRef.current = setTimeout(() => {
      setStudent(null)
      setNotFound(false)
      setError(null)
    }, 5000) // 5 seconds
  }, [clearResetTimer])

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearResetTimer()
  }, [clearResetTimer])

  // Explicitly clear all states (e.g. on close click)
  const clearAllStates = useCallback(() => {
    clearResetTimer()
    setStudent(null)
    setNotFound(false)
    setError(null)
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
      console.error('[HomePage] Lookup error:', err)
      setError(`Database error: ${err.message || 'Unknown error'}`)
      playError()
      triggerResetTimer() // Clear error after 5s
    } else if (!data) {
      setNotFound(true)
      playError()
      triggerResetTimer() // Clear "Not Found" state after 5s
    } else if (data.attendance) {
      // Repeated scan -> show red cross warning with isRepeatedScan=true flag
      setStudent({ ...data, isRepeatedScan: true })
      playWarning()
      triggerResetTimer() // Clear warning card after 5s
    } else {
      // Valid scan, not checked in yet -> Auto Approve immediately!
      const { data: approvedData, error: approveErr } = await approveEntry(cleanId)
      if (approveErr) {
        console.error('[HomePage] Auto-approve error:', approveErr)
        setError('Database connection error. Failed to record attendance.')
        playError()
        triggerResetTimer()
      } else if (approvedData) {
        setStudent({ ...approvedData, isRepeatedScan: false })
        setHistoryKey((k) => k + 1) // Refresh scan history listing
        playSuccess()
        triggerResetTimer() // Clear success details card after 5s
      }
    }

    setLoading(false)
  }, [playError, playSuccess, playWarning, clearResetTimer, triggerResetTimer])

  /** Called when QR scanner fires */
  const handleScan = useCallback((id) => {
    lookupStudent(id)
  }, [lookupStudent])

  /** Called after manual/deep-link updates (kept as fallback wrapper) */
  const handleApproved = useCallback((updatedStudent) => {
    setStudent(updatedStudent)
    setHistoryKey((k) => k + 1)
    playSuccess()
    triggerResetTimer()
  }, [playSuccess, triggerResetTimer])

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
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

      {/* ── Center Content ── */}
      <div className="flex flex-col gap-6 mb-8">

        {/* ── Camera Scanner & Overlay Container ── */}
        <div className="glass-card p-5 relative overflow-hidden">
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

          {/* Scanner view with absolute result overlay */}
          <div className="relative rounded-2xl overflow-hidden bg-black min-h-[300px]">
            {/* Live Camera Feed */}
            <QRScanner
              isActive={scannerActive}
              onScan={handleScan}
              pauseMs={2000}
            />

            {/* Results Overlay (Completely fills the camera space) */}
            {(loading || student || notFound || error) && (
              <div className="absolute inset-0 z-30 bg-black/95 flex flex-col justify-center p-5 overflow-y-auto animate-fade-in">
                {/* Manual Dismiss button */}
                <button
                  onClick={clearAllStates}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl font-semibold leading-none z-40 p-2"
                  aria-label="Dismiss result"
                >
                  ×
                </button>

                {/* Loading state overlay */}
                {loading && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <Spinner size="lg" />
                    <div>
                      <p className="text-gray-400 text-sm text-center">Looking up student…</p>
                      <p className="text-gray-600 text-xs text-center font-mono mt-1">{lastScannedId}</p>
                    </div>
                  </div>
                )}

                {/* Database/Network Error overlay */}
                {!loading && error && (
                  <div className="py-4">
                    <ErrorMessage message={error} type="error" onDismiss={clearAllStates} />
                  </div>
                )}

                {/* Student Not Found (Red Cross) overlay */}
                {!loading && notFound && (
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75" />
                        <svg className="w-16 h-16 relative z-10 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="8" />
                          <path d="M33 33 L67 67 M67 33 L33 67" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-red-400 font-bold text-xl mb-2">Student Not Found</p>
                    <p className="text-gray-500 text-sm font-mono break-all px-4">{lastScannedId}</p>
                  </div>
                )}

                {/* Valid/Invalid Student Card details overlay */}
                {!loading && student && (
                  <div className="w-full max-h-full">
                    <StudentCard
                      student={student}
                      onApproved={handleApproved}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

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

      {/* ── Scan History ── */}
      <ScanHistory refreshTrigger={historyKey} />
    </div>
  )
}
