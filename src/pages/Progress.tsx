const goals = [
  { label: 'Lose 5kg', progress: 3.2, total: 5, unit: 'kg', icon: '⚖️', color: '#f97316' },
  { label: 'Run 100km this month', progress: 68, total: 100, unit: 'km', icon: '🏃', color: '#22c55e' },
  { label: 'Workout 20 days', progress: 14, total: 20, unit: 'days', icon: '💪', color: '#a855f7' },
  { label: 'Hit protein goal 30 days', progress: 22, total: 30, unit: 'days', icon: '🥩', color: '#ef4444' },
]

const milestones = [
  { label: 'First Workout Logged', date: 'Jun 1', achieved: true },
  { label: '7-Day Streak', date: 'Jun 8', achieved: true },
  { label: '10kg Lost', date: 'Jun 10', achieved: true },
  { label: '100 Workouts', date: '—', achieved: false },
  { label: '500km Running', date: '—', achieved: false },
]

const weeklyData = [
  { week: 'W1', workouts: 4, calories: 1240 },
  { week: 'W2', workouts: 5, calories: 1580 },
  { week: 'W3', workouts: 3, calories: 980 },
  { week: 'W4', workouts: 6, calories: 1820 },
]

const maxCalories = Math.max(...weeklyData.map(w => w.calories))

export default function Progress() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Progress</h1>
        <p style={{ color: '#64748b' }}>Track your goals and celebrate milestones</p>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Workouts', value: '47', icon: '💪' },
          { label: 'Total km Run', value: '68', icon: '🏃' },
          { label: 'Calories Burned', value: '18.4k', icon: '🔥' },
          { label: 'Best Streak', value: '12 days', icon: '🔥' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#f97316', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Goals */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Active Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {goals.map(({ label, progress, total, unit, icon, color }) => {
              const pct = Math.round((progress / total) * 100)
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 500, fontSize: 15 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>{progress}/{total} {unit}</span>
                  </div>
                  <div style={{ background: '#1e1e2e', borderRadius: 100, height: 8 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100 }} />
                  </div>
                  <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{pct}% complete</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Milestones */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Milestones</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {milestones.map(({ label, date, achieved }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: achieved ? 'rgba(34,197,94,0.06)' : '#0f0f1a' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{achieved ? '✅' : '🔒'}</span>
                  <span style={{ fontSize: 14, color: achieved ? '#e2e8f0' : '#475569' }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, color: achieved ? '#22c55e' : '#334155' }}>{date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Monthly Calories Burned</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 160 }}>
          {weeklyData.map(({ week, workouts, calories }) => (
            <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <p style={{ fontSize: 13, color: '#64748b' }}>{calories}</p>
              <div style={{
                width: '100%',
                height: `${(calories / maxCalories) * 120}px`,
                background: 'linear-gradient(to top, #f97316, #fb923c)',
                borderRadius: '6px 6px 0 0',
              }} />
              <p style={{ fontSize: 13, color: '#64748b' }}>{week}</p>
              <p style={{ fontSize: 12, color: '#475569' }}>{workouts} sessions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
