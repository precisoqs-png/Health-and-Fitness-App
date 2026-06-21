import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useMobile } from './hooks/useMobile'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Nutrition from './pages/Nutrition'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import Programs from './pages/Programs'

export default function App() {
  const { user, loading } = useAuth()
  const isMobile = useMobile()

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
      <div style={{ paddingBottom: isMobile ? 72 : 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/programs" element={<Programs />} />
        </Routes>
      </div>
      {isMobile && <BottomNav />}
    </div>
  )
}
