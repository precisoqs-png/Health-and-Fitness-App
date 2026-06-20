import { useApp } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'

export default function Progress() {
  const { workouts, goals } = useApp()
  const isMobile = useMobile()

  const totalCalsBurned = workouts.reduce((s, w) => s + w.calories, 0)
  const totalMins = workouts.reduce((s, w) => s + w.duration, 0)
  const runKm = workouts.filter(w => w.type === 'Running').reduce((s, w) => s + Math.round(w.duration * 0.18), 0)
  const bestStreak = Math.min(workouts.length, 12)

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date)
      return d >= weekStart && d < weekEnd
    })
    return {
      week: `W${i + 1}`,
      workouts: weekWorkouts.length,
      calories: weekWorkouts.reduce((s, w) => s + w.calories, 0),
    }
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
    { label: '100 Workouts', achieved: workouts.length >= 100 },
    { label: '500km Running', achieved: runKm >= 500 },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Progress</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Track your goals and celebrate milestones</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16, marginBottom: 28 }}>
        {[
          { label: 'Total Workouts', value: workouts.length.toString() || '47', icon: '💪' },
          { label: 'Total km Run', value: (runKm || 68).toString(), icon: '🏃' },
          { label: 'Calories Burned', value: totalCalsBurned > 0 ? totalCalsBurned.toLocaleString() : '18.4k', icon: '🔥' },
          { label: 'Best Streak', value: `${bestStreak || 12} days`, icon: '⚡' },
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
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Active Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {goals.map(({ label, progress, total, unit, icon, color }) => {
              const pct = Math.round((progress / total) * 100)
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>{progress}/{total} {unit}</span>
                  </div>
                  <ProgressBar pct={pct} color={color} height={7} />
                  <p style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{pct}% complete</p>
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
                <span style={{ fontSize: 12, color: achieved ? '#22c55e' : '#334155' }}>
                  {achieved ? 'Done' : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Monthly Calories Burned</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 12 : 24, height: 140 }}>
          {chartData.map(({ week, workouts: wCount, calories }) => (
            <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <p style={{ fontSize: 12, color: '#64748b' }}>{calories > 0 ? calories : '—'}</p>
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

      {workouts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#334155', fontSize: 14, marginTop: 16 }}>
          Log your first workout to see real data here.
        </p>
      )}

      {totalMins > 0 && (
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 16 }}>
          Total active time: {Math.floor(totalMins / 60) > 0 ? `${Math.floor(totalMins / 60)}h ` : ''}{totalMins % 60}m
        </p>
      )}
    </div>
  )
}
