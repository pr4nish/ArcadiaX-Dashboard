import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#9292A5' }}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-3"
            style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
