import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConnectAccountsPage } from './pages/ConnectAccountsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { LibraryPage } from './pages/LibraryPage'
import { LoginPage } from './pages/LoginPage'
import { PlatinumModePage } from './pages/PlatinumModePage'
import { SettingsPage } from './pages/SettingsPage'
import { SwipePage } from './pages/SwipePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/conectar" element={<ConnectAccountsPage />} />
        <Route path="/biblioteca" element={<LibraryPage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/platina" element={<PlatinumModePage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
