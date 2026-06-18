import ProgressBar from './ProgressBar'

interface StatCardProps {
  label: string
  value: string
  goal: string
  icon: string
  pct: number
  color: string
}

export default function StatCard({ label, value, goal, icon, pct, color }: StatCardProps) {
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
      <ProgressBar pct={pct} color={color} height={6} />
      <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{pct}% of goal</p>
    </div>
  )
}
