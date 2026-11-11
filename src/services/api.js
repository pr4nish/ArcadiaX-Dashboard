import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const DEV_MODE = import.meta.env.VITE_DEV_AUTH === 'true'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    ...(DEV_MODE ? { 'x-dev-admin': 'true' } : {}),
  },
})

// Unwrap the ArcadiaX standard envelope
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      error: error.message || 'Network error',
      code: 'NETWORK_ERROR',
      details: null,
    }
    // Auto-redirect on 401 (session expired / not logged in)
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(errorData)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  loginUrl: () => `${API_URL}/api/auth/discord`,
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  overview: () => api.get('/api/dashboard/overview'),
  status: () => api.get('/api/dashboard/status'),
}

// ─── Antinuke ────────────────────────────────────────────────────────────────
export const antinukeApi = {
  get: () => api.get('/api/antinuke'),
  update: (data) => api.put('/api/antinuke', data),
  logs: (params) => api.get('/api/antinuke/logs', { params }),
  lockdown: (enable) => api.post('/api/antinuke/lockdown', { enable }),
  addTrusted: (data) => api.post('/api/antinuke/trusted', data),
  removeTrusted: (id) => api.delete(`/api/antinuke/trusted/${id}`),
}

// ─── Antibetray ──────────────────────────────────────────────────────────────
export const antibetrayApi = {
  get: () => api.get('/api/antibetray'),
  update: (data) => api.put('/api/antibetray', data),
  logs: (params) => api.get('/api/antibetray/logs', { params }),
}

// ─── Backups ─────────────────────────────────────────────────────────────────
export const backupApi = {
  list: () => api.get('/api/backups'),
  create: (data) => api.post('/api/backups', data),
  get: (id) => api.get(`/api/backups/${id}`),
  exportUrl: (id) => `${API_URL}/api/backups/${id}/export`,
  restore: (id, data) => api.post(`/api/backups/${id}/restore`, data),
  delete: (id) => api.delete(`/api/backups/${id}`),
}

// ─── Welcome ─────────────────────────────────────────────────────────────────
export const welcomeApi = {
  get: () => api.get('/api/welcome'),
  update: (data) => api.put('/api/welcome', data),
  preview: (data) => api.post('/api/welcome/preview', data),
}

// ─── Autorole ────────────────────────────────────────────────────────────────
export const autoroleApi = {
  get: () => api.get('/api/autorole'),
  update: (data) => api.put('/api/autorole', data),
}

// ─── Embeds ──────────────────────────────────────────────────────────────────
export const embedApi = {
  preview: (data) => api.post('/api/embeds/preview', data),
  send: (data) => api.post('/api/embeds/send', data),
}

// ─── Messages ────────────────────────────────────────────────────────────────
export const messageApi = {
  send: (data) => api.post('/api/messages/send', data),
  history: (params) => api.get('/api/messages/history', { params }),
}

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketApi = {
  list: (status, params) => api.get('/api/tickets', { params: { status, ...params } }),
  getConfig: () => api.get('/api/tickets/config'),
  updateConfig: (data) => api.put('/api/tickets/config', data),
  deployPanel: (data) => api.post('/api/tickets/panel', data),
  get: (id) => api.get(`/api/tickets/${id}`),
  close: (id, data) => api.post(`/api/tickets/${id}/close`, data),
}

// ─── Music ───────────────────────────────────────────────────────────────────
export const musicApi = {
  status: () => api.get('/api/music/status'),
  control: (data) => api.post('/api/music/control', data),
}

// ─── Logs ────────────────────────────────────────────────────────────────────
export const logsApi = {
  security: (params) => api.get('/api/logs/security', { params }),
  messages: (params) => api.get('/api/logs/messages', { params }),
  activity: (params) => api.get('/api/logs/activity', { params }),
  all: (params) => api.get('/api/logs', { params }),
}

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get('/api/settings'),
  update: (data) => api.put('/api/settings', data),
}

// ─── Guild ───────────────────────────────────────────────────────────────────
export const guildApi = {
  channels: () => api.get('/api/guild/channels'),
  roles: () => api.get('/api/guild/roles'),
  members: (params) => api.get('/api/guild/members', { params }),
}
