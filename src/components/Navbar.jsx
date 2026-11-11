import { Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick, title }) {
  const { user, guild } = useAuth()

  return (
    <header
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-30 flex-shrink-0"
      style={{ background: '#0d0d18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: '#9292A5' }}
        >
          <Menu size={18} />
        </button>
        <h1 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9292A5', letterSpacing: '0.12em' }}>
          {title}
        </h1>
      </div>

      {/* Right: guild chip + user avatar */}
      <div className="flex items-center gap-3">
        {guild && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {guild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=32`}
                className="w-4 h-4 rounded-full" alt="" />
            ) : (
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#8B5CF6' }}>
                {guild.name?.[0]}
              </div>
            )}
            <span className="text-white font-medium text-xs truncate max-w-[120px]">{guild.name}</span>
          </div>
        )}

        {user && (
          user.avatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
              className="w-8 h-8 rounded-full"
              style={{ border: '2px solid rgba(139,92,246,0.5)' }}
              alt={user.username}
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)' }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
          )
        )}
      </div>
    </header>
  )
}
