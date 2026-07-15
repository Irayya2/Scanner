import { useState } from 'react'
import { approveEntry } from '../lib/supabase'
import Spinner from './Spinner'

/**
 * StudentCard — displays student information and attendance controls.
 *
 * Props:
 *   student   — registration row from Supabase
 *   onApproved(updatedStudent) — called after successful approval
 */
export default function StudentCard({ student, onApproved }) {
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState(null)
  const [localStudent, setLocalStudent] = useState(student)

  // Keep in sync if parent sends a new student
  if (student !== localStudent && student?.id !== localStudent?.id) {
    setLocalStudent(student)
    setApproveError(null)
  }

  const handleApprove = async () => {
    if (approving || localStudent.attendance) return
    setApproving(true)
    setApproveError(null)

    const { data, error } = await approveEntry(localStudent.id)

    if (error) {
      console.error('[StudentCard] Approve error:', error)
      setApproveError('Failed to update attendance. Please try again.')
    } else if (data) {
      const updated = { ...localStudent, attendance: true, entry_time: data.entry_time }
      setLocalStudent(updated)
      onApproved?.(updated)
    }

    setApproving(false)
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="glass-card p-6 animate-glow-in relative overflow-hidden">
      {/* Glow Effect Background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Checkmark or Cross Banner depending on status */}
      {localStudent.isRepeatedScan ? (
        /* Repeated Check-in scan (Red Cross) */
        <div className="flex flex-col items-center justify-center text-center pb-6 mb-6 border-b border-white/10">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75" />
            <svg className="w-20 h-20 relative z-10 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="8" />
              <path d="M33 33 L67 67 M67 33 L33 67" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-red-500 font-mono text-sm tracking-widest uppercase font-bold animate-pulse" style={{ color: '#ef4444' }}>
            ⚠ REPEATED SCAN / ALREADY IN
          </span>
        </div>
      ) : (
        /* Valid new scan (Green Checkmark) */
        <div className="flex flex-col items-center justify-center text-center pb-6 mb-6 border-b border-white/10">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-full bg-neon-500/20 animate-ping opacity-75" />
            <svg className="w-20 h-20 relative z-10 filter drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#39ff14" strokeWidth="8" />
              <path d="M30 52 L45 66 L70 36" fill="none" stroke="#39ff14" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-neon-500 font-mono text-sm tracking-widest uppercase font-bold animate-pulse" style={{ color: '#39ff14' }}>
            ✓ ENTRY APPROVED
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(57,255,20,0.15), rgba(57,255,20,0.05))',
            border: '1px solid rgba(57,255,20,0.3)',
            color: '#39ff14',
          }}
        >
          {localStudent.name?.charAt(0).toUpperCase() || '?'}
        </div>

        {/* Name + ID */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{localStudent.name || 'Unknown'}</h2>
          <p className="text-sm font-mono mt-0.5" style={{ color: '#39ff14' }}>
            {localStudent.id}
          </p>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {localStudent.isRepeatedScan ? (
            <span className="badge-warning">⚠️ Already Checked In</span>
          ) : (
            <span className="badge-success">✅ Checked In</span>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <InfoField label="Email" value={localStudent.gmail || '—'} className="col-span-2" />
        <InfoField label="Semester" value={localStudent.sem  || '—'} />
        <InfoField label="Division" value={localStudent.div  || '—'} />
        <InfoField label="Entry Date" value={formatDate(localStudent.entry_time)} />
        <InfoField label="Entry Time" value={formatTime(localStudent.entry_time)} highlight />
      </div>

      {/* Status Message */}
      <div className="rounded-xl px-4 py-4 text-center border"
        style={
          localStudent.isRepeatedScan 
            ? { background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.25)' }
            : { background: 'rgba(57,255,20,0.05)', borderColor: 'rgba(57,255,20,0.25)' }
        }>
        {localStudent.isRepeatedScan ? (
          <>
            <p className="text-red-400 font-semibold text-base mb-1">Entry Denied (Already In)</p>
            <p className="text-red-300/60 text-xs font-mono">
              Scanned at {formatTime(localStudent.entry_time)}
            </p>
          </>
        ) : (
          <>
            <p className="text-neon-500 font-semibold text-base mb-1" style={{ color: '#39ff14' }}>Attendance Recorded</p>
            <p className="text-neon-500/60 text-xs font-mono" style={{ color: 'rgba(57,255,20,0.6)' }}>
              Checked in at {formatTime(localStudent.entry_time)}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value, highlight, className = '' }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-medium truncate ${highlight ? 'text-neon' : 'text-white'}`}
        style={highlight ? { color: '#39ff14' } : undefined}>
        {value}
      </p>
    </div>
  )
}
