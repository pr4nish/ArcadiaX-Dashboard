import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="animate-toast cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
            style={{
              background: toast.type === 'success'
                ? 'linear-gradient(135deg, #22C55E22, #151522)'
                : toast.type === 'error'
                ? 'linear-gradient(135deg, #EF444422, #151522)'
                : toast.type === 'warning'
                ? 'linear-gradient(135deg, #F59E0B22, #151522)'
                : 'linear-gradient(135deg, #8B5CF622, #151522)',
              border: `1px solid ${toast.type === 'success' ? '#22C55E44' : toast.type === 'error' ? '#EF444444' : toast.type === 'warning' ? '#F59E0B44' : '#8B5CF644'}`,
            }}
          >
            <span className="text-lg">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span style={{ color: toast.type === 'success' ? '#86EFAC' : toast.type === 'error' ? '#FCA5A5' : toast.type === 'warning' ? '#FDE68A' : '#C4B5FD' }}>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
