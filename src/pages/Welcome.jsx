import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageSquare, Save } from 'lucide-react'
import { welcomeApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Toggle from '../components/Toggle'
import ChannelSelect from '../components/ChannelSelect'
import EmbedPreview from '../components/EmbedPreview'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const VARS = ['{user}', '{username}', '{server}', '{memberCount}', '{userAvatar}']

function VarChips({ onInsert }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {VARS.map(v => (
        <button key={v} onClick={() => onInsert(v)}
          className="px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors hover:opacity-80"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#A855F7', border: '1px solid rgba(139,92,246,0.3)' }}>
          {v}
        </button>
      ))}
    </div>
  )
}

export default function Welcome() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await welcomeApi.get()
      if (res?.success) setSettings(res.data || {})
    } catch (e) { setError(e?.error || 'Failed to load Welcome settings.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))
  const updateEmbed = (key, val) => setSettings(s => ({ ...s, embed: { ...(s.embed || {}), [key]: val } }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await welcomeApi.update(settings)
      if (res?.success) addToast('Welcome settings saved!', 'success')
      else addToast(res?.error || 'Save failed', 'error')
    } catch (e) { addToast(e?.error || 'Save failed', 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner label="Loading Welcome settings..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  const previewEmbed = {
    color: settings?.embed?.color || '#8B5CF6',
    title: settings?.embed?.title || 'Welcome!',
    description: settings?.embed?.description || settings?.message || 'Welcome to the server!',
    footer: settings?.embed?.footer_text ? { text: settings.embed.footer_text } : undefined,
  }

  const inputStyle = { background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', color: '#fff', outline: 'none' }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
            <MessageSquare size={20} style={{ color: '#22C55E' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Welcome & Goodbye</h2>
            <p className="text-xs" style={{ color: '#9292A5' }}>Customize join and leave messages</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings column */}
        <div className="space-y-5">
          {/* Welcome */}
          <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Welcome Message</h3>
              <Toggle checked={!!settings?.welcome_enabled} onChange={v => update('welcome_enabled', v)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Channel</label>
                <ChannelSelect value={settings?.welcome_channel_id} onChange={v => update('welcome_channel_id', v)} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Embed Title</label>
                <input value={settings?.embed?.title || ''} onChange={e => updateEmbed('title', e.target.value)}
                  placeholder="Welcome to {server}!" className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Description</label>
                <VarChips onInsert={v => updateEmbed('description', (settings?.embed?.description || '') + v)} />
                <textarea value={settings?.embed?.description || settings?.message || ''}
                  onChange={e => updateEmbed('description', e.target.value)}
                  placeholder="Hey {user}, welcome to {server}!"
                  rows={3} className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Embed Color</label>
                <div className="flex gap-2">
                  <input type="color" value={settings?.embed?.color || '#8B5CF6'}
                    onChange={e => updateEmbed('color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer p-1 flex-shrink-0"
                    style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)' }} />
                  <input value={settings?.embed?.color || '#8B5CF6'}
                    onChange={e => updateEmbed('color', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Footer Text</label>
                <input value={settings?.embed?.footer_text || ''} onChange={e => updateEmbed('footer_text', e.target.value)}
                  placeholder="ArcadiaX • {server}" className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-white">Send DM Welcome</span>
                <Toggle checked={!!settings?.dm_welcome} onChange={v => update('dm_welcome', v)} />
              </div>
            </div>
          </div>

          {/* Goodbye */}
          <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Goodbye Message</h3>
              <Toggle checked={!!settings?.goodbye_enabled} onChange={v => update('goodbye_enabled', v)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Channel</label>
                <ChannelSelect value={settings?.goodbye_channel_id} onChange={v => update('goodbye_channel_id', v)} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Goodbye Message</label>
                <VarChips onInsert={v => update('goodbye_message', (settings?.goodbye_message || '') + v)} />
                <textarea value={settings?.goodbye_message || ''}
                  onChange={e => update('goodbye_message', e.target.value)}
                  placeholder="{username} has left the server. We now have {memberCount} members."
                  rows={3} className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Preview column */}
        <div>
          <h3 className="font-semibold text-white mb-3">Live Preview</h3>
          <EmbedPreview embed={previewEmbed} />
        </div>
      </div>
    </div>
  )
}
