import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Nutrition from './pages/Nutrition'
import Progress from './pages/Progress'
import Settings from './pages/Settings'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#475569', fontSize: 16 }}>Loading…</p>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#e2e8f0' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
