import { useState, useCallback } from 'react'
import { searchStudents, approveEntry } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

/**
 * SearchPage — full-text search across all students.
 * Shows a results table with quick approve action.
 */
export default function SearchPage() {
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [searched, setSearched] = useState(false)
  const [approvingId, setApprovingId] = useState(null)

  const handleSearch = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    setSearched(true)

    const { data, error: err } = await searchStudents(query)
    if (err) {
      setError('Search failed. Please try again.')
    } else {
      setResults(data || [])
    }
    setLoading(false)
  }, [])

  const handleApprove = async (student) => {
    if (approvingId || student.attendance) return
    setApprovingId(student.id)

    const { data, error: err } = await approveEntry(student.id)
    if (err) {
      console.error('[SearchPage] Approve error:', err)
    } else if (data) {
      setResults((prev) =>
        prev.map((s) => s.id === student.id ? { ...s, attendance: true, entry_time: data.entry_time } : s)
      )
    }
    setApprovingId(null)
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          🔍 Student <span style={{ color: '#39ff14' }}>Search</span>
        </h1>
        <p className="text-gray-500 text-sm font-mono">
          Search by ID, name, email, semester, or division
        </p>
      </div>

      {/* Search bar */}
      <div className="glass-card p-4 mb-6">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Error */}
      {error && <ErrorMessage message={error} type="error" onDismiss={() => setError(null)} />}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Results table */}
      {!loading && searched && (
        <div className="glass-card overflow-hidden">
          {/* Count bar */}
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <p className="text-xs font-mono text-gray-500">
              {results.length === 0 ? 'No results found' : `${results.length} student${results.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3 opacity-30">🔍</p>
              <p className="text-gray-500 text-sm">No students match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full neon-table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left">ID</th>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Email</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Sem</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Div</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Entry Time</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((s) => (
                    <tr key={s.id} className="animate-fade-in">
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: '#39ff14' }}>{s.id}</td>
                      <td className="px-5 py-3 text-white text-sm font-medium">{s.name}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{s.gmail || '—'}</td>
                      <td className="px-5 py-3 text-gray-400 text-sm hidden sm:table-cell">{s.sem || '—'}</td>
                      <td className="px-5 py-3 text-gray-400 text-sm hidden sm:table-cell">{s.div || '—'}</td>
                      <td className="px-5 py-3">
                        {s.attendance
                          ? <span className="badge-success">✅ In</span>
                          : <span className="badge-pending">⏳ Pending</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs hidden md:table-cell">
                        {formatTime(s.entry_time)}
                      </td>
                      <td className="px-5 py-3">
                        {s.attendance ? (
                          <span className="text-yellow-500 text-xs font-mono">Already In</span>
                        ) : (
                          <button
                            onClick={() => handleApprove(s)}
                            disabled={!!approvingId}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black transition-all"
                            style={{
                              background: approvingId === s.id ? 'rgba(57,255,20,0.5)' : '#39ff14',
                              boxShadow: '0 0 8px rgba(57,255,20,0.3)',
                            }}
                            id={`approve-${s.id}`}
                          >
                            {approvingId === s.id ? '…' : '✅ Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Prompt if not searched yet */}
      {!loading && !searched && (
        <div className="text-center py-16 opacity-40">
          <p className="text-5xl mb-4">👆</p>
          <p className="text-gray-500 font-mono text-sm">Type something above to search</p>
        </div>
      )}
    </div>
  )
}
