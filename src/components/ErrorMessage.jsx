/**
 * ErrorMessage — displays a clean error with icon.
 * @param {string} message
 * @param {'error'|'warning'|'info'} type
 * @param {function} onDismiss
 */
export default function ErrorMessage({ message, type = 'error', onDismiss }) {
  if (!message) return null

  const styles = {
    error:   { icon: '❌', bg: 'bg-red-950/50',    border: 'border-red-800/60',   text: 'text-red-300'    },
    warning: { icon: '⚠️', bg: 'bg-yellow-950/50', border: 'border-yellow-800/60', text: 'text-yellow-300' },
    info:    { icon: 'ℹ️', bg: 'bg-blue-950/50',   border: 'border-blue-800/60',   text: 'text-blue-300'   },
  }

  const s = styles[type] || styles.error

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${s.bg} ${s.border} animate-fade-in`}
      role="alert"
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{s.icon}</span>
      <p className={`text-sm font-medium flex-1 ${s.text}`}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}
