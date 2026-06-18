import { useApp, todayISO } from '../context/AppContext'
import StatCard from '../components/StatCard'
import Card from '../components/Card'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Dashboard() {
  const { workouts, meals, profile } = useApp()
  const today = todayISO()

  const todayWorkouts = workouts.filter(w => w.date.slice(0, 10) === today)
  const caloriesBurned = todayWorkouts.reduce((s, w) => s + w.calories, 0)
  const activeMinutes = todayWorkouts.reduce((s, w) => s + w.duration, 0)

  const stepsValue = 8342 // static placeholder — no device API yet
  const waterValue = 1.8  // static placeholder

  const stats = [
    { label: 'Steps Today', value: stepsValue.toLocaleString(), goal: profile.dailyStepGoal.toLocaleString(), icon: '👟', pct: Math.round(stepsValue / profile.dailyStepGoal * 100), color: '#f97316' },
    { label: 'Calories Burned', value: caloriesBurned.toString(), goal: '700 kcal', icon: '🔥', pct: Math.min(100, Math.round(caloriesBurned / 700 * 100)), color: '#ef4444' },
    { label: 'Active Minutes', value: activeMinutes.toString(), goal: '60 min', icon: '⏱️', pct: Math.min(100, Math.round(activeMinutes / 60 * 100)), color: '#22c55e' },
    { label: 'Water Intake', value: `${waterValue} L`, goal: `${profile.waterGoal} L`, icon: '💧', pct: Math.round(waterValue / profile.waterGoal * 100), color: '#3b82f6' },
  ]

  // Build last-7-days activity from context workouts
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().slice(0, 10)
    const dayWorkouts = workouts.filter(w => w.date.slice(0, 10) === iso)
    const dayMeals = meals // all meals belong to today's session
    return {
      day: DAYS[d.getDay()],
      iso,
      type: dayWorkouts.length > 0 ? dayWorkouts.map(w => w.type).join(', ') : (iso === today && dayMeals.length > 0 ? 'Logged Meals' : 'Rest Day'),
      duration: dayWorkouts.reduce((s, w) => s + w.duration, 0),
      calories: dayWorkouts.reduce((s, w) => s + w.calories, 0),
      hasActivity: dayWorkouts.length > 0,
    }
  })

  const weekWorkouts = workouts.filter(w => {
    const d = new Date(w.date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  })

  const totalCalsThisWeek = weekWorkouts.reduce((s, w) => s + w.calories, 0)
  const totalTimeThisWeek = weekWorkouts.reduce((s, w) => s + w.duration, 0)
  const h = Math.floor(totalTimeThisWeek / 60)
  const m = totalTimeThisWeek % 60

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>{todayStr}</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Good morning, {profile.name}! 👋
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>This Week's Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {last7.map(({ day, type, duration, calories, hasActivity }) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0f0f1a', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: 13, minWidth: 36 }}>{day}</span>
                  <span style={{ fontWeight: 500, fontSize: 14, color: hasActivity ? '#e2e8f0' : '#475569' }}>{type}</span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {duration > 0 && <span style={{ color: '#64748b', fontSize: 14 }}>{duration} min</span>}
                  {calories > 0 && <span style={{ color: '#f97316', fontSize: 14, fontWeight: 500 }}>{calories} kcal</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Weekly Summary</h2>
          {[
            { label: 'Workouts Completed', value: weekWorkouts.length.toString(), icon: '✅' },
            { label: 'Total Calories', value: totalCalsThisWeek.toLocaleString(), icon: '🔥' },
            { label: 'Active Time', value: h > 0 ? `${h}h ${m}m` : `${m}m`, icon: '⏱️' },
            { label: 'Current Streak', value: `${Math.min(workouts.length, 5)} days`, icon: '⚡' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e1e2e' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>{icon}</span>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>{label}</span>
              </div>
              <span style={{ fontWeight: 600, color: '#f97316' }}>{value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
