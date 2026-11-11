import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import { guildApi } from '../services/api'

function roleColor(c) {
  return c ? `#${c.toString(16).padStart(6, '0')}` : '#9292A5'
}

export default function RoleSelect({ value, onChange, placeholder = 'Select role...', disabled = false, multi = false }) {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    guildApi.roles().then(res => {
      if (res?.success) setRoles(res.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (multi) {
    const selected = Array.isArray(value) ? value : []
    const toggle = (id) => {
      if (selected.includes(id)) onChange(selected.filter(v => v !== id))
      else onChange([...selected, id])
    }
    return (
      <div className="rounded-lg p-2 max-h-44 overflow-y-auto"
        style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)' }}>
        {loading ? (
          <p className="text-xs text-center py-2" style={{ color: '#9292A5' }}>Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-xs text-center py-2" style={{ color: '#9292A5' }}>No roles found</p>
        ) : roles.map(role => (
          <label key={role.id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-white/5">
            <input type="checkbox" checked={selected.includes(role.id)} onChange={() => toggle(role.id)}
              style={{ accentColor: '#8B5CF6' }} />
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: roleColor(role.color) }} />
            <span className="text-sm text-white truncate">{role.name}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Tag size={13} style={{ color: '#9292A5' }} />
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
        <option value="">{loading ? 'Loading roles...' : placeholder}</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>{role.name}</option>
        ))}
      </select>
    </div>
  )
}
