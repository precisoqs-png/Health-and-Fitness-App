import { useState, useEffect, useRef } from 'react'
import { useApp, todayISO, calcStreak } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'

const workoutTypes = [
  { id: 'running', name: 'Running', icon: '🏃', desc: 'Outdoor or treadmill runs', color: 'var(--accent)', calsPerMin: 10 },
  { id: 'cycling', name: 'Cycling', icon: '🚴', desc: 'Road, trail, or stationary', color: 'var(--accent)', calsPerMin: 8 },
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

const emptyManual = { type: 'running', date: todayISO(), duration: '', calories: '' }

export default function Workouts() {
  const { workouts, addWorkout, deleteWorkout } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [selected, setSelected] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showManual, setShowManual] = useState(false)
  const [manual, setManual] = useState(emptyManual)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streak = calcStreak(workouts)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function startSession() { setElapsed(0); setRunning(true) }

  async function stopSession() {
    setRunning(false)
    const wt = workoutTypes.find(w => w.id === selected)
    if (!wt || elapsed < 5) { showToast('Session too short — minimum 5 seconds', 'error'); return }
    const mins = Math.max(1, Math.round(elapsed / 60))
    await addWorkout({ type: wt.name, icon: wt.icon, duration: mins, calories: mins * wt.calsPerMin, date: new Date().toISOString() })
    showToast(`${wt.name} session saved — ${mins} min, ${mins * wt.calsPerMin} kcal 🎉`)
    setSelected(null)
    setElapsed(0)
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const wt = workoutTypes.find(w => w.id === manual.type)!
    const mins = Number(manual.duration)
    if (!mins || mins < 1) { showToast('Enter a valid duration', 'error'); return }
    const cals = Number(manual.calories) || mins * wt.calsPerMin
    const dateStr = manual.date ? new Date(manual.date + 'T12:00:00').toISOString() : new Date().toISOString()
    await addWorkout({ type: wt.name, icon: wt.icon, duration: mins, calories: cals, date: dateStr })
    showToast(`${wt.name} logged — ${mins} min, ${cals} kcal`)
    setManual(emptyManual)
    setShowManual(false)
  }

  const todayWorkouts = workouts.filter(w => w.date.slice(0, 10) === todayISO())
  const pastWorkouts = workouts.filter(w => w.date.slice(0, 10) !== todayISO()).slice(0, 15)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Workout Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select a type and start the timer, or log a past workout</p>
        </div>
        {streak > 0 && (
          <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '6px 14px', fontSize: 13, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
            🔥 {streak}-day streak
          </div>
        )}
      </div>

      {/* Workout type grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? 12 : 18, marginBottom: 24 }}>
        {workoutTypes.map(({ id, name, icon, desc, color }) => {
          const sessions = workouts.filter(w => w.type === name)
          const isActive = selected === id
          return (
            <div
              key={id}
              onClick={() => { if (!running && !showManual) setSelected(isActive ? null : id) }}
              style={{
                background: isActive ? `${color}18` : 'var(--card)',
                border: `1px solid ${isActive ? color : 'var(--border)'}`,
                borderRadius: 14,
                padding: isMobile ? 14 : 22,
                cursor: (running || showManual) ? 'default' : 'pointer',
                transition: 'all 0.2s',
                opacity: (running && !isActive) || (showManual && !isActive) ? 0.4 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: isMobile ? 28 : 34 }}>{icon}</span>
                <div style={{ background: `${color}22`, color, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {isActive ? '✓ Selected' : 'Pick'}
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18, marginBottom: 3 }}>{name}</h3>
              {!isMobile && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>{desc}</p>}
              <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: 10, marginTop: isMobile ? 8 : 0 }}>
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Sessions</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sessions.length > 0 ? `${sessions.length} logged` : 'None yet'}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live timer panel */}
      {selected && !showManual && (
        <Card style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>{workoutTypes.find(w => w.id === selected)?.icon}</p>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {running ? 'Session in progress' : `Ready to start ${workoutTypes.find(w => w.id === selected)?.name}?`}
          </h2>
          {running && (
            <p style={{ fontSize: 56, fontWeight: 800, color: 'var(--accent)', letterSpacing: 3, margin: '16px 0', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(elapsed)}
            </p>
          )}
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
            {running ? 'Tracking your session live.' : 'Start the timer when you begin your workout.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {!running ? (
              <button onClick={startSession} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                Start Workout ⚡
              </button>
            ) : (
              <>
                <button onClick={stopSession} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Stop & Save ✓
                </button>
                <button onClick={() => { setRunning(false); setElapsed(0); setSelected(null) }} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid #2a2a3e', borderRadius: 10, padding: '13px 20px', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Manual log form */}
      {showManual ? (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Log a Past Workout</h3>
          <form onSubmit={submitManual} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Workout Type</span>
                <select value={manual.type} onChange={e => setManual(m => ({ ...m, type: e.target.value }))} style={inputStyle}>
                  {workoutTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.icon} {wt.name}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Date</span>
                <input type="date" value={manual.date} max={todayISO()} onChange={e => setManual(m => ({ ...m, date: e.target.value }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Duration (minutes)</span>
                <input type="number" min="1" max="600" placeholder="e.g. 45" value={manual.duration} onChange={e => setManual(m => ({ ...m, duration: e.target.value }))} style={inputStyle} />
              </label>
            </div>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Calories burned <span style={{ color: 'var(--text-subtle)' }}>(optional — auto-calculated if blank)</span></span>
              <input type="number" min="1" placeholder={`Auto: ~${Number(manual.duration || 30) * (workoutTypes.find(w => w.id === manual.type)?.calsPerMin ?? 8)} kcal`} value={manual.calories} onChange={e => setManual(m => ({ ...m, calories: e.target.value }))} style={{ ...inputStyle, maxWidth: 200 }} />
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Save Workout</button>
              <button type="button" onClick={() => setShowManual(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            </div>
          </form>
        </Card>
      ) : (
        !running && (
          <button onClick={() => { setSelected(null); setShowManual(true) }} style={{ background: 'transparent', border: '2px dashed #2a2a3e', borderRadius: 12, padding: '14px 24px', color: 'var(--text-subtle)', fontSize: 14, cursor: 'pointer', fontWeight: 500, marginBottom: 20, display: 'block' }}>
            + Log a past workout
          </button>
        )
      )}

      {/* Today's sessions */}
      {todayWorkouts.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Today's Sessions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayWorkouts.map(w => (
              <WorkoutRow key={w.id} workout={w} onDelete={async () => { await deleteWorkout(w.id); showToast('Workout deleted', 'info') }} />
            ))}
          </div>
        </Card>
      )}

      {/* Recent history */}
      {pastWorkouts.length > 0 && (
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Recent History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastWorkouts.map(w => (
              <WorkoutRow key={w.id} workout={w} showDate onDelete={async () => { await deleteWorkout(w.id); showToast('Workout deleted', 'info') }} />
            ))}
          </div>
        </Card>
      )}

      {workouts.length === 0 && !selected && !showManual && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-subtle)' }}>
          <p style={{ fontSize: 44, marginBottom: 12 }}>💪</p>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>No workouts logged yet</p>
          <p style={{ fontSize: 14, marginTop: 6 }}>Pick a workout type above or log a past workout to get started.</p>
        </div>
      )}
    </div>
  )
}

function WorkoutRow({ workout: w, showDate, onDelete }: { workout: Workout; showDate?: boolean; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 20 }}>{w.icon}</span>
        <div>
          <p style={{ fontWeight: 500, fontSize: 14 }}>{w.type}</p>
          {showDate && <p style={{ color: 'var(--text-subtle)', fontSize: 12 }}>{new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{w.duration} min</span>
        <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>{w.calories} kcal</span>
        {confirming ? (
          <>
            <button onClick={onDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            <button onClick={() => setConfirming(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          </>
        ) : (
          <button onClick={() => setConfirming(true)} style={{ background: 'transparent', border: 'none', color: '#334155', fontSize: 18, cursor: 'pointer', padding: '2px 6px' }}>⋯</button>
        )}
      </div>
    </div>
  )
}

import type { Workout } from '../context/AppContext'

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelTextStyle: React.CSSProperties = { fontSize: 13, color: '#94a3b8', fontWeight: 500 }
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8,
  padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
