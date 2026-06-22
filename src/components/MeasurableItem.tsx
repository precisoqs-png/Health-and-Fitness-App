import type { GoalMeasurable } from '../context/VisionContext'

interface Props {
  item: GoalMeasurable
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function MeasurableItem({ item, onToggle, onDelete }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: item.completed ? 'rgba(34,197,94,0.07)' : 'var(--input-bg)',
      borderRadius: 8,
      border: `1px solid ${item.completed ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
      transition: 'all 0.2s',
    }}>
      <button
        onClick={() => onToggle(item.id)}
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          borderRadius: 4,
          border: item.completed ? '2px solid #22c55e' : '2px solid var(--border)',
          background: item.completed ? '#22c55e' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          transition: 'all 0.15s',
        }}
      >
        {item.completed && (
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>
        )}
      </button>

      <span style={{
        flex: 1,
        fontSize: 14,
        color: item.completed ? 'var(--text-muted)' : 'var(--text)',
        textDecoration: item.completed ? 'line-through' : 'none',
        transition: 'all 0.2s',
      }}>
        {item.text}
      </span>

      <button
        onClick={() => onDelete(item.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-subtle)',
          fontSize: 16,
          padding: '0 4px',
          lineHeight: 1,
          opacity: 0.5,
          transition: 'opacity 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5' }}
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}
