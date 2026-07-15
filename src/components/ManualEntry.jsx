import { useState } from 'react'
import Spinner from './Spinner'

/**
 * ManualEntry — text input to manually type a student ID.
 *
 * Props:
 *   onSearch(id) — called with trimmed ID
 *   loading      — disables button while processing
 */
export default function ManualEntry({ onSearch, loading = false }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = value.trim()
    if (!id) return
    onSearch(id)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type ID manually e.g. CZ2026-00001"
        className="input-neon flex-1 font-mono text-sm"
        aria-label="Manual student ID entry"
        id="manual-id-input"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="btn-neon flex items-center gap-2 px-5 whitespace-nowrap flex-shrink-0"
        id="manual-search-btn"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Searching</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
          </>
        )}
      </button>
    </form>
  )
}
