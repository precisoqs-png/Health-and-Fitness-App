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
import VisionBoard from './pages/VisionBoard'
import GoalDetail from './pages/GoalDetail'

export default function App() {
  const { user, loading } = useAuth()
  const isMobile = useMobile()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-subtle)', fontSize: 16 }}>Loading…</p>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
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
          <Route path="/vision-board" element={<VisionBoard />} />
          <Route path="/vision-board/:goalId" element={<GoalDetail />} />
        </Routes>
      </div>
      {isMobile && <BottomNav />}
    </div>
  )
}
