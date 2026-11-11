import { useState, useEffect, useCallback } from 'react'
import { guildApi } from '../services/api'

export function useGuildData() {
  const [channels, setChannels] = useState({ textChannels: [], voiceChannels: [], categories: [] })
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (loaded || loading) return
    setLoading(true)
    try {
      const [chRes, rolesRes] = await Promise.allSettled([guildApi.channels(), guildApi.roles()])
      if (chRes.status === 'fulfilled' && chRes.value.success) {
        setChannels(chRes.value.data)
      }
      if (rolesRes.status === 'fulfilled' && rolesRes.value.success) {
        setRoles(rolesRes.value.data)
      }
      setLoaded(true)
    } catch (_) {}
    setLoading(false)
  }, [loaded, loading])

  useEffect(() => { load() }, [load])

  return { channels, roles, loading, reload: () => { setLoaded(false) } }
}

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn()
      setData(res.success ? res.data : null)
      if (!res.success) setError(res.error || 'Unknown error')
    } catch (err) {
      setError(err.error || 'Network error')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}
