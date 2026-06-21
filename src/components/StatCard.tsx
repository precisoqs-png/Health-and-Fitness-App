import ProgressBar from './ProgressBar'

interface StatCardProps {
  label: string
  value: string
  goal: string
  icon: string
  pct: number
  color: string
  isMobile?: boolean
}

export default function StatCard({ label, value, goal, icon, pct, color, isMobile }: StatCardProps) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid #2a2a3e', borderRadius: 14, padding: isMobile ? '14px 14px' : 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 10 : 14 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 11 : 13, marginBottom: 3 }}>{label}</p>
          <p style={{ fontSize: isMobile ? 20 : 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
          <p style={{ color: 'var(--text-subtle)', fontSize: 11, marginTop: 3 }}>Goal: {goal}</p>
        </div>
        <span style={{ fontSize: isMobile ? 22 : 28 }}>{icon}</span>
      </div>
      <ProgressBar pct={pct} color={color} height={isMobile ? 5 : 6} />
      <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>{pct}%</p>
    </div>
  )
}
