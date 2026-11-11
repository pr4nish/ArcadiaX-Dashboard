import { useState, useEffect, useCallback } from 'react'
import { Database, Plus, Download, Eye, RotateCcw, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import { backupApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Backup() {
  const { addToast } = useToast()
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [restoreConfirm, setRestoreConfirm] = useState(false)
  const [restoreOptions, setRestoreOptions] = useState({ roles: true, channels: true, settings: true })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await backupApi.list()
      if (res?.success) setBackups(res.data || [])
    } catch (e) { setError(e?.error || 'Failed to load backups.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const createBackup = async () => {
    if (!createName.trim()) return addToast('Please enter a backup name', 'error')
    setCreating(true)
    try {
      const res = await backupApi.create({ name: createName.trim(), type: 'manual' })
      if (res?.success) { addToast('Backup created!', 'success'); setCreateModal(false); setCreateName(''); load() }
      else addToast(res?.error || 'Backup failed', 'error')
    } catch (e) { addToast(e?.error || 'Backup failed', 'error') }
    finally { setCreating(false) }
  }

  const previewBackup = async (id) => {
    try {
      const res = await backupApi.get(id)
      if (res?.success) setPreviewData(res.data)
    } catch (e) { addToast(e?.error || 'Failed to preview', 'error') }
  }

  const restoreBackup = async () => {
    if (!restoreTarget || !restoreConfirm) return
    try {
      const res = await backupApi.restore(restoreTarget.id, restoreOptions)
      if (res?.success) { addToast('Restore initiated!', 'success'); setRestoreTarget(null); setRestoreConfirm(false) }
      else addToast(res?.error || 'Restore failed', 'error')
    } catch (e) { addToast(e?.error || 'Restore failed', 'error') }
  }

  const deleteBackup = async () => {
    if (!deleteTarget) return
    try {
      await backupApi.delete(deleteTarget.id)
      addToast('Backup deleted', 'success'); setDeleteTarget(null); load()
    } catch (e) { addToast(e?.error || 'Delete failed', 'error') }
  }

  const COLS = [
    { key: 'name', label: 'Name', render: v => <span className="font-medium text-white">{v}</span> },
    { key: 'type', label: 'Type', render: v => (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: v === 'manual' ? 'rgba(139,92,246,0.15)' : 'rgba(34,197,94,0.15)', color: v === 'manual' ? '#8B5CF6' : '#22C55E' }}>
        {v}
      </span>
    )},
    { key: 'created_at', label: 'Created', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? new Date(v).toLocaleString() : '—'}</span> },
    { key: 'size_kb', label: 'Size', render: v => <span className="text-xs" style={{ color: '#9292A5' }}>{v ? `${v} KB` : '—'}</span> },
    { key: 'id', label: 'Actions', render: (id, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => previewBackup(id)} title="Preview" className="p-1.5 rounded hover:bg-purple-500/10" style={{ color: '#8B5CF6' }}><Eye size={14} /></button>
        <a href={`${API_URL}/api/backups/${id}/export`} target="_blank" rel="noreferrer" title="Download"
          className="p-1.5 rounded hover:bg-green-500/10" style={{ color: '#22C55E' }}><Download size={14} /></a>
        <button onClick={() => { setRestoreTarget(row); setRestoreConfirm(false); setRestoreOptions({ roles: true, channels: true, settings: true }) }}
          title="Restore" className="p-1.5 rounded hover:bg-yellow-500/10" style={{ color: '#F59E0B' }}><RotateCcw size={14} /></button>
        <button onClick={() => setDeleteTarget(row)} title="Delete" className="p-1.5 rounded hover:bg-red-500/10" style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
      </div>
    )},
  ]

  if (loading) return <LoadingSpinner label="Loading backups..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <Database size={20} style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Server Backup</h2>
            <p className="text-xs" style={{ color: '#9292A5' }}>Manage server configuration snapshots</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2 rounded-lg" style={{ color: '#9292A5' }}><RefreshCw size={16} /></button>
          <button onClick={() => { setCreateModal(true); setCreateName('') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff' }}>
            <Plus size={14} /> Create Snapshot
          </button>
        </div>
      </div>

      <DataTable columns={COLS} rows={backups} empty="No backups found. Create your first snapshot above." />

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Backup Snapshot"
        footer={<>
          <button onClick={() => setCreateModal(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={createBackup} disabled={creating} className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 disabled:opacity-50"
            style={{ background: '#8B5CF6', color: '#fff' }}>
            {creating ? 'Creating…' : 'Create Snapshot'}
          </button>
        </>}>
        <div>
          <label className="text-xs block mb-1 font-medium" style={{ color: '#9292A5' }}>Snapshot Name</label>
          <input value={createName} onChange={e => setCreateName(e.target.value)}
            placeholder="e.g. Before server restructure"
            onKeyDown={e => e.key === 'Enter' && createBackup()}
            className="w-full px-3 py-2 rounded-lg text-sm text-white"
            style={{ background: '#10101A', border: '1px solid rgba(139,92,246,0.2)', outline: 'none' }} />
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewData} onClose={() => setPreviewData(null)} title="Backup Preview"
        footer={<button onClick={() => setPreviewData(null)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#8B5CF6', color: '#fff' }}>Close</button>}>
        {previewData && (
          <div className="space-y-3">
            <p className="font-semibold text-white">{previewData.name}</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Roles', value: previewData.data?.roles?.length ?? 0 },
                { label: 'Categories', value: previewData.data?.categories?.length ?? 0 },
                { label: 'Channels', value: previewData.data?.channels?.length ?? 0 },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg p-3 text-center" style={{ background: '#10101A' }}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs" style={{ color: '#9292A5' }}>{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: '#9292A5' }}>Created {new Date(previewData.created_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>

      {/* Restore Modal */}
      <Modal open={!!restoreTarget} onClose={() => setRestoreTarget(null)} title="Restore Backup"
        footer={<>
          <button onClick={() => setRestoreTarget(null)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={restoreBackup} disabled={!restoreConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{ background: '#EF4444', color: '#fff', opacity: restoreConfirm ? 1 : 0.4 }}>
            Restore Now
          </button>
        </>}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={18} style={{ color: '#F59E0B' }} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm" style={{ color: '#F59E0B' }}>
              Restoring will overwrite current server configuration. This cannot be automatically undone.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-2">Restore options:</p>
            {Object.entries(restoreOptions).map(([key, val]) => (
              <label key={key} className="flex items-center gap-3 py-2 cursor-pointer">
                <input type="checkbox" checked={val}
                  onChange={e => setRestoreOptions(o => ({ ...o, [key]: e.target.checked }))}
                  style={{ accentColor: '#8B5CF6' }} />
                <span className="text-sm text-white capitalize">{key}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <input type="checkbox" checked={restoreConfirm} onChange={e => setRestoreConfirm(e.target.checked)}
              style={{ accentColor: '#EF4444' }} />
            <span className="text-sm font-medium" style={{ color: '#EF4444' }}>I confirm I want to restore this backup</span>
          </label>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Backup"
        footer={<>
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#9292A5' }}>Cancel</button>
          <button onClick={deleteBackup} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#EF4444', color: '#fff' }}>Delete</button>
        </>}>
        <p className="text-sm" style={{ color: '#9292A5' }}>
          Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget?.name}"</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
