import { useState, useRef, useEffect } from 'react'

/**
 * SearchBar — debounced search input.
 * Props:
 *   onSearch(query) — called 400ms after the user stops typing
 *   placeholder
 *   loading
 */
export default function SearchBar({ onSearch, placeholder = 'Search by ID, name, email, semester, division…', loading = false }) {
  const [value, setValue] = useState('')
  const debounceRef = useRef(null)

  const handleChange = (e) => {
    const val = e.target.value
    setValue(val)

    // Debounce
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(val.trim())
    }, 400)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className="relative flex items-center">
      {/* Search icon */}
      <div className="absolute left-4 pointer-events-none">
        {loading ? (
          <div className="w-4 h-4 rounded-full border border-transparent animate-spin"
            style={{ borderTopColor: '#39ff14', borderRightColor: 'rgba(57,255,20,0.3)' }} />
        ) : (
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-neon pl-11 pr-10"
        aria-label="Search students"
        id="student-search"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
