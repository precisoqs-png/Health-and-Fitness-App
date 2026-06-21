import { useState } from 'react'
import { useApp, calcStreak } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'

const GOAL_ICONS = ['⚖️', '🏃', '💪', '🥩', '🚴', '🧘', '🏊', '⚡', '🎯', '🏆']
const GOAL_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#3b82f6', '#06b6d4', '#eab308', '#ec4899']

export default function Progress() {
  const { workouts, goals, weightLog, updateGoalProgress, addGoal, deleteGoal, addWeight } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ label: '', total: '', unit: '', icon: '🎯', color: '#3b82f6' })
  const [weightInput, setWeightInput] = useState('')
  const [showWeightForm, setShowWeightForm] = useState(false)

  const totalCalsBurned = workouts.reduce((s, w) => s + w.calories, 0)
  const totalMins = workouts.reduce((s, w) => s + w.duration, 0)
  const runKm = workouts.filter(w => w.type === 'Running').reduce((s, w) => s + Math.round(w.duration * 0.18), 0)
  const streak = calcStreak(workouts)

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const ww = workouts.filter(w => { const d = new Date(w.date); return d >= weekStart && d < weekEnd })
    return { week: `W${i + 1}`, workouts: ww.length, calories: ww.reduce((s, w) => s + w.calories, 0) }
  })

  const chartData = workouts.length > 0 ? weeklyData : [
    { week: 'W1', workouts: 4, calories: 1240 },
    { week: 'W2', workouts: 5, calories: 1580 },
    { week: 'W3', workouts: 3, calories: 980 },
    { week: 'W4', workouts: 6, calories: 1820 },
  ]
  const maxCalories = Math.max(...chartData.map(w => w.calories), 1)

  const milestones = [
    { label: 'First Workout Logged', achieved: workouts.length >= 1 },
    { label: '5 Workouts Completed', achieved: workouts.length >= 5 },
    { label: '10 Workouts Completed', achieved: workouts.length >= 10 },
    { label: '7-Day Streak', achieved: streak >= 7 },
    { label: 'First Weight Logged', achieved: weightLog.length >= 1 },
    { label: '500km Running', achieved: runKm >= 500 },
  ]

  function saveGoalEdit(label: string, total: number) {
    const v = parseFloat(editValue)
    if (!isNaN(v) && v >= 0 && v <= total) {
      updateGoalProgress(label, v)
      showToast('Goal progress updated')
    }
    setEditingGoal(null)
    setEditValue('')
  }

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!newGoal.label || !newGoal.total || !newGoal.unit) { showToast('Fill in all fields', 'error'); return }
    await addGoal({ label: newGoal.label, progress: 0, total: Number(newGoal.total), unit: newGoal.unit, icon: newGoal.icon, color: newGoal.color })
    showToast(`Goal "${newGoal.label}" created!`)
    setNewGoal({ label: '', total: '', unit: '', icon: '🎯', color: '#3b82f6' })
    setShowAddGoal(false)
  }

  function handleLogWeight(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weightInput)
    if (!w || w < 20 || w > 500) { showToast('Enter a valid weight (20–500 kg)', 'error'); return }
    addWeight(w)
    showToast(`Weight logged: ${w} kg`)
    setWeightInput('')
    setShowWeightForm(false)
  }

  const recentWeights = weightLog.slice(0, 10)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Progress</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Track your goals, weight, and milestones</p>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16, marginBottom: 28 }}>
        {[
          { label: 'Total Workouts', value: workouts.length > 0 ? workouts.length.toString() : '0', icon: '💪' },
          { label: 'km Run', value: runKm > 0 ? runKm.toString() : '0', icon: '🏃' },
          { label: 'Calories Burned', value: totalCalsBurned > 0 ? totalCalsBurned.toLocaleString() : '0', icon: '🔥' },
          { label: 'Current Streak', value: `${streak} days`, icon: '⚡' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 14, padding: isMobile ? 14 : 20, textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 6 }}>{icon}</div>
            <p style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Goals */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h2 style={{ fontWeight: 600, fontSize: 16 }}>Active Goals</h2>
            <button onClick={() => setShowAddGoal(!showAddGoal)} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '5px 12px', color: '#3b82f6', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              {showAddGoal ? '✕' : '+ Add'}
            </button>
          </div>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 16 }}>Tap "Update" to log your progress</p>

          {showAddGoal && (
            <form onSubmit={handleAddGoal} style={{ background: '#0f0f1a', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#94a3b8' }}>New Goal</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Goal name (e.g. Run a 5K)" value={newGoal.label} onChange={e => setNewGoal(g => ({ ...g, label: e.target.value }))} style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="number" placeholder="Target (e.g. 5)" value={newGoal.total} onChange={e => setNewGoal(g => ({ ...g, total: e.target.value }))} style={inputStyle} />
                  <input placeholder="Unit (e.g. km)" value={newGoal.unit} onChange={e => setNewGoal(g => ({ ...g, unit: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Icon</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {GOAL_ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => setNewGoal(g => ({ ...g, icon: ic }))} style={{ fontSize: 18, background: newGoal.icon === ic ? 'rgba(249,115,22,0.2)' : '#13131f', border: `1px solid ${newGoal.icon === ic ? '#3b82f6' : '#2a2a3e'}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Color</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {GOAL_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setNewGoal(g => ({ ...g, color: c }))} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: newGoal.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Create Goal</button>
                  <button type="button" onClick={() => setShowAddGoal(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '9px 14px', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {goals.map(({ label, progress, total, unit, icon, color }) => {
              const pct = Math.min(100, Math.round((progress / total) * 100))
              const isEditing = editingGoal === label
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color, fontWeight: 600 }}>{progress}/{total} {unit}</span>
                      <button onClick={async () => { await deleteGoal(label); showToast('Goal removed', 'info') }} style={{ background: 'transparent', border: 'none', color: '#334155', fontSize: 14, cursor: 'pointer', padding: '0 4px' }} title="Remove goal">✕</button>
                    </div>
                  </div>
                  <ProgressBar pct={pct} color={color} height={8} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <p style={{ fontSize: 12, color: '#475569' }}>{pct}% complete{pct === 100 ? ' 🎉' : ''}</p>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="number"
                          autoFocus
                          min={0}
                          max={total}
                          step={0.1}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveGoalEdit(label, total); if (e.key === 'Escape') setEditingGoal(null) }}
                          style={{ width: 70, background: '#0f0f1a', border: `1px solid ${color}`, borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
                        />
                        <button onClick={() => saveGoalEdit(label, total)} style={{ background: color, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✓</button>
                        <button onClick={() => setEditingGoal(null)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingGoal(label); setEditValue(progress.toString()) }} style={{ background: 'transparent', border: `1px solid ${color}40`, borderRadius: 6, padding: '3px 10px', fontSize: 12, color, cursor: 'pointer' }}>
                        Update
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Milestones */}
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Milestones</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {milestones.map(({ label, achieved }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: achieved ? 'rgba(34,197,94,0.06)' : '#0f0f1a' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{achieved ? '✅' : '🔒'}</span>
                  <span style={{ fontSize: 13, color: achieved ? '#e2e8f0' : '#475569' }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, color: achieved ? '#22c55e' : '#334155' }}>{achieved ? 'Done' : '—'}</span>
              </div>
            ))}
          </div>
          {totalMins > 0 && (
            <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 16 }}>
              Total active time: {Math.floor(totalMins / 60) > 0 ? `${Math.floor(totalMins / 60)}h ` : ''}{totalMins % 60}m
            </p>
          )}
        </Card>
      </div>

      {/* Weight tracking */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: 16 }}>⚖️ Body Weight</h2>
            <p style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>Track your weight over time</p>
          </div>
          <button onClick={() => setShowWeightForm(!showWeightForm)} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '7px 16px', color: '#3b82f6', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            {showWeightForm ? '✕' : '+ Log weight'}
          </button>
        </div>

        {showWeightForm && (
          <form onSubmit={handleLogWeight} style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, maxWidth: 200 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Weight (kg)</span>
              <input type="number" step="0.1" min="20" max="500" placeholder="e.g. 78.5" autoFocus value={weightInput} onChange={e => setWeightInput(e.target.value)} style={inputStyle} />
            </label>
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>Save</button>
            <button type="button" onClick={() => setShowWeightForm(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 14px', color: '#64748b', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </form>
        )}

        {recentWeights.length === 0 ? (
          <p style={{ color: '#334155', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No weight entries yet — log your first one above.</p>
        ) : (
          <div>
            {/* Mini chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 6 : 10, height: 80, marginBottom: 16 }}>
              {recentWeights.slice().reverse().map((entry) => {
                const weights = recentWeights.map(e => e.weight)
                const minW = Math.min(...weights)
                const maxW = Math.max(...weights)
                const range = maxW - minW || 1
                const pct = ((entry.weight - minW) / range) * 60 + 20
                return (
                  <div key={entry.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <p style={{ fontSize: 10, color: '#64748b' }}>{entry.weight}</p>
                    <div style={{ width: '100%', height: `${pct}px`, background: 'linear-gradient(to top, #3b82f6, #fb923c)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                    <p style={{ fontSize: 10, color: '#475569' }}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</p>
                  </div>
                )
              })}
            </div>
            {/* Recent list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentWeights.slice(0, 5).map(entry => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0f0f1a', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>{entry.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Weekly chart */}
      <Card>
        <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Weekly Calories Burned</h2>
        {workouts.length === 0 && <p style={{ color: '#334155', fontSize: 13, marginBottom: 14 }}>Showing demo data — log workouts to see your real stats.</p>}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 12 : 24, height: 140, marginTop: 16 }}>
          {chartData.map(({ week, workouts: wCount, calories }) => (
            <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <p style={{ fontSize: 11, color: '#64748b' }}>{calories > 0 ? calories : '—'}</p>
              <div style={{ width: '100%', height: calories > 0 ? `${(calories / maxCalories) * 100}px` : '4px', background: calories > 0 ? 'linear-gradient(to top, #3b82f6, #fb923c)' : '#1e1e2e', borderRadius: '6px 6px 0 0' }} />
              <p style={{ fontSize: 12, color: '#64748b' }}>{week}</p>
              {!isMobile && <p style={{ fontSize: 11, color: '#475569' }}>{wCount > 0 ? `${wCount} sessions` : 'no data'}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0f0f1a', border: '1px solid #2a2a3e', borderRadius: 8,
  padding: '9px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
