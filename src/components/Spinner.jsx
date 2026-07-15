/**
 * Spinner — animated loading indicator with neon green color.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div
      className={`${sizes[size]} rounded-full border-transparent animate-spin ${className}`}
      style={{
        borderTopColor: '#39ff14',
        borderRightColor: 'rgba(57,255,20,0.3)',
      }}
      role="status"
      aria-label="Loading"
    />
  )
}
