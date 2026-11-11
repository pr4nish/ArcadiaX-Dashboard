import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingSpinner from './components/LoadingSpinner'

import Login from './pages/Login'
import Overview from './pages/Overview'
import AntiNuke from './pages/AntiNuke'
import AntiBetray from './pages/AntiBetray'
import Backup from './pages/Backup'
import Welcome from './pages/Welcome'
import AutoRole from './pages/AutoRole'
import EmbedBuilder from './pages/EmbedBuilder'
import MessageSender from './pages/MessageSender'
import Music from './pages/Music'
import Tickets from './pages/Tickets'
import Logs from './pages/Logs'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullscreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<Overview />} />
                    <Route path="antinuke"   element={<AntiNuke />} />
                    <Route path="antibetray" element={<AntiBetray />} />
                    <Route path="backup"     element={<Backup />} />
                    <Route path="welcome"    element={<Welcome />} />
                    <Route path="autorole"   element={<AutoRole />} />
                    <Route path="embed"      element={<EmbedBuilder />} />
                    <Route path="messages"   element={<MessageSender />} />
                    <Route path="music"      element={<Music />} />
                    <Route path="tickets"    element={<Tickets />} />
                    <Route path="logs"       element={<Logs />} />
                    <Route path="settings"   element={<Settings />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
