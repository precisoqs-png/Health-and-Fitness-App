import type { CSSProperties } from 'react'
import type { VisionGoal } from '../context/VisionContext'

interface Props {
  goal: VisionGoal
  progress: number
  onClick: () => void
  style?: CSSProperties
  size?: number
}

// Deterministic tilt from last char of goal id
function tiltDeg(id: string): number {
  const char = id[id.length - 1] ?? '0'
  const val = parseInt(char, 16) // 0-15
  return (val / 15) * 6 - 3 // -3 to +3 degrees
}

export default function StickyNote({ goal, progress, onClick, style, size = 160 }: Props) {
  const tilt = tiltDeg(goal.id)
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        position: 'absolute',
        transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
        cursor: 'pointer',
        borderRadius: 4,
        background: '#1e1e2e',
        border: `2px solid ${goal.color}44`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${goal.color}22`,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ...style,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = `translate(-50%, -50%) rotate(${tilt}deg) scale(1.08)`
        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px ${goal.color}66`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`
        el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${goal.color}22`
      }}
    >
      {/* Progress fill from bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${clampedProgress}%`,
        background: goal.color,
        opacity: 0.28,
        transition: 'height 0.6s ease',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
      }}>
        {/* Top fold corner accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: `0 16px 16px 0`,
          borderColor: `transparent ${goal.color}55 transparent transparent`,
        }} />

        <span style={{ fontSize: size < 140 ? 20 : 26 }}>
          {categoryEmoji(goal.category)}
        </span>
        <span style={{
          fontSize: size < 140 ? 11 : 13,
          fontWeight: 600,
          color: '#e2e8f0',
          textAlign: 'center',
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}>
          {goal.title}
        </span>
        <span style={{
          fontSize: 10,
          color: goal.color,
          fontWeight: 500,
          opacity: 0.85,
        }}>
          {goal.category}
        </span>

        {/* Progress indicator */}
        {clampedProgress > 0 && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: goal.color,
            background: `${goal.color}20`,
            borderRadius: 99,
            padding: '2px 8px',
          }}>
            {clampedProgress}%
          </span>
        )}
      </div>
    </div>
  )
}

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'Health & Fitness': '💪',
    'Career & Skills': '🚀',
    'Relationships': '❤️',
    'Finance': '💰',
    'Mindset & Growth': '🧠',
    'Creativity': '🎨',
    'Travel & Adventure': '✈️',
    'Other': '⭐',
  }
  return map[category] ?? '🌟'
}
