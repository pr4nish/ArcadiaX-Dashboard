export default function LoadingSpinner({ label, fullscreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6' }} />
      {label && <p className="text-sm" style={{ color: '#9292A5' }}>{label}</p>}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#09090F' }}>
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>
}
