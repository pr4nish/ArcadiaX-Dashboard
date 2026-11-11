import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Bot, Save } from 'lucide-react'
import { autoroleApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import Toggle from '../components/Toggle'
import RoleSelect from '../components/RoleSelect'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

function AutoRoleCard({ title, icon: Icon, iconColor, typeKey, settings, onUpdate, onSave, saving }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}20` }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{title}</p>
          <p className="text-xs" style={{ color: '#9292A5' }}>Automatically assigned on join</p>
        </div>
        <Toggle checked={!!settings?.[`${typeKey}_enabled`]} onChange={v => onUpdate(`${typeKey}_enabled`, v)} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs block mb-2 font-medium" style={{ color: '#9292A5' }}>Role to Assign</label>
          <RoleSelect
            value={settings?.[`${typeKey}_role_id`]}
            onChange={v => onUpdate(`${typeKey}_role_id`, v)}
            placeholder={`Select ${title.toLowerCase()} role...`}
            disabled={!settings?.[`${typeKey}_enabled`]} />
        </div>

        {settings?.[`${typeKey}_role_id`] && settings?.[`${typeKey}_enabled`] && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Role selected · will be assigned on join
          </div>
        )}

        <button onClick={onSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function AutoRole() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingHuman, setSavingHuman] = useState(false)
  const [savingBot, setSavingBot] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await autoroleApi.get()
      if (res?.success) setSettings(res.data || {})
    } catch (e) { setError(e?.error || 'Failed to load Auto Role settings.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const save = async (type) => {
    const setter = type === 'human' ? setSavingHuman : setSavingBot
    setter(true)
    try {
      const res = await autoroleApi.update(settings)
      if (res?.success) addToast(`${type === 'human' ? 'Human' : 'Bot'} auto role saved!`, 'success')
      else addToast(res?.error || 'Save failed', 'error')
    } catch (e) { addToast(e?.error || 'Save failed', 'error') }
    finally { setter(false) }
  }

  if (loading) return <LoadingSpinner label="Loading Auto Role settings..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
          <UserPlus size={20} style={{ color: '#A855F7' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Auto Role</h2>
          <p className="text-xs" style={{ color: '#9292A5' }}>Automatically assign roles to new members</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <AutoRoleCard title="Human Auto Role" icon={UserPlus} iconColor="#8B5CF6"
          typeKey="human" settings={settings} onUpdate={update} onSave={() => save('human')} saving={savingHuman} />
        <AutoRoleCard title="Bot Auto Role" icon={Bot} iconColor="#A855F7"
          typeKey="bot" settings={settings} onUpdate={update} onSave={() => save('bot')} saving={savingBot} />
      </div>
    </div>
  )
}
