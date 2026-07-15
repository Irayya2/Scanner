import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getStudentById } from '../lib/supabase'
import StudentCard from '../components/StudentCard'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * VerifyPage — handles deep links like:
 *   /verify?id=CZ2026-00001
 *
 * Students can share their QR code that encodes this URL.
 * The page auto-fetches and displays the student card.
 */
export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const id             = searchParams.get('id')?.trim()

  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('No student ID provided in the URL.')
      return
    }

    const fetch = async () => {
      setLoading(true)
      const { data, error: err } = await getStudentById(id)

      if (err && err.code !== 'PGRST116') {
        setError(`Failed to load student: ${err.message}`)
      } else if (!data) {
        setNotFound(true)
      } else {
        setStudent(data)
      }
      setLoading(false)
    }

    fetch()
  }, [id])

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-gray-500 font-mono text-sm mb-2">Verifying</p>
        {id && (
          <p className="font-mono text-lg font-bold" style={{ color: '#39ff14' }}>{id}</p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Spinner size="lg" />
          <p className="text-gray-400 text-sm font-mono">Fetching student data…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="space-y-4">
          <ErrorMessage message={error} type="error" />
          <button onClick={() => navigate('/')} className="btn-outline w-full">
            ← Back to Scanner
          </button>
        </div>
      )}

      {!loading && notFound && (
        <div className="glass-card p-8 text-center space-y-4"
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
          <p className="text-red-400 font-bold text-xl">Student Not Found</p>
          <p className="text-gray-500 text-sm font-mono">{id}</p>
          <button onClick={() => navigate('/')} className="btn-outline w-full mt-4">
            ← Back to Scanner
          </button>
        </div>
      )}

      {/* Student card */}
      {!loading && student && (
        <div className="space-y-4 animate-slide-up">
          <StudentCard student={student} />
          <button onClick={() => navigate('/')} className="btn-outline w-full">
            ← Back to Scanner
          </button>
        </div>
      )}
    </div>
  )
}
