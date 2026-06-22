import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVision, GOAL_CATEGORIES } from '../context/VisionContext'
import type { VisionBoard as VisionBoardType } from '../context/VisionContext'
import StickyNote from '../components/StickyNote'
import GoalCompare from '../components/GoalCompare'
import { useMobile } from '../hooks/useMobile'

const CANVAS_W = 900
const CANVAS_H = 600

function ellipsePositions(n: number): { x: number; y: number }[] {
  if (n === 0) return []
  const cx = CANVAS_W / 2
  const cy = CANVAS_H / 2
  let a = 340, b = 210
  if (n < 4) { a = 370; b = 230 }
  if (n > 10) { a = 340; b = 200 }
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2
    return {
      x: cx + a * Math.cos(angle),
      y: cy + b * Math.sin(angle),
    }
  })
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i)

export default function VisionBoard() {
  const navigate = useNavigate()
  const isMobile = useMobile()
  const { goals, ensureBoard, addGoal, deleteGoal, progressForGoal, selectedYear, setSelectedYear } = useVision()

  const [board, setBoard] = useState<VisionBoardType | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState(GOAL_CATEGORIES[0].label)
  const [newColor, setNewColor] = useState(GOAL_CATEGORIES[0].color)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Ensure board exists for selected year
  useEffect(() => {
    ensureBoard(selectedYear).then(setBoard)
  }, [selectedYear, ensureBoard])

  // Recompute scale on resize
  useEffect(() => {
    function updateScale() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        setScale(Math.min(1, w / CANVAS_W))
      }
    }
    updateScale()
    const obs = new ResizeObserver(updateScale)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const boardGoals = board ? goals.filter(g => g.board_id === board.id) : []
  const positions = ellipsePositions(boardGoals.length)
  const noteSize = isMobile ? 120 : 148

  function handleCategoryChange(label: string) {
    setNewCategory(label)
    const cat = GOAL_CATEGORIES.find(c => c.label === label)
    if (cat) setNewColor(cat.color)
  }

  async function handleAddGoal() {
    if (!newTitle.trim() || !board) return
    setSaving(true)
    await addGoal({
      board_id: board.id,
      user_id: board.user_id,
      title: newTitle.trim(),
      category: newCategory,
      color: newColor,
      position: boardGoals.length,
    })
    setNewTitle('')
    setNewCategory(GOAL_CATEGORIES[0].label)
    setNewColor(GOAL_CATEGORIES[0].color)
    setSaving(false)
    setShowAddModal(false)
  }

  async function handleDelete(id: string) {
    await deleteGoal(id)
    setConfirmDeleteId(null)
  }

  const canvasHeight = CANVAS_H * scale

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            ✨ Vision Board
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            Plan and visualise your goals
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              color: 'var(--text)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            + Add Goal
          </button>
        </div>
      </div>

      {/* Board canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 32,
          position: 'relative',
          height: canvasHeight + 2,
        }}
      >
        <div style={{
          width: CANVAS_W,
          height: CANVAS_H,
          position: 'relative',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}>
          {/* Year badge */}
          <div style={{
            position: 'absolute',
            left: CANVAS_W / 2,
            top: CANVAS_H / 2,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 64,
              fontWeight: 900,
              color: 'var(--accent)',
              letterSpacing: '-2px',
              lineHeight: 1,
              textShadow: '0 0 80px var(--accent)',
              opacity: 0.9,
            }}>
              {selectedYear}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 4 }}>
              {boardGoals.length === 0 ? 'Add your first goal →' : `${boardGoals.length} goal${boardGoals.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Orbit ring hint */}
          {boardGoals.length > 0 && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <ellipse
                cx={CANVAS_W / 2}
                cy={CANVAS_H / 2}
                rx={340}
                ry={210}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="6 8"
                opacity={0.3}
              />
            </svg>
          )}

          {/* Sticky notes */}
          {boardGoals.map((goal, i) => (
            <StickyNote
              key={goal.id}
              goal={goal}
              progress={progressForGoal(goal.id)}
              size={noteSize}
              onClick={() => navigate(`/vision-board/${goal.id}`)}
              style={{ left: positions[i]?.x ?? 0, top: positions[i]?.y ?? 0 }}
            />
          ))}
        </div>

        {/* Delete buttons overlay (outside scaled canvas, top-right of each note) */}
        {boardGoals.map((goal, i) => {
          const pos = positions[i]
          if (!pos) return null
          const x = pos.x * scale
          const y = pos.y * scale
          const ns = noteSize * scale
          return (
            <button
              key={`del-${goal.id}`}
              onClick={e => { e.stopPropagation(); setConfirmDeleteId(goal.id) }}
              style={{
                position: 'absolute',
                left: x + ns / 2 - 10,
                top: y - ns / 2 - 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#94a3b8',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                lineHeight: 1,
                padding: 0,
              }}
              title="Remove goal"
            >
              ×
            </button>
          )
        })}
      </div>

      {/* Goal comparison */}
      {board && boardGoals.length >= 2 && (
        <GoalCompare boardId={board.id} />
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
              width: '100%',
              maxWidth: 440,
            }}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Add a Goal</h2>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Goal title</label>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              placeholder="e.g. Run a half marathon"
              style={{
                width: '100%',
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 15,
                color: 'var(--text)',
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Category</label>
            <select
              value={newCategory}
              onChange={e => handleCategoryChange(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 14,
                color: 'var(--text)',
                marginBottom: 16,
                cursor: 'pointer',
              }}
            >
              {GOAL_CATEGORIES.map(c => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </select>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Colour</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <input
                type="color"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
                style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{newColor}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {GOAL_CATEGORIES.map(c => (
                  <button
                    key={c.label}
                    onClick={() => setNewColor(c.color)}
                    title={c.label}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: c.color,
                      border: newColor === c.color ? '2px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newTitle.trim() || saving}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: newTitle.trim() && !saving ? 'pointer' : 'not-allowed',
                  opacity: newTitle.trim() && !saving ? 1 : 0.6,
                }}
              >
                {saving ? 'Adding…' : 'Add Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 201, padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>Remove this goal?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)' }}>
              This will delete the goal, all its action items, and the coaching conversation.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
