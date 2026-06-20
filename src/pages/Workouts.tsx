import { useState, useEffect, useRef } from 'react'
import { useApp, todayISO } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'

const workoutTypes = [
  { id: 'running', name: 'Running', icon: '🏃', desc: 'Outdoor or treadmill runs', color: '#f97316', calsPerMin: 10 },
  { id: 'cycling', name: 'Cycling', icon: '🚴', desc: 'Road, trail, or stationary', color: '#3b82f6', calsPerMin: 8 },
  { id: 'strength', name: 'Strength', icon: '🏋️', desc: 'Weights and resistance training', color: '#a855f7', calsPerMin: 6 },
  { id: 'yoga', name: 'Yoga', icon: '🧘', desc: 'Flexibility and mindfulness', color: '#22c55e', calsPerMin: 4 },
  { id: 'hiit', name: 'HIIT', icon: '⚡', desc: 'High-intensity intervals', color: '#ef4444', calsPerMin: 12 },
  { id: 'swimming', name: 'Swimming', icon: '🏊', desc: 'Pool or open water', color: '#06b6d4', calsPerMin: 9 },
]

function fmt(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Workouts() {
  const { workouts, addWorkout } = useApp()
  const isMobile = useMobile()
  const [selected, setSelected] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function startSession() {
    setElapsed(0)
    setRunning(true)
  }

  function stopSession() {
    setRunning(false)
    const wt = workoutTypes.find(w => w.id === selected)
    if (!wt || elapsed < 5) return
    const mins = Math.max(1, Math.round(elapsed / 60))
    addWorkout({ type: wt.name, icon: wt.icon, duration: mins, calories: mins * wt.calsPerMin })
    setSelected(null)
    setElapsed(0)
  }

  const todayWorkouts = workouts.filter(w => w.date.slice(0, 10) === todayISO())
  const weekWorkouts = workouts.slice(0, 10)
  const streak = Math.min(workouts.length, 5)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Workout Tracker</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Choose a workout type to start tracking</p>
        </div>
        <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '6px 14px', fontSize: 13, color: '#f97316', whiteSpace: 'nowrap' }}>
          🔥 {streak}-day streak
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: isMobile ? 12 : 20, marginBottom: 28 }}>
        {workoutTypes.map(({ id, name, icon, desc, color }) => {
          const sessions = workouts.filter(w => w.type === name)
          const isActive = selected === id
          return (
            <div
              key={id}
              onClick={() => { if (!running) setSelected(isActive ? null : id) }}
              style={{
                background: isActive ? `${color}18` : '#13131f',
                border: `1px solid ${isActive ? color : '#2a2a3e'}`,
                borderRadius: 14,
                padding: isMobile ? 16 : 24,
                cursor: running ? 'default' : 'pointer',
                transition: 'all 0.2s',
                opacity: running && !isActive ? 0.4 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: isMobile ? 28 : 36 }}>{icon}</span>
                <div style={{ background: `${color}22`, color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {isActive ? 'Selected' : 'Pick'}
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20, marginBottom: 4 }}>{name}</h3>
              {!isMobile && <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>{desc}</p>}
              <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: 10, marginTop: isMobile ? 8 : 0 }}>
                <p style={{ fontSize: 11, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Recent</p>
                {sessions.length > 0
                  ? sessions.slice(0, isMobile ? 1 : 2).map(s => (
                    <p key={s.id} style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
                      • {s.duration} min · {s.calories} kcal
                    </p>
                  ))
                  : <p style={{ fontSize: 12, color: '#334155' }}>No sessions yet</p>
                }
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <Card style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>{workoutTypes.find(w => w.id === selected)?.icon}</p>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {running ? 'Session in progress' : `Ready to start ${workoutTypes.find(w => w.id === selected)?.name}?`}
          </h2>

          {running && (
            <p style={{ fontSize: 48, fontWeight: 800, color: '#f97316', letterSpacing: 2, margin: '16px 0' }}>
              {fmt(elapsed)}
            </p>
          )}

          <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>
            {running ? 'Tracking your session live.' : 'Your session will be tracked and saved automatically.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {!running ? (
              <button onClick={startSession} style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                Start Workout ⚡
              </button>
            ) : (
              <>
                <button onClick={stopSession} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Stop & Save ✓
                </button>
                <button onClick={() => { setRunning(false); setElapsed(0); setSelected(null) }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #2a2a3e', borderRadius: 10, padding: '13px 20px', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </Card>
      )}

      {todayWorkouts.length > 0 && (
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Today's Sessions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayWorkouts.map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f0f1a', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{w.icon}</span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{w.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{w.duration} min</span>
                  <span style={{ color: '#f97316', fontSize: 13, fontWeight: 500 }}>{w.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {weekWorkouts.length > 0 && todayWorkouts.length < weekWorkouts.length && (
        <Card style={{ marginTop: 16 }}>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Recent History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weekWorkouts.filter(w => w.date.slice(0, 10) !== todayISO()).slice(0, 5).map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f0f1a', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{w.icon}</span>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 13 }}>{w.type}</p>
                    <p style={{ color: '#475569', fontSize: 11 }}>{new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{w.duration} min</span>
                  <span style={{ color: '#f97316', fontSize: 13, fontWeight: 500 }}>{w.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
