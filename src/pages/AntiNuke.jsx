import { useState, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Plus, Trash2, Lock, Save, RefreshCw } from 'lucide-react'
import { antinukeApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Toggle from '../components/Toggle'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ChannelSelect from '../components/ChannelSelect'
import RoleSelect from '../components/RoleSelect'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const LOG_COLS = [
  { key: 'type', label: 'Event', render: v => <span className="text-purple-400 font-medium text-xs">{v}</span> },
  { key: 'actor_id', label: 'Actor', render: v => <code className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</code> },
  { key: 'details', label: 'Details', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{typeof v === 'object' ? JSON.stringify(v).slice(0,60) : (v || '—')}</span> },
  { key: 'action_taken', label: 'Action', render: v => <span className="text-xs text-yellow-400">{v || '—'}</span> },
  { key: 'created_at', label: 'Time', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

const TRUSTED_COLS = [
  { key: 'user_tag', label: 'User Tag' },
  { key: 'user_id', label: 'User ID', render: v => <code className="text-xs" style={{ color: '#9292A5' }}>{v}</code> },
  { key: 'notes', label: 'Notes', render: v => <span style={{ color: '#9292A5' }}>{v || '—'}</span> },
]

function ThresholdRow({ label, field, settings, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="text-sm text-white">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: '#9292A5' }}>Threshold</label>
          <input type="number" min={1} max={100}
            value={settings[`${field}_threshold`] ?? 5}
            onChange={e => onChange(`${field}_threshold`, parseInt(e.target.value))}
            className="w-16 px-2 py-1 rounded text-sm text-white text-center"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: '#9292A5' }}>Window (s)</label>
          <input type="number" min={1} max={3600}
            value={settings[`${field}_window`] ?? 60}
            onChange={e => onChange(`${field}_window`, parseInt(e.target.value))}
            className="w-20 px-2 py-1 rounded text-sm text-white text-center"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
        </div>
      </div>
    </div>
  )
}

