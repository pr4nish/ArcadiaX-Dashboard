import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Send, RefreshCw } from 'lucide-react'
import { messageApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import ChannelSelect from '../components/ChannelSelect'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

const HIST_COLS = [
  { key: 'channel_name', label: 'Channel', render: v => <span className="text-purple-400 text-xs">#{v || '?'}</span> },
  { key: 'content', label: 'Message', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{String(v || '').slice(0, 60)}{(v || '').length > 60 ? '…' : ''}</span> },
  { key: 'sent_by_tag', label: 'Sent By', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v || '—'}</span> },
  { key: 'created_at', label: 'Time', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
]

export default function MessageSender() {
  const { addToast } = useToast()
  const [channelId, setChannelId] = useState('')
  const [content, setContent] = useState('')
  const [allowEveryone, setAllowEveryone] = useState(false)
  const [allowRoles, setAllowRoles] = useState(false)
  const [allowUsers, setAllowUsers] = useState(true)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const loadHistory = useCallback(async () => {
    setHistLoading(true)
    try {
      const res = await messageApi.history()
      if (res?.success) setHistory(res.data || [])
    } catch (_) {}
    finally { setHistLoading(false) }
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  const send = async () => {
    setSending(true); setConfirmModal(false)
    try {
      const res = await messageApi.send({
        channelId, content,
        allowMentions: { everyone: allowEveryone, roles: allowRoles, users: allowUsers },
      })
      if (res?.success) {
        addToast('Message sent!', 'success')
        setContent(''); loadHistory()
      } else addToast(res?.error || 'Send failed', 'error')
    } catch (e) { addToast(e?.error || 'Send failed', 'error') }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <MessageSquare size={20} style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Message Sender</h2>
          <p className="text-xs" style={{ color: '#9292A5' }}>Send messages to any channel as the bot</p>
        </div>
      </div>

      <div className="rounded-xl p-5 space-y-4" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div>
          <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Target Channel</label>
          <ChannelSelect value={channelId} onChange={setChannelId} />
        </div>

        <div>
          <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Message Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Type your message here..." rows={5}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none text-white"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
          <p className="text-xs mt-1 text-right" style={{ color: content.length > 1800 ? '#EF4444' : '#9292A5' }}>
            {content.length}/2000
          </p>
        </div>

        <div>
          <label className="text-xs block mb-2 font-medium" style={{ color: '#9292A5' }}>Mention Permissions</label>
          <div className="flex flex-wrap gap-5">
            {[
              { label: '@everyone / @here', val: allowEveryone, set: setAllowEveryone, danger: true },
              { label: 'Role mentions', val: allowRoles, set: setAllowRoles },
              { label: 'User mentions', val: allowUsers, set: setAllowUsers },
            ].map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)}
                  style={{ accentColor: opt.danger ? '#EF4444' : '#8B5CF6' }} />
                <span className="text-sm" style={{ color: opt.danger ? '#EF4444' : '#fff' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {content.trim() && channelId && (
          <div className="rounded-lg p-3" style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.1)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#9292A5' }}>Preview:</p>
            <p className="text-sm text-white whitespace-pre-wrap">{content}</p>
          </div>
        )}

        <button
          onClick={() => {
            if (!channelId) return addToast('Select a channel first', 'error')
            if (!content.trim()) return addToast('Message cannot be empty', 'error')
            setConfirmModal(true)
          }}
          disabled={sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
          <Send size={14} /> {sending ? 'Sending…' : 'Send Message'}
        </button>
      </div>

      {/* History */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Message History</h3>
          <button onClick={loadHistory} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#9292A5' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <DataTable columns={HIST_COLS} rows={history} loading={histLoading} empty="No messages sent yet." />
      </div>

      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Message"
        footer={<>
          <button onClick={() => setConfirmModal(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={send} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#8B5CF6', color: '#fff' }}>Send Now</button>
        </>}>
        <p className="text-sm" style={{ color: '#9292A5' }}>
          Send this message to the selected channel? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
