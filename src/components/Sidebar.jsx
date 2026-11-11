import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Shield, AlertTriangle, Database,
  MessageSquare, UserCheck, Layers, Send, Music,
  Ticket, FileText, Settings, LogOut, RefreshCw,
  FileBarChart,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',       to: '/dashboard' },
  { icon: Settings,        label: 'Settings',        to: '/dashboard/settings' },
  { icon: Shield,          label: 'Antinuke',         to: '/dashboard/antinuke' },
  { icon: Settings,        label: 'Automod',          to: '/dashboard/automod' },
  { icon: MessageSquare,   label: 'Welcomer',         to: '/dashboard/welcome' },
  { icon: FileText,        label: 'Logging',          to: '/dashboard/logs' },
  { icon: UserCheck,       label: 'Custom Role',      to: '/dashboard/customrole' },
  { icon: UserCheck,       label: 'Autorole',         to: '/dashboard/autorole' },
  { icon: Layers,          label: 'Autoreact',        to: '/dashboard/autoreact' },
  { icon: Send,            label: 'Autoresponder',    to: '/dashboard/messages' },
  { icon: Ticket,          label: 'Giveaway',         to: '/dashboard/giveaway' },
  { icon: Layers,          label: 'Embed Builder',    to: '/dashboard/embed' },
]

export default function Sidebar({ open, onClose }) {
  const { user, guild, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-56 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: '#0d0d18', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Branding */}
        <div className="flex items-center gap-2.5 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)' }}>
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-none">ArcadiaX</h1>
            <p className="text-xs mt-0.5" style={{ color: '#5a5a72', fontSize: 10 }}>Control Panel</p>
          </div>
          {guild && (
            <button className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
              <RefreshCw size={13} style={{ color: '#9292A5' }} />
            </button>
          )}
        </div>

        {/* Guild chip */}
        {guild && (
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              {guild.icon
                ? <img src={guild.icon} alt={guild.name} className="w-7 h-7 rounded-full flex-shrink-0" />
                : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)' }}>
                    {guild.name?.[0]}
                  </div>
              }
              <span className="text-sm font-medium text-white truncate">{guild.name}</span>
            </div>
          </div>
        )}

        {/* Audit logs shortcut */}
        <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink to="/dashboard/logs"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{ color: '#9292A5' }}>
            <FileBarChart size={14} />
            Audit Logs
          </NavLink>
        </div>

        {/* MODULES label */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#5a5a72', fontSize: 10 }}>Modules</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to + label}
              to={to}
              end={to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(139,92,246,0.18)',
                color: '#fff',
                borderLeft: '3px solid #8B5CF6',
                paddingLeft: 9,
              } : {}}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} style={{ color: isActive ? '#A78BFA' : '#5a5a72' }} />
                  <span className="flex-1 text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {user && (
            <div className="flex items-center gap-2.5 mb-2 px-2 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <img
                src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                alt={user.username}
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{ border: '2px solid #8B5CF6' }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs" style={{ color: '#5a5a72', fontSize: 10 }}>
                  {user.isOwner ? 'Owner' : user.isAdmin ? 'Admin' : 'Staff'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ color: '#EF4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
