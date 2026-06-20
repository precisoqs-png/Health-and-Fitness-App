import { useState } from 'react'
import { useApp, todayISO, calcStreak } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import StatCard from '../components/StatCard'
import Card from '../components/Card'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Dashboard() {
  const { workouts, meals, profile, dailyLog, addWater, setSteps } = useApp()
  const isMobile = useMobile()
  const [editingSteps, setEditingSteps] = useState(false)
  const [stepsInput, setStepsInput] = useState('')
  const today = todayISO()

  const todayWorkouts = workouts.filter(w => w.date.slice(0, 10) === today)
  const caloriesBurned = todayWorkouts.reduce((s, w) => s + w.calories, 0)
  const activeMinutes = todayWorkouts.reduce((s, w) => s + w.duration, 0)
  const streak = calcStreak(workouts)

  const stats = [
    { label: 'Steps Today', value: dailyLog.steps.toLocaleString(), goal: profile.dailyStepGoal.toLocaleString(), icon: '👟', pct: Math.min(100, Math.round(dailyLog.steps / profile.dailyStepGoal * 100)), color: '#f97316' },
    { label: 'Calories Burned', value: caloriesBurned.toString(), goal: '700 kcal', icon: '🔥', pct: Math.min(100, Math.round(caloriesBurned / 700 * 100)), color: '#ef4444' },
    { label: 'Active Minutes', value: activeMinutes.toString(), goal: '60 min', icon: '⏱️', pct: Math.min(100, Math.round(activeMinutes / 60 * 100)), color: '#22c55e' },
    { label: 'Water Intake', value: `${dailyLog.water.toFixed(1)} L`, goal: `${profile.waterGoal} L`, icon: '💧', pct: Math.min(100, Math.round(dailyLog.water / profile.waterGoal * 100)), color: '#3b82f6' },
  ]

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().slice(0, 10)
    const dayWorkouts = workouts.filter(w => w.date.slice(0, 10) === iso)
    return {
      day: DAYS[d.getDay()],
      iso,
      type: dayWorkouts.length > 0 ? dayWorkouts.map(w => w.type).join(', ') : 'Rest Day',
      duration: dayWorkouts.reduce((s, w) => s + w.duration, 0),
      calories: dayWorkouts.reduce((s, w) => s + w.calories, 0),
      hasActivity: dayWorkouts.length > 0,
    }
  })

  const weekWorkouts = workouts.filter(w => {
    const diff = (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  })

  const totalCalsThisWeek = weekWorkouts.reduce((s, w) => s + w.calories, 0)
  const totalTimeThisWeek = weekWorkouts.reduce((s, w) => s + w.duration, 0)
  const h = Math.floor(totalTimeThisWeek / 60)
  const m = totalTimeThisWeek % 60

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayMeals = meals.filter(m => m.date?.slice(0, 10) === today)
  const calConsumed = todayMeals.reduce((s, m) => s + m.calories, 0)
  const calRemaining = profile.dailyCalorieGoal - calConsumed + caloriesBurned

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>{todayStr}</p>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Good morning, {profile.name}! 👋
        </h1>
        {streak > 0 && (
          <p style={{ marginTop: 6, fontSize: 14, color: '#f97316' }}>🔥 {streak}-day streak — keep it going!</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? 12 : 20, marginBottom: 28 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick-action row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Water logging */}
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>💧 Log Water</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[0.25, 0.5, 0.75, 1].map(amt => (
              <button
                key={amt}
                onClick={() => addWater(amt)}
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '8px 14px', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                +{amt}L
              </button>
            ))}
            {dailyLog.water > 0 && (
              <button
                onClick={() => addWater(-0.25)}
                style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
              >
                −
              </button>
            )}
          </div>
          <p style={{ marginTop: 10, fontSize: 13, color: '#64748b' }}>
            {dailyLog.water.toFixed(2)}L logged · {Math.max(0, profile.waterGoal - dailyLog.water).toFixed(2)}L remaining
          </p>
        </Card>

        {/* Steps logging */}
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>👟 Log Steps</h2>
          {editingSteps ? (
            <form onSubmit={e => { e.preventDefault(); setSteps(Number(stepsInput) || 0); setEditingSteps(false) }} style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min="0"
                max="99999"
                autoFocus
                value={stepsInput}
                onChange={e => setStepsInput(e.target.value)}
                placeholder="e.g. 7500"
                style={{ flex: 1, background: '#0f0f1a', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
              />
              <button type="submit" style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Save</button>
              <button type="button" onClick={() => setEditingSteps(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>✕</button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>{dailyLog.steps.toLocaleString()}</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>of {profile.dailyStepGoal.toLocaleString()} goal</p>
              </div>
              <button
                onClick={() => { setStepsInput(dailyLog.steps.toString()); setEditingSteps(true) }}
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '8px 16px', color: '#f97316', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Update
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Calorie balance */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>🍽️ Today's Calorie Balance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
          {[
            { label: 'Goal', value: profile.dailyCalorieGoal, color: '#94a3b8' },
            { label: 'Consumed', value: calConsumed, color: '#f97316' },
            { label: 'Remaining', value: calRemaining, color: calRemaining >= 0 ? '#22c55e' : '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#0f0f1a', borderRadius: 10, padding: '14px 8px' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color }}>{value.toLocaleString()}</p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>This Week's Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {last7.map(({ day, type, duration, calories, hasActivity }) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0f0f1a', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: 13, minWidth: 32 }}>{day}</span>
                  <span style={{ fontWeight: 500, fontSize: 13, color: hasActivity ? '#e2e8f0' : '#475569' }}>{type}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {duration > 0 && <span style={{ color: '#64748b', fontSize: 13 }}>{duration}m</span>}
                  {calories > 0 && <span style={{ color: '#f97316', fontSize: 13, fontWeight: 500 }}>{calories} kcal</span>}
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
              <span style={{ fontWeight: 600, color: '#f97316', fontSize: 14 }}>{value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
