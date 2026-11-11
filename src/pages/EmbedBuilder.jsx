import { useState } from 'react'
import { Plus, Trash2, Send } from 'lucide-react'
import { embedApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import ChannelSelect from '../components/ChannelSelect'
import EmbedPreview from '../components/EmbedPreview'
import Modal from '../components/Modal'

const DEFAULT_EMBED = {
  title: '', description: '', color: '#8B5CF6',
  author: { name: '', iconURL: '', url: '' },
  footer: { text: '', iconURL: '' },
  thumbnail: { url: '' }, image: { url: '' },
  timestamp: false, fields: [],
}

export default function EmbedBuilder() {
  const { addToast } = useToast()
  const [channelId, setChannelId] = useState('')
  const [content, setContent] = useState('')
  const [embed, setEmbed] = useState({ ...DEFAULT_EMBED })
  const [sending, setSending] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)

  const upd = (key, val) => setEmbed(e => ({ ...e, [key]: val }))
  const updN = (parent, key, val) => setEmbed(e => ({ ...e, [parent]: { ...(e[parent] || {}), [key]: val } }))
  const addField = () => {
    if ((embed.fields || []).length >= 25) return
    setEmbed(e => ({ ...e, fields: [...(e.fields || []), { name: '', value: '', inline: false }] }))
  }
  const updField = (i, key, val) => setEmbed(e => {
    const fields = [...(e.fields || [])]
    fields[i] = { ...fields[i], [key]: val }
    return { ...e, fields }
  })
  const rmField = (i) => setEmbed(e => ({ ...e, fields: (e.fields || []).filter((_, idx) => idx !== i) }))

  const send = async () => {
    if (!channelId) return addToast('Please select a channel', 'error')
    setSending(true); setConfirmModal(false)
    try {
      const cleanEmbed = { ...embed }
      if (!cleanEmbed.author?.name) delete cleanEmbed.author
      if (!cleanEmbed.footer?.text) delete cleanEmbed.footer
      if (!cleanEmbed.thumbnail?.url) delete cleanEmbed.thumbnail
      if (!cleanEmbed.image?.url) delete cleanEmbed.image
      const res = await embedApi.send({ channelId, embed: cleanEmbed, content: content || undefined })
      if (res?.success) {
        addToast('Embed sent to Discord!', 'success')
        setEmbed({ ...DEFAULT_EMBED }); setContent(''); setChannelId('')
      } else addToast(res?.error || 'Send failed', 'error')
    } catch (e) { addToast(e?.error || 'Send failed', 'error') }
    finally { setSending(false) }
  }

  const iS = { background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', color: '#fff', outline: 'none' }

  const previewEmbed = {
    ...embed,
    thumbnail: embed.thumbnail?.url ? embed.thumbnail : undefined,
    image: embed.image?.url ? embed.image : undefined,
    author: embed.author?.name ? embed.author : undefined,
    footer: embed.footer?.text ? embed.footer : undefined,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <Send size={20} style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Embed Builder</h2>
          <p className="text-xs" style={{ color: '#9292A5' }}>Design and send rich Discord embeds</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          {/* Target */}
          <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
            <h3 className="font-semibold text-white mb-3">Target Channel</h3>
            <ChannelSelect value={channelId} onChange={setChannelId} placeholder="Select channel..." />
            <div className="mt-3">
              <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Plain text (optional)</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Message content above the embed..." rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={iS} />
            </div>
          </div>

          {/* Embed fields */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
            <h3 className="font-semibold text-white">Embed Content</h3>

            {/* Color */}
            <div className="flex items-center gap-2">
              <input type="color" value={embed.color} onChange={e => upd('color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer p-1 flex-shrink-0"
                style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)' }} />
              <input value={embed.color} onChange={e => upd('color', e.target.value)}
                placeholder="#8B5CF6" className="flex-1 px-3 py-2 rounded-lg text-sm" style={iS} />
            </div>

            {[
              { key: 'title', placeholder: 'Embed title', label: 'Title' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>{f.label}</label>
                <input value={embed[f.key]} onChange={e => upd(f.key, e.target.value)}
                  placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
            ))}

            <div>
              <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Description</label>
              <textarea value={embed.description} onChange={e => upd('description', e.target.value)}
                placeholder="Embed description..." rows={4}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={iS} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Author Name</label>
                <input value={embed.author?.name || ''} onChange={e => updN('author', 'name', e.target.value)}
                  placeholder="Author name" className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Author Icon URL</label>
                <input value={embed.author?.iconURL || ''} onChange={e => updN('author', 'iconURL', e.target.value)}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Footer Text</label>
                <input value={embed.footer?.text || ''} onChange={e => updN('footer', 'text', e.target.value)}
                  placeholder="Footer text" className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Footer Icon URL</label>
                <input value={embed.footer?.iconURL || ''} onChange={e => updN('footer', 'iconURL', e.target.value)}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Thumbnail URL</label>
                <input value={embed.thumbnail?.url || ''} onChange={e => updN('thumbnail', 'url', e.target.value)}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#9292A5' }}>Image URL</label>
                <input value={embed.image?.url || ''} onChange={e => updN('image', 'url', e.target.value)}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-sm" style={iS} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!embed.timestamp} onChange={e => upd('timestamp', e.target.checked)}
                style={{ accentColor: '#8B5CF6' }} />
              <span className="text-sm text-white">Include timestamp</span>
            </label>

            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: '#9292A5' }}>Fields ({(embed.fields || []).length}/25)</label>
                <button onClick={addField} disabled={(embed.fields || []).length >= 25}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded disabled:opacity-40"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                  <Plus size={10} /> Add Field
                </button>
              </div>
              <div className="space-y-3">
                {(embed.fields || []).map((field, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <input value={field.name} onChange={e => updField(i, 'name', e.target.value)}
                        placeholder="Field name" className="flex-1 px-2 py-1.5 rounded text-sm" style={iS} />
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: '#9292A5' }}>
                        <input type="checkbox" checked={!!field.inline} onChange={e => updField(i, 'inline', e.target.checked)}
                          style={{ accentColor: '#8B5CF6' }} /> Inline
                      </label>
                      <button onClick={() => rmField(i)} className="p-1 hover:bg-red-500/10 rounded flex-shrink-0" style={{ color: '#EF4444' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <textarea value={field.value} onChange={e => updField(i, 'value', e.target.value)}
                      placeholder="Field value" rows={2}
                      className="w-full px-2 py-1.5 rounded text-sm resize-none" style={iS} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => { if (!channelId) return addToast('Select a channel first', 'error'); setConfirmModal(true) }}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
            <Send size={16} /> {sending ? 'Sending…' : 'Send to Discord'}
          </button>
        </div>

        {/* Preview */}
        <div>
          <h3 className="font-semibold text-white mb-3">Live Preview</h3>
          <EmbedPreview embed={previewEmbed} />
        </div>
      </div>

      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Send"
        footer={<>
          <button onClick={() => setConfirmModal(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={send} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#8B5CF6', color: '#fff' }}>Send Embed</button>
        </>}>
        <p className="text-sm" style={{ color: '#9292A5' }}>
          Send this embed to the selected channel? The message will be posted immediately.
        </p>
      </Modal>
    </div>
  )
}
