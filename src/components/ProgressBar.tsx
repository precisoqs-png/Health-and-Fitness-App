export default function ProgressBar({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ background: '#1e1e2e', borderRadius: 100, height, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.4s ease' }} />
    </div>
  )
}
