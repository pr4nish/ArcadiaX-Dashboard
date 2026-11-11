import { useEffect, useState } from 'react'
import { Hash } from 'lucide-react'
import { guildApi } from '../services/api'

export default function ChannelSelect({ value, onChange, placeholder = 'Select channel...', type = 'text', disabled = false }) {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    guildApi.channels().then(res => {
      if (res?.success) {
        const ch = type === 'category'
          ? res.data.categories
          : type === 'voice'
            ? res.data.voiceChannels
            : res.data.textChannels
        setChannels(ch || [])
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [type])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Hash size={13} style={{ color: '#9292A5' }} />
      </div>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full pl-8 pr-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
        style={{
          background: '#10101A',
          border: '1px solid rgba(139,92,246,0.2)',
          color: value ? '#fff' : '#9292A5',
          outline: 'none',
        }}>
        <option value="">{loading ? 'Loading channels...' : placeholder}</option>
        {channels.map(ch => (
          <option key={ch.id} value={ch.id}>{ch.name}</option>
        ))}
      </select>
    </div>
  )
}
