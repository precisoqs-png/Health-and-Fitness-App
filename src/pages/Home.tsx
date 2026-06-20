import { Link } from 'react-router-dom'
import { useMobile } from '../hooks/useMobile'

export default function Home() {
  const isMobile = useMobile()

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '48px 20px' : '80px 24px',
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
          marginBottom: 28,
        }}>
          ⚡ Track. Train. Transform.
        </div>

        <h1 style={{ fontSize: isMobile ? 36 : 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 20, maxWidth: 800 }}>
          Your fitness journey,{' '}
          <span style={{ color: '#f97316' }}>supercharged.</span>
        </h1>

        <p style={{ fontSize: isMobile ? 15 : 18, color: '#94a3b8', maxWidth: 480, lineHeight: 1.7, marginBottom: 40 }}>
          Velocity Fitness helps you track workouts, log nutrition, and hit your goals faster than ever.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/dashboard" style={{
            background: '#f97316',
            color: '#fff',
            padding: isMobile ? '12px 28px' : '14px 32px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: isMobile ? 15 : 16,
            textDecoration: 'none',
          }}>
            Go to Dashboard →
          </Link>
          <Link to="/workouts" style={{
            background: 'rgba(255,255,255,0.06)',
            color: '#e2e8f0',
            padding: isMobile ? '12px 28px' : '14px 32px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: isMobile ? 15 : 16,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            Start a Workout
          </Link>
        </div>
      </section>

      <section style={{ padding: isMobile ? '48px 20px' : '80px 24px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', fontSize: isMobile ? 24 : 32, fontWeight: 700, marginBottom: 36, letterSpacing: '-0.5px' }}>
          Everything you need to perform
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: isMobile ? 14 : 24 }}>
          {[
            { icon: '📊', title: 'Smart Dashboard', desc: 'At-a-glance stats: steps, calories, hydration, and active minutes.' },
            { icon: '💪', title: 'Workout Tracker', desc: 'Log runs, lifts, rides, and yoga. Build streaks and beat your PRs.' },
            { icon: '🥗', title: 'Nutrition Log', desc: 'Track macros and meals effortlessly. Hit your protein targets.' },
            { icon: '📈', title: 'Progress Analytics', desc: 'See your gains over time. Celebrate milestones and stay motivated.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#13131f',
              border: '1px solid #2a2a3e',
              borderRadius: 14,
              padding: isMobile ? 18 : 28,
            }}>
              <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontWeight: 600, fontSize: isMobile ? 15 : 18, marginBottom: 6 }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
