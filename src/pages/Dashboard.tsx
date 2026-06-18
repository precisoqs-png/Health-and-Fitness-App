const stats = [
  { label: 'Steps Today', value: '8,342', goal: '10,000', icon: '👟', pct: 83, color: '#f97316' },
  { label: 'Calories Burned', value: '512', goal: '700 kcal', icon: '🔥', pct: 73, color: '#ef4444' },
  { label: 'Active Minutes', value: '47', goal: '60 min', icon: '⏱️', pct: 78, color: '#22c55e' },
  { label: 'Water Intake', value: '1.8 L', goal: '2.5 L', icon: '💧', pct: 72, color: '#3b82f6' },
]

const recentActivity = [
  { day: 'Mon', type: 'Running', duration: '32 min', calories: 310 },
  { day: 'Tue', type: 'Strength', duration: '45 min', calories: 280 },
  { day: 'Wed', type: 'Rest Day', duration: '—', calories: 0 },
  { day: 'Thu', type: 'Cycling', duration: '55 min', calories: 420 },
  { day: 'Fri', type: 'Yoga', duration: '30 min', calories: 150 },
]

function StatCard({ label, value, goal, icon, pct, color }: typeof stats[0]) {
  return (
    <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Goal: {goal}</p>
        </div>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
      <div style={{ background: '#1e1e2e', borderRadius: 100, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.5s' }} />
      </div>
      <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{pct}% of goal</p>
    </div>
  )
}

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>{today}</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>Good morning, Athlete! 👋</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Weekly Activity */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>This Week's Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map(({ day, type, duration, calories }) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0f0f1a', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: 13, minWidth: 32 }}>{day}</span>
                  <span style={{ fontWeight: 500 }}>{type}</span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>{duration}</span>
                  {calories > 0 && <span style={{ color: '#f97316', fontSize: 14, fontWeight: 500 }}>{calories} kcal</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Weekly Summary</h2>
          {[
            { label: 'Workouts Completed', value: '4', icon: '✅' },
            { label: 'Total Calories', value: '1,160', icon: '🔥' },
            { label: 'Active Time', value: '2h 42m', icon: '⏱️' },
            { label: 'Current Streak', value: '5 days', icon: '🔥' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e1e2e' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>{icon}</span>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>{label}</span>
              </div>
              <span style={{ fontWeight: 600, color: '#f97316' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
