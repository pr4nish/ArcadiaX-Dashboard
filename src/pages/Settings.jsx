import { useState, useEffect, useCallback } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { settingsApi, dashboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ChannelSelect from '../components/ChannelSelect'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

export default function Settings() {
  const { guild } = useAuth()
  const { addToast } = useToast()
  const [settings, setSettings] = useState({})
  const [botStatus, setBotStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [apiPing, setApiPing] = useState(null)
  const [pinging, setPinging] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [cfg, st] = await Promise.all([settingsApi.get(), dashboardApi.status()])
      if (cfg?.success) setSettings(cfg.data || {})
      if (st?.success) setBotStatus(st.data)
    } catch (e) { setError(e?.error || 'Failed to load settings.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await settingsApi.update(settings)
      if (res?.success) addToast('Settings saved!', 'success')
      else addToast(res?.error || 'Save failed', 'error')
    } catch (e) { addToast(e?.error || 'Save failed', 'error') }
    finally { setSaving(false) }
  }

  const pingApi = async () => {
    setPinging(true)
    const start = Date.now()
    try {
      await dashboardApi.status()
      setApiPing(Date.now() - start)
    } catch (_) { setApiPing(-1) }
    finally { setPinging(false) }
  }

  if (loading) return <LoadingSpinner label="Loading settings..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  const infoRow = (label, value) => (
    <div key={label} className="flex justify-between items-center py-2.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="text-xs" style={{ color: '#9292A5' }}>{label}</span>
      <span className="text-sm text-white font-medium max-w-[60%] text-right truncate">{value || '—'}</span>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <SettingsIcon size={20} style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Settings</h2>
            <p className="text-xs" style={{ color: '#9292A5' }}>Manage bot configuration and system information</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Server Info */}
        <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <h3 className="font-semibold text-white mb-3">Server Info</h3>
          {infoRow('Server Name', guild?.name)}
          {infoRow('Server ID', guild?.id)}
          {infoRow('Members', guild?.memberCount?.toLocaleString())}
          {infoRow('Owner ID', guild?.ownerId)}
        </div>

        {/* Bot Info */}
        <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <h3 className="font-semibold text-white mb-3">Bot Info</h3>
          {infoRow('Bot Tag', botStatus?.bot?.tag)}
          {infoRow('Status', botStatus?.bot?.status)}
          {infoRow('Uptime', botStatus?.bot?.uptime)}
          {infoRow('Ping', botStatus?.bot?.ping != null ? `${botStatus.bot.ping}ms` : undefined)}
        </div>

        {/* Config */}
        <div className="rounded-xl p-5 md:col-span-2" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <h3 className="font-semibold text-white mb-4">Bot Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Log Channel</label>
              <ChannelSelect value={settings?.log_channel_id} onChange={v => update('log_channel_id', v)} placeholder="Select log channel..." />
            </div>
            <div>
              <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Security Alert Channel</label>
              <ChannelSelect value={settings?.security_alert_channel_id} onChange={v => update('security_alert_channel_id', v)} placeholder="Select alert channel..." />
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="rounded-xl p-5 md:col-span-2" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">API Connection</h3>
            <button onClick={pingApi} disabled={pinging}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ color: '#9292A5' }}>
              <RefreshCw size={12} className={pinging ? 'animate-spin' : ''} /> Test Connection
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {apiPing === null ? (
              <><Wifi size={16} style={{ color: '#9292A5' }} /><span style={{ color: '#9292A5' }}>Click "Test Connection" to check API latency</span></>
            ) : apiPing === -1 ? (
              <><WifiOff size={16} style={{ color: '#EF4444' }} /><span style={{ color: '#EF4444' }}>API unreachable — check backend connection</span></>
            ) : (
              <><Wifi size={16} style={{ color: '#22C55E' }} /><span style={{ color: '#22C55E' }}>Connected · {apiPing}ms latency</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
