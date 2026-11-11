import { useState, useEffect, useCallback } from 'react'
import {
  Users, Shield, Zap, Activity, RefreshCw, Copy,
  AlertTriangle, CheckCircle, XCircle, Settings,
} from 'lucide-react'
import { dashboardApi } from '../services/api'
import ErrorState from '../components/ErrorState'
import LoadingSpinner from '../components/LoadingSpinner'

/* ── tiny helpers ───────────────────────────────────────────────── */

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

function StatusRow({ label, enabled }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-sm" style={{ color: '#c8c8d8' }}>{label}</span>
      {enabled
        ? <CheckCircle size={16} style={{ color: '#22C55E' }} />
        : <XCircle size={16} style={{ color: '#EF4444' }} />}
    </div>
  )
}

function ModuleCard({ name, subtitle, icon: Icon, iconColor, features = [], onConfigure }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9292A5' }}>{subtitle}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}20` }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-xs" style={{ color: '#9292A5', lineHeight: 1.6 }}>
        {features.join(' • ')}
      </p>
      <button
        onClick={onConfigure}
        className="mt-auto w-full py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)`,
          color: '#fff',
          boxShadow: `0 4px 14px ${iconColor}44`,
        }}>
        Configure
      </button>
    </div>
  )
}

/* ── protection score ring ──────────────────────────────────────── */
function ProtectionScore({ score = 0 }) {
  const r = 56
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  const color =
    score <= 30 ? '#EF4444'
    : score <= 70 ? '#F59E0B'
    : score <= 90 ? '#22C55E'
    : '#06B6D4'

  return (
    <div className="rounded-xl p-5 flex flex-col"
      style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.07)', minHeight: 260 }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Overall Protection Score</p>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>Live</span>
      </div>

      <div className="flex items-center justify-center my-3">
        <div className="relative" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{score}%</span>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-1.5">
        {[
          { dot: '#EF4444', range: '0–30%', label: 'High Risk' },
          { dot: '#F59E0B', range: '40–70%', label: 'Moderate' },
          { dot: '#22C55E', range: '71–90%', label: 'Protected' },
          { dot: '#06B6D4', range: '91–100%', label: 'Fully Secured' },
        ].map(({ dot, range, label }) => (
          <div key={range} className="flex items-center gap-2 text-xs" style={{ color: '#9292A5' }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
            <span style={{ color: '#7a7a9a' }}>{range}</span>
            <span className="ml-auto">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: '#5a5a72' }}>
        This score is based on ArcadiaX protection modules, not Discord server settings.
      </p>
    </div>
  )
}

/* ── main component ─────────────────────────────────────────────── */
export default function Overview() {
  const [overview, setOverview] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ov, st] = await Promise.all([dashboardApi.overview(), dashboardApi.status()])
      if (ov?.success) setOverview(ov.data)
      if (st?.success) setStatus(st.data)
    } catch (e) {
      setError(e?.error || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingSpinner label="Loading overview..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  const stats = overview?.stats || {}
  const modules = overview?.modules || {}
  const guild = overview?.guild || status?.guild || {}

  /* derive a rough protection score from active modules */
  const moduleList = [modules.antinuke, modules.antibetray, modules.automod, modules.backup, modules.welcome, modules.autorole]
  const activeCount = moduleList.filter(Boolean).length
  const protectionScore = Math.round((activeCount / moduleList.length) * 100)

  const serverType = stats.memberCount > 1000 ? 'Large' : stats.memberCount > 100 ? 'Medium' : 'Low'

  return (
    <div className="space-y-5">

      {/* ── Row 1: Server Details + Protection Score ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Server Details */}
        <div className="xl:col-span-2 rounded-xl p-6"
          style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-white">Server Details</p>
            <button onClick={load}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
              style={{ color: '#9292A5', border: '1px solid rgba(255,255,255,0.08)' }}>
              <RefreshCw size={12} /> Sync
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {/* Server Name */}
            <div className="rounded-lg px-4 py-3" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#5a5a72' }}>Server Name</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{guild.name || 'Your Server'}</span>
                <button onClick={() => copyText(guild.name || '')} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  <Copy size={13} style={{ color: '#9292A5' }} />
                </button>
              </div>
            </div>
            {/* Server ID */}
            <div className="rounded-lg px-4 py-3" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#5a5a72' }}>Server ID</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{guild.id || '—'}</span>
                <button onClick={() => copyText(guild.id || '')} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  <Copy size={13} style={{ color: '#9292A5' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Type', value: serverType },
              { label: 'Members', value: stats.memberCount?.toLocaleString() ?? '—' },
              { label: 'Channels', value: guild.channelCount ?? stats.channelCount ?? '—' },
              { label: 'Roles', value: guild.roleCount ?? stats.roleCount ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg px-3 py-2.5 text-center"
                style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-1" style={{ color: '#5a5a72' }}>{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Module rows */}
          <div className="space-y-0 divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {[
              { label: 'Nuke Protection', pct: modules.antinuke ? 80 : 0 },
              { label: 'AntiBetray Mode', pct: modules.antibetray ? 65 : 0 },
              { label: 'Automod', pct: modules.automod ? 70 : 0 },
            ].map(({ label, pct }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="text-sm" style={{ color: '#c8c8d8' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: pct > 0 ? '#22C55E' : '#EF4444' }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Protection Score */}
        <ProtectionScore score={protectionScore} />
      </div>

      {/* ── Row 2: Three module status panels ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Nuke Protection */}
        <div className="rounded-xl p-5"
          style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Nuke Protection</p>
            <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
          </div>
          <p className="text-xs mb-3" style={{ color: '#9292A5' }}>
            {modules.antinuke ? 'Antinuke active' : 'Antinuke disabled'}
          </p>
          <StatusRow label="Enabled" enabled={modules.antinuke} />
          <StatusRow label="Logging" enabled={modules.antinuke} />
          <StatusRow label="Auto Recovery" enabled={false} />
        </div>

        {/* AntiBetray */}
        <div className="rounded-xl p-5"
          style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">AntiBetray Mode</p>
            <Zap size={18} style={{ color: '#EF4444' }} />
          </div>
          <p className="text-xs mb-3" style={{ color: '#9292A5' }}>
            {modules.antibetray ? 'Lockdown system: active' : 'Lockdown system: inactive'}
          </p>
          <StatusRow label="Enabled" enabled={modules.antibetray} />
          <StatusRow label="Extra Owners Set" enabled={false} />
          <StatusRow label="Whitelist Active" enabled={false} />
        </div>

        {/* Automod */}
        <div className="rounded-xl p-5"
          style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Automod</p>
            <Settings size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <p className="text-xs mb-3" style={{ color: '#9292A5' }}>
            {modules.automod ? '0/7 events active' : 'Automod disabled'}
          </p>
          <StatusRow label="Enabled" enabled={modules.automod} />
          <StatusRow label="Events Configured" enabled={false} />
          <StatusRow label="Logging" enabled={modules.automod} />
        </div>
      </div>

      {/* ── Row 3: Module feature cards ── */}
      <div>
        <p className="text-sm font-semibold text-white mb-4">
          Protect your server with Intelligent Security modules
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModuleCard
            name="Antinuke"
            subtitle="Core Protection"
            icon={Shield}
            iconColor="#EF4444"
            features={['Stop bot raids and rogue admins in their tracks with instant protection against mass bans, kicks, and edits.']}
            onConfigure={() => window.location.href = '/dashboard/antinuke'}
          />
          <ModuleCard
            name="AntiBetray"
            subtitle="Betrayal Defense"
            icon={Zap}
            iconColor="#F59E0B"
            features={['Stay in absolute control with custom safety limits that instantly block rapid mass-deletions or kicks.']}
            onConfigure={() => window.location.href = '/dashboard/antibetray'}
          />
          <ModuleCard
            name="Server Backup"
            subtitle="Disaster Recovery"
            icon={Activity}
            iconColor="#8B5CF6"
            features={['Automatically backup channels, roles and permissions so you can restore in seconds after any attack.']}
            onConfigure={() => window.location.href = '/dashboard/backup'}
          />
        </div>
      </div>

    </div>
  )
}
