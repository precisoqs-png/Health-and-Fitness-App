import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVision } from '../context/VisionContext'
import GoalChat from '../components/GoalChat'
import MeasurableItem from '../components/MeasurableItem'
import { useMobile } from '../hooks/useMobile'

export default function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>()
  const navigate = useNavigate()
  const isMobile = useMobile()
  const { goals, measurables, toggleMeasurable, deleteMeasurable, addMeasurables, progressForGoal, loadConversation } = useVision()

  const goal = goals.find(g => g.id === goalId)
  const goalMeasurables = measurables
    .filter(m => m.goal_id === goalId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  const [newItem, setNewItem] = useState('')
  const [activeTab, setActiveTab] = useState<'coach' | 'actions'>('coach')

  useEffect(() => {
    if (goalId) loadConversation(goalId)
  }, [goalId, loadConversation])

  if (!goal) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Goal not found.</p>
        <button onClick={() => navigate('/vision-board')} style={{ marginTop: 12, background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer' }}>
          Back to Board
        </button>
      </div>
    )
  }

  const progress = progressForGoal(goal.id)

  async function handleAddItem() {
    const text = newItem.trim()
    if (!text) return
    setNewItem('')
    await addMeasurables(goal!.id, [text])
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 24px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/vision-board')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 13,
          padding: '0 0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back to Vision Board
      </button>

      {/* Goal header */}
      <div style={{
        background: 'var(--card)',
        border: `1px solid ${goal.color}44`,
        borderRadius: 16,
        padding: isMobile ? 20 : 28,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 4,
          background: goal.color,
          borderRadius: '16px 16px 0 0',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: goal.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {goal.category}
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: isMobile ? 22 : 28, fontWeight: 800, lineHeight: 1.2 }}>
              {goal.title}
            </h1>
          </div>

          {/* Progress ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: `conic-gradient(${goal.color} ${progress * 3.6}deg, var(--input-bg) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: goal.color,
              }}>
                {progress}%
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>progress</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16, background: 'var(--input-bg)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: goal.color,
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-subtle)' }}>
          <span>{goalMeasurables.filter(m => m.completed).length} of {goalMeasurables.length} actions completed</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {(['coach', 'actions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === tab ? 'var(--accent)' : 'var(--card)',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'coach' ? '🤖 AI Coach' : `✅ Actions (${goalMeasurables.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: isMobile ? 16 : 24,
      }}>
        {activeTab === 'coach' && (
          <GoalChat
            goalId={goal.id}
            goalTitle={goal.title}
            category={goal.category}
          />
        )}

        {activeTab === 'actions' && (
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Track measurable actions toward your goal. The AI coach will suggest new ones as you chat — or add your own below.
            </p>

            {goalMeasurables.length === 0 && (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--text-subtle)',
                fontSize: 14,
                border: '1px dashed var(--border)',
                borderRadius: 12,
                marginBottom: 16,
              }}>
                No actions yet. Chat with your AI coach or add one manually.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {goalMeasurables.map(item => (
                <MeasurableItem
                  key={item.id}
                  item={item}
                  onToggle={toggleMeasurable}
                  onDelete={deleteMeasurable}
                />
              ))}
            </div>

            {/* Manual add */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                placeholder="Add an action item…"
                style={{
                  flex: 1,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: newItem.trim() ? 'pointer' : 'not-allowed',
                  opacity: newItem.trim() ? 1 : 0.5,
                  whiteSpace: 'nowrap',
                }}
              >
                + Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
