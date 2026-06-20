import { useState } from 'react'
import { useApp, calcStreak } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'

export default function Progress() {
  const { workouts, goals, updateGoalProgress } = useApp()
  const isMobile = useMobile()
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const totalCalsBurned = workouts.reduce((s, w) => s + w.calories, 0)
  const totalMins = workouts.reduce((s, w) => s + w.duration, 0)
  const runKm = workouts.filter(w => w.type === 'Running').reduce((s, w) => s + Math.round(w.duration * 0.18), 0)
  const streak = calcStreak(workouts)

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const ww = workouts.filter(w => {
      const d = new Date(w.date)
      return d >= weekStart && d < weekEnd
    })
    return { week: `W${i + 1}`, workouts: ww.length, calories: ww.reduce((s, w) => s + w.calories, 0) }
  })

  const chartData = workouts.length > 0 ? weeklyData : [
    { week: 'W1', workouts: 4, calories: 1240 },
    { week: 'W2', workouts: 5, calories: 1580 },
    { week: 'W3', workouts: 3, calories: 980 },
    { week: 'W4', workouts: 6, calories: 1820 },
  ]
  const maxCalories = Math.max(...chartData.map(w => w.calories), 1)

  const milestones = [
    { label: 'First Workout Logged', achieved: workouts.length >= 1 },
    { label: '5 Workouts Completed', achieved: workouts.length >= 5 },
    { label: '10 Workouts Completed', achieved: workouts.length >= 10 },
    { label: '7-Day Streak', achieved: streak >= 7 },
    { label: '500km Running', achieved: runKm >= 500 },
  ]

  function saveGoalEdit(label: string, total: number) {
    const v = parseFloat(editValue)
    if (!isNaN(v) && v >= 0 && v <= total) {
      updateGoalProgress(label, v)
    }
    setEditingGoal(null)
    setEditValue('')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Progress</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Track your goals and celebrate milestones</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16, marginBottom: 28 }}>
        {[
          { label: 'Total Workouts', value: workouts.length > 0 ? workouts.length.toString() : '0', icon: '💪' },
          { label: 'km Run', value: runKm > 0 ? runKm.toString() : '0', icon: '🏃' },
          { label: 'Calories Burned', value: totalCalsBurned > 0 ? totalCalsBurned.toLocaleString() : '0', icon: '🔥' },
          { label: 'Current Streak', value: `${streak} days`, icon: '⚡' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 14, padding: isMobile ? 16 : 20, textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 6 }}>{icon}</div>
            <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#f97316', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Active Goals</h2>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 18 }}>Tap a goal to update your progress</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {goals.map(({ label, progress, total, unit, icon, color }) => {
              const pct = Math.min(100, Math.round((progress / total) * 100))
              const isEditing = editingGoal === label
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>{progress}/{total} {unit}</span>
                  </div>
                  <ProgressBar pct={pct} color={color} height={8} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <p style={{ fontSize: 12, color: '#475569' }}>{pct}% complete{pct === 100 ? ' 🎉' : ''}</p>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="number"
                          autoFocus
                          min={0}
                          max={total}
                          step={0.1}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveGoalEdit(label, total); if (e.key === 'Escape') setEditingGoal(null) }}
                          style={{ width: 70, background: '#0f0f1a', border: `1px solid ${color}`, borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
                        />
                        <button onClick={() => saveGoalEdit(label, total)} style={{ background: color, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✓</button>
                        <button onClick={() => setEditingGoal(null)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingGoal(label); setEditValue(progress.toString()) }} style={{ background: 'transparent', border: `1px solid ${color}40`, borderRadius: 6, padding: '3px 10px', fontSize: 12, color, cursor: 'pointer' }}>
                        Update
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Milestones</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {milestones.map(({ label, achieved }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: achieved ? 'rgba(34,197,94,0.06)' : '#0f0f1a' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{achieved ? '✅' : '🔒'}</span>
                  <span style={{ fontSize: 13, color: achieved ? '#e2e8f0' : '#475569' }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, color: achieved ? '#22c55e' : '#334155' }}>{achieved ? 'Done' : '—'}</span>
              </div>
            ))}
          </div>
          {totalMins > 0 && (
            <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 16 }}>
              Total active time: {Math.floor(totalMins / 60) > 0 ? `${Math.floor(totalMins / 60)}h ` : ''}{totalMins % 60}m
            </p>
          )}
        </Card>
      </div>

      <Card>
        <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Weekly Calories Burned</h2>
        {workouts.length === 0 && (
          <p style={{ color: '#334155', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Showing demo data — log workouts to see your real stats.</p>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 12 : 24, height: 140 }}>
          {chartData.map(({ week, workouts: wCount, calories }) => (
            <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <p style={{ fontSize: 11, color: '#64748b' }}>{calories > 0 ? calories : '—'}</p>
              <div style={{
                width: '100%',
                height: calories > 0 ? `${(calories / maxCalories) * 100}px` : '4px',
                background: calories > 0 ? 'linear-gradient(to top, #f97316, #fb923c)' : '#1e1e2e',
                borderRadius: '6px 6px 0 0',
              }} />
              <p style={{ fontSize: 12, color: '#64748b' }}>{week}</p>
              {!isMobile && <p style={{ fontSize: 11, color: '#475569' }}>{wCount > 0 ? `${wCount} sessions` : 'no data'}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
