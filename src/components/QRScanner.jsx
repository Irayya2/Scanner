import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'

/**
 * QRScanner — camera-based QR code scanner using html5-qrcode.
 *
 * Supports two QR formats:
 *   1. Raw ID:  "CZ2026-00001"
 *   2. URL:     "https://domain.com/verify?id=CZ2026-00001"
 *
 * Props:
 *   onScan(id)   — called with extracted student ID
 *   isActive     — whether scanning should be running
 *   pauseMs      — pause after each scan (ms), default 2000
 */
export default function QRScanner({ onScan, isActive, pauseMs = 2000 }) {
  const scannerRef = useRef(null)   // Html5Qrcode instance
  const pausedRef  = useRef(false)  // debounce flag
  const containerId = 'qr-reader'

  const [starting, setStarting]   = useState(false)
  const [error, setError]         = useState(null)
  const [cameraReady, setCameraReady] = useState(false)

  /**
   * Extract student ID from raw text.
   * Handles both raw IDs and full verify URLs.
   */
  const extractId = useCallback((text) => {
    text = text.trim()
    try {
      const url = new URL(text)
      const id = url.searchParams.get('id')
      if (id) return id.trim()
    } catch {
      // Not a URL — treat as raw ID
    }
    return text
  }, [])

  /** Start the QR scanner */
  const startScanner = useCallback(async () => {
    if (scannerRef.current) return // Already running
    setError(null)
    setStarting(true)

    // html5-qrcode callback config
    const qrConfig = {
      fps: 15, // Higher frame rate for smoother performance on modern Android GPUs
      qrbox: (width, height) => {
        const minEdge = Math.min(width, height)
        // Dynamically size qrbox to 70% of viewport min-edge, clamped between 180px and 280px
        const qrboxSize = Math.max(180, Math.min(280, Math.floor(minEdge * 0.7)))
        return { width: qrboxSize, height: qrboxSize }
      },
      aspectRatio: 1.0,
      disableFlip: false,
    }

    // onSuccess handler
    const onSuccess = (decodedText) => {
      if (pausedRef.current) return
      pausedRef.current = true
      const id = extractId(decodedText)
      if (id) onScan(id)
      setTimeout(() => { pausedRef.current = false }, pauseMs)
    }

    const tryStart = async (cameraConfig) => {
      const html5QrCode = new Html5Qrcode(containerId)
      scannerRef.current = html5QrCode
      // onError ignored — fires continuously when no QR in frame
      await html5QrCode.start(cameraConfig, qrConfig, onSuccess, () => {})
    }

    try {
      // html5-qrcode requires facingMode as a plain string, not MediaTrackConstraints
      // Try rear camera first (preferred for mobile scanning)
      await tryStart({ facingMode: 'environment' })
      setCameraReady(true)
    } catch (rearErr) {
      console.warn('[QRScanner] Rear camera failed, trying front camera:', rearErr?.message)
      // Clear any partial state before retrying
      scannerRef.current = null
      try {
        await tryStart({ facingMode: 'user' })
        setCameraReady(true)
      } catch (err) {
        console.error('[QRScanner] Start error:', err)
        scannerRef.current = null

        if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
          setError('Camera permission denied. Please allow camera access in your browser settings.')
        } else if (err?.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError(`Camera error: ${err?.message || 'Unknown error'}`)
        }
      }
    } finally {
      setStarting(false)
    }
  }, [extractId, onScan, pauseMs])

  /** Stop the QR scanner */
  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
      scannerRef.current.clear()
    } catch (err) {
      console.warn('[QRScanner] Stop error:', err)
    }
    scannerRef.current = null
    setCameraReady(false)
    pausedRef.current = false
  }, [])

  // React to isActive changes
  useEffect(() => {
    if (isActive) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  return (
    <div className="relative">
      {/* Camera container */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">
        {/* The html5-qrcode mounts here */}
        <div id={containerId} className="w-full" style={{ minHeight: 280 }} />

        {/* Scan overlay — only shown when camera is ready */}
        {cameraReady && (
          <div className="scan-line-container absolute inset-0">
            <div className="scan-line" />
            <div className="scan-corner scan-corner-tl" />
            <div className="scan-corner scan-corner-tr" />
            <div className="scan-corner scan-corner-bl" />
            <div className="scan-corner scan-corner-br" />
          </div>
        )}

        {/* Starting state */}
        {starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 rounded-2xl">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400 font-mono">Initializing camera…</p>
          </div>
        )}

        {/* Idle state */}
        {!isActive && !starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 rounded-2xl"
            style={{ minHeight: 280 }}>
            <div className="text-6xl opacity-30">📷</div>
            <p className="text-gray-500 font-mono text-sm">Camera stopped</p>
            <p className="text-gray-600 text-xs">Press Start Scanner to begin</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} type="error" onDismiss={() => setError(null)} />
        </div>
      )}
    </div>
  )
}
