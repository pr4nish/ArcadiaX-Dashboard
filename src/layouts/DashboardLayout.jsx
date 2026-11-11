import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const PAGE_TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/antinuke': 'Anti-Nuke',
  '/dashboard/antibetray': 'Anti-Betray',
  '/dashboard/backup': 'Server Backup',
  '/dashboard/welcome': 'Welcome & Goodbye',
  '/dashboard/autorole': 'Auto Role',
  '/dashboard/embed': 'Embed Builder',
  '/dashboard/messages': 'Message Sender',
  '/dashboard/music': 'Music',
  '/dashboard/tickets': 'Tickets',
  '/dashboard/logs': 'Logs',
  '/dashboard/settings': 'Settings',
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'ArcadiaX'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a14' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex-shrink-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
