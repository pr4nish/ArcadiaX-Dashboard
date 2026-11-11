import { useState, useEffect, useCallback } from 'react'
import { Music as MusicIcon, Play, Pause, SkipForward, Square, Volume2, PlusCircle, List } from 'lucide-react'
import { musicApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

function fmt(ms) {
  if (!ms) return '0:00'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function Music() {
  const { addToast } = useToast()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [volume, setVolume] = useState(50)

  const load = useCallback(async () => {
    try {
      const res = await musicApi.status()
      if (res?.success) { setStatus(res.data); setVolume(res.data.volume ?? 50) }
    } catch (_) {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 4000)
    return () => clearInterval(id)
  }, [load])

  const ctrl = async (action, extra = {}) => {
    try {
      await musicApi.control({ action, ...extra }); load()
    } catch (e) { addToast(e?.error || 'Control failed', 'error') }
  }

  const addSong = async () => {
    if (!query.trim()) return
    setAdding(true)
    try {
      const res = await musicApi.control({ action: 'play', query: query.trim() })
      if (res?.success) { addToast('Added to queue!', 'success'); setQuery(''); load() }
      else addToast(res?.error || 'Failed', 'error')
    } catch (e) { addToast(e?.error || 'Failed', 'error') }
    finally { setAdding(false) }
  }

  if (loading) return <LoadingSpinner label="Loading music status..." />

  const isActive = status?.active
  const current = status?.current
  const queue = status?.queue || []
  const isPaused = status?.paused

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <MusicIcon size={20} style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Music Player</h2>
          <p className="text-xs" style={{ color: '#9292A5' }}>Control the bot music player</p>
        </div>
      </div>

      {/* Now Playing */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        {!isActive ? (
          <div className="text-center py-8">
            <MusicIcon size={40} className="mx-auto mb-3" style={{ color: '#8B5CF6', opacity: 0.3 }} />
            <p className="text-white font-medium">Bot not in a voice channel</p>
            <p className="text-sm mt-1" style={{ color: '#9292A5' }}>Add a song below to start playing</p>
          </div>
        ) : !current ? (
          <div className="text-center py-8">
            <p className="text-white font-medium">Queue is empty</p>
            <p className="text-sm mt-1" style={{ color: '#9292A5' }}>Add a song below to start playing</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8B5CF6' }}>Now Playing</p>
            <div className="flex items-start gap-4">
              {current.thumbnail && (
                <img src={current.thumbnail} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" alt="" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{current.title}</p>
                {current.author && <p className="text-sm mt-0.5" style={{ color: '#9292A5' }}>{current.author}</p>}
                <p className="text-xs mt-0.5" style={{ color: '#9292A5' }}>{fmt(current.duration)}</p>
                {current.requester && <p className="text-xs mt-0.5" style={{ color: '#9292A5' }}>Requested by {current.requester}</p>}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button onClick={() => ctrl(isPaused ? 'resume' : 'pause')}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)' }}>
                {isPaused ? <Play size={18} fill="white" className="text-white ml-0.5" /> : <Pause size={18} className="text-white" />}
              </button>
              <button onClick={() => ctrl('skip')}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                style={{ color: '#9292A5' }}>
                <SkipForward size={18} />
              </button>
              <button onClick={() => ctrl('stop')}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors"
                style={{ color: '#EF4444' }}>
                <Square size={18} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mt-4">
              <Volume2 size={16} style={{ color: '#9292A5' }} />
              <input type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                onMouseUp={e => ctrl('volume', { volume: Number(e.target.value) })}
                onTouchEnd={e => ctrl('volume', { volume: Number(e.target.value) })}
                className="flex-1 accent-purple-500" />
              <span className="text-xs w-8 text-right" style={{ color: '#9292A5' }}>{volume}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Song */}
      <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <h3 className="font-semibold text-white mb-3">Add to Queue</h3>
        <div className="flex gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSong()}
            placeholder="Song name or YouTube URL..."
            className="flex-1 px-3 py-2.5 rounded-lg text-sm text-white"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
          <button onClick={addSong} disabled={adding || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
            <PlusCircle size={14} /> {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
          <div className="flex items-center gap-2 mb-3">
            <List size={16} style={{ color: '#8B5CF6' }} />
            <h3 className="font-semibold text-white">Queue ({queue.length})</h3>
          </div>
          <div className="space-y-2">
            {queue.map((track, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: '#10101A' }}>
                <span className="text-xs w-5 text-center font-medium flex-shrink-0" style={{ color: '#8B5CF6' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{track.title}</p>
                  <p className="text-xs" style={{ color: '#9292A5' }}>{fmt(track.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
