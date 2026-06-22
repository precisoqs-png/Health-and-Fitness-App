import { useState } from 'react'
import { useVision } from '../context/VisionContext'

interface Props {
  boardId: string
}

export default function GoalCompare({ boardId }: Props) {
  const { goals, measurables } = useVision()
  const boardGoals = goals.filter(g => g.board_id === boardId)

  const [goalAId, setGoalAId] = useState('')
  const [goalBId, setGoalBId] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function compare() {
    if (!goalAId || !goalBId || goalAId === goalBId) return
    setError('')
    setAnalysis('')
    setLoading(true)

    const gA = boardGoals.find(g => g.id === goalAId)
    const gB = boardGoals.find(g => g.id === goalBId)
    if (!gA || !gB) { setLoading(false); return }

    const meaA = measurables.filter(m => m.goal_id === gA.id).map(m => m.text)
    const meaB = measurables.filter(m => m.goal_id === gB.id).map(m => m.text)

    try {
      const res = await fetch('/api/compare-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalA: { title: gA.title, category: gA.category, measurables: meaA },
          goalB: { title: gB.title, category: gB.category, measurables: meaB },
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json() as { analysis: string }
      setAnalysis(data.analysis)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (boardGoals.length < 2) return null

  const canCompare = goalAId && goalBId && goalAId !== goalBId

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
    }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700 }}>Compare Goals</h3>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
        See how two goals complement each other
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            First goal
          </label>
          <select
            value={goalAId}
            onChange={e => setGoalAId(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '9px 12px',
              fontSize: 14,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <option value="">Select a goal…</option>
            {boardGoals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 20, color: 'var(--text-subtle)', paddingBottom: 4 }}>↔</div>

        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Second goal
          </label>
          <select
            value={goalBId}
            onChange={e => setGoalBId(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '9px 12px',
              fontSize: 14,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <option value="">Select a goal…</option>
            {boardGoals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={compare}
          disabled={!canCompare || loading}
          style={{
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            cursor: canCompare && !loading ? 'pointer' : 'not-allowed',
            opacity: canCompare && !loading ? 1 : 0.5,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Analysing…' : 'Compare ✨'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</p>
      )}

      {analysis && (
        <div style={{
          marginTop: 20,
          padding: 20,
          background: 'var(--input-bg)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
        }}>
          {analysis}
        </div>
      )}
    </div>
  )
}
