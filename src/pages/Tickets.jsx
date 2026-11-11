import { useState, useEffect, useCallback } from 'react'
import { Ticket as TicketIcon, Settings, Plus, Trash2, Save, Send, RefreshCw } from 'lucide-react'
import { ticketApi, guildApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import ChannelSelect from '../components/ChannelSelect'
import RoleSelect from '../components/RoleSelect'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const STATUS_COLORS = { open: '#22C55E', claimed: '#F59E0B', closed: '#9292A5', deleted: '#EF4444' }

const TICKET_COLS = [
  { key: 'ticket_number', label: '#', render: v => <span className="font-mono text-purple-400 text-xs">#{v}</span> },
  { key: 'creator_tag', label: 'Creator', render: v => <span className="text-sm text-white">{v || '—'}</span> },
  { key: 'option_value', label: 'Type', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</span> },
  { key: 'status', label: 'Status', render: v => (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: `${STATUS_COLORS[v] || '#9292A5'}20`, color: STATUS_COLORS[v] || '#9292A5' }}>
      {v}
    </span>
  )},
  { key: 'claimed_by_tag', label: 'Claimed By', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</span> },
  { key: 'created_at', label: 'Created', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

export default function Tickets() {
  const { addToast } = useToast()
  const [tab, setTab] = useState('open')
  const [tickets, setTickets] = useState([])
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState(null)
  const [newOption, setNewOption] = useState({ emoji: '', label: '', description: '' })
  const [panelChannel, setPanelChannel] = useState('')
  const [deployModal, setDeployModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [tRes, cRes] = await Promise.all([ticketApi.list(tab), ticketApi.getConfig()])
      if (tRes?.success) setTickets(tRes.data || [])
      if (cRes?.success) setConfig(cRes.data || {})
    } catch (e) { setError(e?.error || 'Failed to load tickets.') }
    finally { setLoading(false) }
  }, [tab])

  useEffect(() => { load() }, [load])

  const updateConfig = (key, val) => setConfig(c => ({ ...c, [key]: val }))

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await ticketApi.updateConfig(config)
      if (res?.success) addToast('Ticket settings saved!', 'success')
      else addToast(res?.error || 'Save failed', 'error')
    } catch (e) { addToast(e?.error || 'Save failed', 'error') }
    finally { setSaving(false) }
  }

  const deployPanel = async () => {
    if (!panelChannel) return addToast('Select a channel first', 'error')
    setDeploying(true); setDeployModal(false)
    try {
      const res = await ticketApi.deployPanel({ channelId: panelChannel })
      if (res?.success) addToast('Ticket panel deployed!', 'success')
      else addToast(res?.error || 'Deploy failed', 'error')
    } catch (e) { addToast(e?.error || 'Deploy failed', 'error') }
    finally { setDeploying(false) }
  }

  const addOption = () => {
    if (!newOption.label.trim()) return addToast('Label is required', 'error')
    updateConfig('options', [...(config.options || []), { ...newOption }])
    setNewOption({ emoji: '', label: '', description: '' })
  }

  const removeOption = (i) => {
    updateConfig('options', (config.options || []).filter((_, idx) => idx !== i))
  }

  const TABS = ['open', 'claimed', 'closed', 'settings']

  if (loading) return <LoadingSpinner label="Loading tickets..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <TicketIcon size={20} style={{ color: '#06B6D4' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tickets</h2>
            <p className="text-xs" style={{ color: '#9292A5' }}>Manage support tickets and configuration</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg" style={{ color: '#9292A5' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#10101A' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              background: tab === t ? '#8B5CF6' : 'transparent',
              color: tab === t ? '#fff' : '#9292A5',
            }}>
            {t === 'settings' ? <span className="flex items-center justify-center gap-1"><Settings size={13} /> Settings</span> : t}
          </button>
        ))}
      </div>

      {tab !== 'settings' ? (
        <DataTable columns={TICKET_COLS} rows={tickets} empty={`No ${tab} tickets.`} />
      ) : (
        <div className="space-y-5">
          {/* Config */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
            <h3 className="font-semibold text-white">Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Ticket Category</label>
                <ChannelSelect value={config.category_id} onChange={v => updateConfig('category_id', v)} type="category" placeholder="Select category..." />
              </div>
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Log Channel</label>
                <ChannelSelect value={config.log_channel_id} onChange={v => updateConfig('log_channel_id', v)} placeholder="Select log channel..." />
              </div>
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Panel Title</label>
                <input value={config.panel_title || ''} onChange={e => updateConfig('panel_title', e.target.value)}
                  placeholder="Support Tickets"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white"
                  style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
              </div>
              <div>
                <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Panel Color</label>
                <div className="flex gap-2">
                  <input type="color" value={config.panel_color || '#8B5CF6'} onChange={e => updateConfig('panel_color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer p-1 flex-shrink-0"
                    style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)' }} />
                  <input value={config.panel_color || '#8B5CF6'} onChange={e => updateConfig('panel_color', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-white"
                    style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Panel Description</label>
              <textarea value={config.panel_description || ''} onChange={e => updateConfig('panel_description', e.target.value)}
                placeholder="Click a button below to open a ticket..." rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none"
                style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
            </div>
            <div>
              <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Support Roles</label>
              <RoleSelect value={config.support_role_ids || []} onChange={v => updateConfig('support_role_ids', v)} multi placeholder="Select support roles..." />
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
            <h3 className="font-semibold text-white mb-4">Ticket Options</h3>
            <div className="space-y-2 mb-4">
              {(config.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#10101A' }}>
                  <span className="text-lg">{opt.emoji || '🎫'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{opt.label}</p>
                    {opt.description && <p className="text-xs" style={{ color: '#9292A5' }}>{opt.description}</p>}
                  </div>
                  <button onClick={() => removeOption(i)} className="p-1.5 rounded hover:bg-red-500/10" style={{ color: '#EF4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {(config.options || []).length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: '#9292A5' }}>No options configured. Add one below.</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <input value={newOption.emoji} onChange={e => setNewOption(o => ({ ...o, emoji: e.target.value }))}
                placeholder="Emoji" className="w-20 px-2 py-2 rounded-lg text-sm text-white text-center"
                style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
              <input value={newOption.label} onChange={e => setNewOption(o => ({ ...o, label: e.target.value }))}
                placeholder="Label *" className="flex-1 min-w-24 px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
              <input value={newOption.description} onChange={e => setNewOption(o => ({ ...o, description: e.target.value }))}
                placeholder="Description" className="flex-1 min-w-24 px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
              <button onClick={addOption}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={saveConfig} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
            </button>
            <button onClick={() => setDeployModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80"
              style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)' }}>
              <Send size={14} /> Deploy Panel
            </button>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      <Modal open={deployModal} onClose={() => setDeployModal(false)} title="Deploy Ticket Panel"
        footer={<>
          <button onClick={() => setDeployModal(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={deployPanel} disabled={deploying || !panelChannel}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-40"
            style={{ background: '#06B6D4', color: '#fff' }}>
            {deploying ? 'Deploying…' : 'Deploy Panel'}
          </button>
        </>}>
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#9292A5' }}>Choose a channel to send the ticket panel to.</p>
          <ChannelSelect value={panelChannel} onChange={setPanelChannel} placeholder="Select channel..." />
        </div>
      </Modal>
    </div>
  )
}
