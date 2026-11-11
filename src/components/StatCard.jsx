export default function StatCard({ icon: Icon, label, value, sub, color = '#8B5CF6', loading = false }) {
  return (
    <div className="rounded-xl p-5 flex items-start gap-4"
      style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
      <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20` }}>
        {Icon && <Icon size={20} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: '#9292A5' }}>{label}</p>
        {loading ? (
          <div className="h-7 w-20 rounded animate-pulse" style={{ background: '#1e1e35' }} />
        ) : (
          <p className="text-2xl font-bold text-white truncate">{value ?? '—'}</p>
        )}
        {sub && !loading && (
          <p className="text-xs mt-0.5 truncate" style={{ color: '#9292A5' }}>{sub}</p>
        )}
      </div>
    </div>
  )
}
