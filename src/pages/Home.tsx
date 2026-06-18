import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 100,
          padding: '6px 16px',
          fontSize: 13,
          color: '#f97316',
          marginBottom: 32,
        }}>
          ⚡ Phase 1 Launch — Track. Train. Transform.
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, maxWidth: 800 }}>
          Your fitness journey,{' '}
          <span style={{ color: '#f97316' }}>supercharged.</span>
        </h1>

        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
          Velocity Fitness helps you track workouts, log nutrition, and hit your goals faster than ever. Built for athletes who mean business.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/dashboard" style={{
            background: '#f97316',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}>
            Go to Dashboard →
          </Link>
          <Link to="/workouts" style={{
            background: 'rgba(255,255,255,0.06)',
            color: '#e2e8f0',
            padding: '14px 32px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            Start a Workout
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48, letterSpacing: '-0.5px' }}>
          Everything you need to perform
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { icon: '📊', title: 'Smart Dashboard', desc: 'At-a-glance stats: steps, calories, hydration, and active minutes all in one place.' },
            { icon: '💪', title: 'Workout Tracker', desc: 'Log runs, lifts, rides, and yoga sessions. Build streaks and beat your PRs.' },
            { icon: '🥗', title: 'Nutrition Log', desc: 'Track macros and meals effortlessly. Hit your protein targets every day.' },
            { icon: '📈', title: 'Progress Analytics', desc: 'See your gains over time. Celebrate milestones and stay motivated.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#13131f',
              border: '1px solid #2a2a3e',
              borderRadius: 16,
              padding: 28,
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
