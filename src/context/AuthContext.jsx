import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [guild, setGuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await authApi.me()
      if (res.success) {
        setUser(res.data.user)
        setGuild(res.data.guild)
      }
    } catch (err) {
      setUser(null)
      setGuild(null)
      setError(err.error || 'Not authenticated')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (_) {}
    setUser(null)
    setGuild(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, guild, loading, error, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
