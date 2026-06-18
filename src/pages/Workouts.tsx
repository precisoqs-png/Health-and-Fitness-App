import { useState } from 'react'

const workoutTypes = [
  { id: 'running', name: 'Running', icon: '🏃', desc: 'Outdoor or treadmill runs', color: '#f97316', lastSessions: ['5.2 km · 28 min', '3.8 km · 22 min'] },
  { id: 'cycling', name: 'Cycling', icon: '🚴', desc: 'Road, trail, or stationary', color: '#3b82f6', lastSessions: ['18 km · 55 min', '12 km · 38 min'] },
  { id: 'strength', name: 'Strength', icon: '🏋️', desc: 'Weights and resistance training', color: '#a855f7', lastSessions: ['Push Day · 45 min', 'Pull Day · 40 min'] },
  { id: 'yoga', name: 'Yoga', icon: '🧘', desc: 'Flexibility and mindfulness', color: '#22c55e', lastSessions: ['Vinyasa · 30 min', 'Yin · 45 min'] },
  { id: 'hiit', name: 'HIIT', icon: '⚡', desc: 'High-intensity intervals', color: '#ef4444', lastSessions: ['Tabata · 20 min', 'Circuit · 25 min'] },
  { id: 'swimming', name: 'Swimming', icon: '🏊', desc: 'Pool or open water', color: '#06b6d4', lastSessions: ['1000m · 22 min', '750m · 18 min'] },
]

export default function Workouts() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Workout Tracker</h1>
          <p style={{ color: '#64748b' }}>Choose a workout type to start tracking</p>
        </div>
        <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '8px 16px', fontSize: 14, color: '#f97316' }}>
          🔥 5-day streak
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
        {workoutTypes.map(({ id, name, icon, desc, color, lastSessions }) => (
          <div
            key={id}
            onClick={() => setActive(active === id ? null : id)}
            style={{
              background: active === id ? `${color}18` : '#13131f',
              border: `1px solid ${active === id ? color : '#2a2a3e'}`,
              borderRadius: 16,
              padding: 24,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 36 }}>{icon}</span>
              <div style={{
                background: `${color}22`,
                color,
                borderRadius: 100,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
              }}>
                {active === id ? 'Selected' : 'Start'}
              </div>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{name}</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>{desc}</p>
            <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: 12 }}>
              <p style={{ fontSize: 11, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Recent</p>
              {lastSessions.map((s) => (
                <p key={s} style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>• {s}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>
            {workoutTypes.find(w => w.id === active)?.icon}
          </p>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
            Ready to start {workoutTypes.find(w => w.id === active)?.name}?
          </h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Your session will be tracked and added to your weekly summary.</p>
          <button
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 40px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start Workout ⚡
          </button>
        </div>
      )}
    </div>
  )
}
