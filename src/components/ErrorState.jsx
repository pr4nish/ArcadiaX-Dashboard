import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="rounded-xl p-8 flex flex-col items-center gap-4 text-center"
      style={{ background: '#151522', border: '1px solid rgba(239,68,68,0.2)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)' }}>
        <AlertTriangle size={22} style={{ color: '#EF4444' }} />
      </div>
      <div>
        <p className="font-semibold text-white mb-1">Error</p>
        <p className="text-sm" style={{ color: '#9292A5' }}>{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  )
}
