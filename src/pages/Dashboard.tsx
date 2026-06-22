import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp, todayISO, calcStreak } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useMobile } from '../hooks/useMobile'
import StatCard from '../components/StatCard'
import Card from '../components/Card'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Dashboard() {
  const { workouts, meals, profile, dailyLog, isNewUser, addWater, setSteps } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [editingSteps, setEditingSteps] = useState(false)
  const [stepsInput, setStepsInput] = useState('')
  const today = todayISO()

  const todayWorkouts = workouts.filter(w => w.date.slice(0, 10) === today)
  const caloriesBurned = todayWorkouts.reduce((s, w) => s + w.calories, 0)
  const activeMinutes = todayWorkouts.reduce((s, w) => s + w.duration, 0)
  const streak = calcStreak(workouts)

  const stats = [
    { label: 'Steps Today', value: dailyLog.steps.toLocaleString(), goal: profile.dailyStepGoal.toLocaleString(), icon: '👟', pct: Math.min(100, Math.round(dailyLog.steps / profile.dailyStepGoal * 100)), color: 'var(--accent)' },
    { label: 'Calories Burned', value: caloriesBurned.toString(), goal: '700 kcal', icon: '🔥', pct: Math.min(100, Math.round(caloriesBurned / 700 * 100)), color: '#ef4444' },
    { label: 'Active Minutes', value: activeMinutes.toString(), goal: '60 min', icon: '⏱️', pct: Math.min(100, Math.round(activeMinutes / 60 * 100)), color: '#22c55e' },
    { label: 'Water Intake', value: `${dailyLog.water.toFixed(1)} L`, goal: `${profile.waterGoal} L`, icon: '💧', pct: Math.min(100, Math.round(dailyLog.water / profile.waterGoal * 100)), color: 'var(--accent)' },
  ]

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().slice(0, 10)
    const dayWorkouts = workouts.filter(w => w.date.slice(0, 10) === iso)
    return {
      day: DAYS[d.getDay()],
      type: dayWorkouts.length > 0 ? dayWorkouts.map(w => w.type).join(', ') : 'Rest Day',
      duration: dayWorkouts.reduce((s, w) => s + w.duration, 0),
      calories: dayWorkouts.reduce((s, w) => s + w.calories, 0),
      hasActivity: dayWorkouts.length > 0,
    }
  })

  const weekWorkouts = workouts.filter(w => (Date.now() - new Date(w.date).getTime()) / 86400000 <= 7)
  const totalCalsThisWeek = weekWorkouts.reduce((s, w) => s + w.calories, 0)
  const totalTimeThisWeek = weekWorkouts.reduce((s, w) => s + w.duration, 0)
  const h = Math.floor(totalTimeThisWeek / 60)
  const m = totalTimeThisWeek % 60

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayMeals = meals.filter(m => m.date?.slice(0, 10) === today)
  const calConsumed = todayMeals.reduce((s, m) => s + m.calories, 0)
  const calRemaining = profile.dailyCalorieGoal - calConsumed + caloriesBurned
  const macrosConsumed = {
    protein: todayMeals.reduce((s, m) => s + (m.protein ?? 0), 0),
    carbs:   todayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0),
    fat:     todayMeals.reduce((s, m) => s + (m.fat ?? 0), 0),
  }

  function handleWater(amt: number) {
    addWater(amt)
    if (amt > 0) showToast(`+${amt}L water logged 💧`)
  }

  function handleStepsSave(e: React.FormEvent) {
    e.preventDefault()
    const steps = Number(stepsInput)
    setSteps(steps)
    showToast(`Steps updated: ${steps.toLocaleString()} 👟`)
    setEditingSteps(false)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

      {/* Onboarding banner for new users */}
      {isNewUser && (
        <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 16, padding: isMobile ? '20px 20px' : '24px 32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
            <div>
              <p style={{ fontSize: 22, marginBottom: 6 }}>👋</p>
              <h2 style={{ fontWeight: 700, fontSize: isMobile ? 17 : 20, marginBottom: 6, color: 'var(--accent)' }}>Welcome to Velocity Fitness!</h2>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                Start by setting your name and daily goals, then log your first workout or meal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <Link to="/settings" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Set up profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{todayStr}</p>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Good morning, {profile.name}! 👋
        </h1>
        {streak > 0 && (
          <p style={{ marginTop: 6, fontSize: 14, color: 'var(--accent)' }}>🔥 {streak}-day streak — keep it going!</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? 12 : 20, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} isMobile={isMobile} />)}
      </div>

      {/* Calorie balance */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>🍽️ Today's Calorie Balance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
          {[
            { label: 'Goal', value: profile.dailyCalorieGoal, color: '#94a3b8' },
            { label: 'Consumed', value: calConsumed, color: 'var(--accent)' },
            { label: 'Remaining', value: calRemaining, color: calRemaining >= 0 ? '#22c55e' : '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: isMobile ? '12px 6px' : '14px 8px' }}>
              <p style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color }}>{value.toLocaleString()}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Macros row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Protein', value: macrosConsumed.protein, goal: profile.proteinGoal, color: '#ef4444', unit: 'g' },
            { label: 'Carbs',   value: macrosConsumed.carbs,   goal: profile.carbsGoal,   color: '#f59e0b', unit: 'g' },
            { label: 'Fat',     value: macrosConsumed.fat,     goal: profile.fatGoal,     color: '#22c55e', unit: 'g' },
          ].map(({ label, value, goal, color, unit }) => (
            <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: isMobile ? '10px 6px' : '12px 8px' }}>
              <p style={{ fontSize: isMobile ? 16 : 19, fontWeight: 700, color }}>{Math.round(value)}{unit}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label} <span style={{ color: 'var(--text-subtle)' }}>/ {goal}{unit}</span></p>
              <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round(value / Math.max(1, goal) * 100))}%`, background: color, borderRadius: 2, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💧 Log Water</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {[0.25, 0.5, 0.75, 1].map(amt => (
              <button key={amt} onClick={() => handleWater(amt)} style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)', borderRadius: 8, padding: '8px 14px', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                +{amt}L
              </button>
            ))}
            {dailyLog.water > 0 && (
              <button onClick={() => addWater(-0.25)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>−0.25L</button>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{dailyLog.water.toFixed(2)}L</span> logged · {Math.max(0, profile.waterGoal - dailyLog.water).toFixed(2)}L remaining
          </p>
        </Card>

        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>👟 Log Steps</h2>
          {editingSteps ? (
            <form onSubmit={handleStepsSave} style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" max="99999" autoFocus value={stepsInput} onChange={e => setStepsInput(e.target.value)} placeholder="e.g. 7500" style={{ flex: 1, background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Save</button>
              <button type="button" onClick={() => setEditingSteps(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '9px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{dailyLog.steps.toLocaleString()}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>of {profile.dailyStepGoal.toLocaleString()} goal</p>
              </div>
              <button onClick={() => { setStepsInput(dailyLog.steps.toString()); setEditingSteps(true) }} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '8px 16px', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Update
              </button>
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>This Week's Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {last7.map(({ day, type, duration, calories, hasActivity }) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-subtle)', fontSize: 13, minWidth: 32 }}>{day}</span>
                  <span style={{ fontWeight: 500, fontSize: 13, color: hasActivity ? 'var(--text)' : 'var(--text-subtle)' }}>{type}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {duration > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{duration}m</span>}
                  {calories > 0 && <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>{calories} kcal</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Weekly Summary</h2>
          {[
            { label: 'Workouts', value: weekWorkouts.length.toString(), icon: '✅' },
            { label: 'Calories Burned', value: totalCalsThisWeek.toLocaleString(), icon: '🔥' },
            { label: 'Active Time', value: h > 0 ? `${h}h ${m}m` : `${m}m`, icon: '⏱️' },
            { label: 'Streak', value: `${streak} days`, icon: '⚡' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #1e1e2e' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>{icon}</span>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 14 }}>{value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
