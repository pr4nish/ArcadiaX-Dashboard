import { useState, useEffect, useCallback } from 'react'
import { Eye, Save, RefreshCw } from 'lucide-react'
import { antibetrayApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Toggle from '../components/Toggle'
import DataTable from '../components/DataTable'
import ChannelSelect from '../components/ChannelSelect'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const LOG_COLS = [
  { key: 'type', label: 'Event', render: v => <span className="text-yellow-400 font-medium text-xs">{v}</span> },
  { key: 'actor_id', label: 'Actor', render: v => <code className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</code> },
  { key: 'details', label: 'Details', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{typeof v === 'object' ? JSON.stringify(v).slice(0,60) : (v || '—')}</span> },
  { key: 'rollback_attempted', label: 'Rollback', render: v => <span className={`text-xs ${v ? 'text-green-400' : 'text-gray-500'}`}>{v ? 'Yes' : 'No'}</span> },
  { key: 'created_at', label: 'Time', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

const FEATURES = [
  { key: 'admin_perm_monitoring',    label: 'Administrator Permission Monitoring', desc: 'Alert when admin perms are granted' },
  { key: 'role_hierarchy_monitoring', label: 'Role Hierarchy Monitoring',           desc: 'Detect unauthorized role hierarchy changes' },
  { key: 'channel_perm_monitoring',   label: 'Channel Permission Monitoring',       desc: 'Monitor channel-level permission overwrites' },
  { key: 'webhook_monitoring',        label: 'Webhook Monitoring',                  desc: 'Alert on unauthorized webhook creation' },
  { key: 'auto_rollback',             label: 'Auto Rollback',                       desc: 'Attempt to automatically revert detected changes' },
]

export default function AntiBetray() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({})
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [cfg, lg] = await Promise.all([antibetrayApi.get(), antibetrayApi.logs()])
      if (cfg?.success) setSettings(cfg.data.settings || cfg.data || {})
      if (lg?.success) setLogs(lg.data || [])
    } catch (e) { setError(e?.error || 'Failed to load Anti-Betray settings.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await antibetrayApi.update(settings)
      if (res?.success) addToast('Anti-Betray settings saved!', 'success')
      else addToast(res?.error || 'Save failed', 'error')
    } catch (e) { addToast(e?.error || 'Save failed', 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner label="Loading Anti-Betray..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Eye size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Anti-Betray Protection</h2>
            <p className="text-xs" style={{ color: '#9292A5' }}>Monitor staff members for unauthorized permission changes</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Master Toggle */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Enable Anti-Betray</p>
            <p className="text-sm mt-0.5" style={{ color: '#9292A5' }}>Monitor staff for unauthorized dangerous permission changes</p>
          </div>
          <Toggle checked={!!settings?.enabled} onChange={v => update('enabled', v)} />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <h3 className="font-semibold text-white mb-4">Detection Features</h3>
        <div className="space-y-1">
          {FEATURES.map(feat => (
            <div key={feat.key}
              className="flex items-start justify-between gap-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-sm text-white font-medium">{feat.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9292A5' }}>{feat.desc}</p>
              </div>
              <Toggle checked={!!settings?.[feat.key]} onChange={v => update(feat.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Alert Channel */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <h3 className="font-semibold text-white mb-3">Alert Channel</h3>
        <ChannelSelect value={settings?.log_channel_id} onChange={v => update('log_channel_id', v)} placeholder="Select alert channel..." />
      </div>

      {/* Event Logs */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Event History</h3>
          <button onClick={load} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#9292A5' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <DataTable columns={LOG_COLS} rows={logs} empty="No betrayal events recorded." />
      </div>
    </div>
  )
}
