import { useState, useEffect, useCallback } from 'react'
import { FileText, Shield, MessageSquare, Activity, RefreshCw, Search } from 'lucide-react'
import { logsApi } from '../services/api'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const SEV_COLORS = { critical: '#EF4444', high: '#F59E0B', medium: '#8B5CF6', low: '#22C55E', info: '#06B6D4' }

const SEC_COLS = [
  { key: 'type', label: 'Event', render: v => <span className="text-xs font-medium text-purple-400">{v}</span> },
  { key: 'severity', label: 'Severity', render: v => {
    const c = SEV_COLORS[v] || '#9292A5'
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${c}20`, color: c }}>{v || '—'}</span>
  }},
  { key: 'actor_id', label: 'Actor', render: v => <code className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</code> },
  { key: 'details', label: 'Details', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : (v || '—')}</span> },
  { key: 'created_at', label: 'Time', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

const MSG_COLS = [
  { key: 'author_tag', label: 'Author', render: v => <span className="text-sm text-white">{v || '—'}</span> },
  { key: 'channel_name', label: 'Channel', render: v => <span className="text-xs text-purple-400">#{v || '?'}</span> },
  { key: 'content', label: 'Content', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{String(v || '').slice(0, 80)}{(v || '').length > 80 ? '…' : ''}</span> },
  { key: 'created_at', label: 'Time', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

const ACT_COLS = [
  { key: 'action', label: 'Action', render: v => <span className="text-xs font-medium text-white">{v}</span> },
  { key: 'performed_by', label: 'By', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</span> },
  { key: 'details', label: 'Details', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : (v || '—')}</span> },
  { key: 'created_at', label: 'Time', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

const TABS = [
  { key: 'security', label: 'Security', icon: Shield, cols: SEC_COLS },
  { key: 'messages', label: 'Messages', icon: MessageSquare, cols: MSG_COLS },
  { key: 'activity', label: 'Activity', icon: Activity, cols: ACT_COLS },
]

export default function Logs() {
  const [tab, setTab] = useState('security')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const LIMIT = 50

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      let res
      if (tab === 'security') res = await logsApi.security({ limit: LIMIT, offset })
      else if (tab === 'messages') res = await logsApi.messages({ limit: LIMIT, offset })
      else res = await logsApi.activity({ limit: LIMIT, offset })
      if (res?.success) setLogs(res.data || [])
    } catch (e) { setError(e?.error || 'Failed to load logs.') }
    finally { setLoading(false) }
  }, [tab, offset])

  useEffect(() => { setOffset(0) }, [tab])
  useEffect(() => { load() }, [load])

  const currentTab = TABS.find(t => t.key === tab)

  const filtered = search.trim()
    ? logs.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()))
    : logs

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <FileText size={20} style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Logs</h2>
          <p className="text-xs" style={{ color: '#9292A5' }}>View security, message and activity logs</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#10101A' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-all"
              style={{ background: tab === t.key ? '#8B5CF6' : 'transparent', color: tab === t.key ? '#fff' : '#9292A5' }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9292A5' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter logs..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
        </div>

        <button onClick={load} className="p-2 rounded-lg" style={{ color: '#9292A5' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <DataTable columns={currentTab?.cols || []} rows={filtered} empty={`No ${tab} logs found.`} />
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: '#9292A5' }}>
            Showing {filtered.length} of {logs.length} entries
            {search && ` (filtered)`}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
              style={{ background: '#10101A', color: '#9292A5', border: '1px solid rgba(139,92,246,0.15)' }}>
              Previous
            </button>
            <button onClick={() => setOffset(offset + LIMIT)} disabled={logs.length < LIMIT}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
              style={{ background: '#10101A', color: '#9292A5', border: '1px solid rgba(139,92,246,0.15)' }}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