export default function AntiNuke() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({})
  const [logs, setLogs] = useState([])
  const [trusted, setTrusted] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [lockdownModal, setLockdownModal] = useState(false)
  const [addTrustedModal, setAddTrustedModal] = useState(false)
  const [trustedForm, setTrustedForm] = useState({ user_id: '', user_tag: '', notes: '' })

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [cfg, lg] = await Promise.all([antinukeApi.get(), antinukeApi.logs()])
      if (cfg?.success) {
        setSettings(cfg.data.settings || cfg.data || {})
        setTrusted(cfg.data.trusted || [])
      }
      if (lg?.success) setLogs(lg.data || [])
    } catch (e) { setError(e?.error || 'Failed to load Anti-Nuke settings.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await antinukeApi.update(settings)
      if (res?.success) addToast('Anti-Nuke settings saved!', 'success')
      else addToast(res?.error || 'Save failed', 'error')
    } catch (e) { addToast(e?.error || 'Save failed', 'error') }
    finally { setSaving(false) }
  }

  const triggerLockdown = async () => {
    setLockdownModal(false)
    try {
      const res = await antinukeApi.lockdown()
      if (res?.success) addToast('Emergency lockdown activated!', 'warning')
      else addToast(res?.error || 'Lockdown failed', 'error')
    } catch (e) { addToast(e?.error || 'Lockdown failed', 'error') }
  }

  const addTrusted = async () => {
    if (!trustedForm.user_id) return addToast('User ID is required', 'error')
    try {
      const res = await antinukeApi.addTrusted(trustedForm)
      if (res?.success) {
        addToast('Trusted user added!', 'success')
        setAddTrustedModal(false)
        setTrustedForm({ user_id: '', user_tag: '', notes: '' })
        load()
      } else addToast(res?.error || 'Failed to add', 'error')
    } catch (e) { addToast(e?.error || 'Failed to add', 'error') }
  }

  const removeTrusted = async (id) => {
    try {
      await antinukeApi.removeTrusted(id)
      addToast('Trusted user removed', 'success')
      load()
    } catch (e) { addToast(e?.error || 'Failed to remove', 'error') }
  }

  if (loading) return <LoadingSpinner label="Loading Anti-Nuke..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Shield size={20} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Anti-Nuke Protection</h2>
            <p className="text-xs" style={{ color: '#9292A5' }}>Protects against mass destructive server actions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setLockdownModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Lock size={14} /> Emergency Lockdown
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Master Toggle */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Enable Anti-Nuke</p>
            <p className="text-sm mt-0.5" style={{ color: '#9292A5' }}>Monitor and respond to suspicious server-wide actions</p>
          </div>
          <Toggle checked={!!settings?.enabled} onChange={v => update('enabled', v)} />
        </div>
      </div>

      {/* Thresholds */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <h3 className="font-semibold text-white mb-4">Detection Thresholds</h3>
        {[
          { label: 'Channel Deletion', field: 'channel_delete' },
          { label: 'Channel Creation', field: 'channel_create' },
          { label: 'Role Deletion',    field: 'role_delete' },
          { label: 'Role Creation',    field: 'role_create' },
          { label: 'Mass Ban',          field: 'mass_ban' },
          { label: 'Mass Kick',         field: 'mass_kick' },
        ].map(item => (
          <ThresholdRow key={item.field} {...item} settings={settings} onChange={update} />
        ))}
      </div>

      {/* Response & Channel */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <h3 className="font-semibold text-white mb-4">Response Action</h3>
          <select value={settings?.response_action || 'strip_roles'}
            onChange={e => update('response_action', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', color: '#fff', outline: 'none' }}>
            <option value="strip_roles">Strip Roles</option>
            <option value="quarantine_role">Assign Quarantine Role</option>
            <option value="alert_only">Alert Only</option>
          </select>
          {settings?.response_action === 'quarantine_role' && (
            <div className="mt-3">
              <label className="text-xs mb-1 block" style={{ color: '#9292A5' }}>Quarantine Role</label>
              <RoleSelect value={settings?.quarantine_role_id} onChange={v => update('quarantine_role_id', v)} placeholder="Select quarantine role..." />
            </div>
          )}
        </div>
        <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <h3 className="font-semibold text-white mb-4">Alert Channel</h3>
          <ChannelSelect value={settings?.log_channel_id} onChange={v => update('log_channel_id', v)} placeholder="Select alert channel..." />
        </div>
      </div>

      {/* Trusted Users */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Trusted Users</h3>
          <button onClick={() => setAddTrustedModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Plus size={12} /> Add User
          </button>
        </div>
        <DataTable
          columns={[...TRUSTED_COLS, {
            key: 'id', label: 'Actions',
            render: (_, row) => (
              <button onClick={() => removeTrusted(row.id)}
                className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                style={{ color: '#EF4444' }}>
                <Trash2 size={14} />
              </button>
            )
          }]}
          rows={trusted}
          empty="No trusted users configured." />
      </div>

      {/* Security Logs */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Security Logs</h3>
          <button onClick={load} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#9292A5' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <DataTable columns={LOG_COLS} rows={logs} empty="No security events recorded." />
      </div>

      {/* Lockdown Modal */}
      <Modal open={lockdownModal} onClose={() => setLockdownModal(false)} title="⚠️ Emergency Lockdown"
        footer={<>
          <button onClick={() => setLockdownModal(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={triggerLockdown} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#EF4444', color: '#fff' }}>Activate Lockdown</button>
        </>}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={28} style={{ color: '#EF4444' }} />
          </div>
          <p className="text-white font-semibold mb-2">Are you sure?</p>
          <p className="text-sm" style={{ color: '#9292A5' }}>
            This will immediately revoke dangerous permissions from all non-trusted users. This action is logged.
          </p>
        </div>
      </Modal>

      {/* Add Trusted Modal */}
      <Modal open={addTrustedModal} onClose={() => setAddTrustedModal(false)} title="Add Trusted User"
        footer={<>
          <button onClick={() => setAddTrustedModal(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={addTrusted} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#8B5CF6', color: '#fff' }}>Add User</button>
        </>}>
        <div className="space-y-4">
          {[
            { key: 'user_id', label: 'Discord User ID *', placeholder: '123456789012345678' },
            { key: 'user_tag', label: 'Username (optional)', placeholder: 'Username' },
            { key: 'notes', label: 'Notes (optional)', placeholder: 'Reason for trust...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>{f.label}</label>
              <input value={trustedForm[f.key]} onChange={e => setTrustedForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
