import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp, todayISO, calcStreak } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Progress Ring ──────────────────────────────────────────────────────────────
function ProgressRing({ value, goal, label, sublabel, color, size = 110 }: {
  value: number; goal: number; label: string; sublabel?: string; color: string; size?: number
}) {
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(1, value / Math.max(1, goal))
  const offset = circ * (1 - pct)
  const displayValue = typeof value === 'number' && value > 999 ? (value / 1000).toFixed(1) + 'k' : Math.round(value).toString()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size >= 110 ? 14 : 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
            {displayValue}
          </span>
          {sublabel && (
            <span style={{ fontSize: size >= 110 ? 11 : 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>{sublabel}</span>
          )}
        </div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

// ── Widget toggle state ────────────────────────────────────────────────────────
const DEFAULT_WIDGETS = {
  rings: true,
  calories: true,
  weight: true,
  quickActions: true,
  weeklyActivity: true,
  weeklySummary: true,
}
type WidgetKey = keyof typeof DEFAULT_WIDGETS

const WIDGET_LABELS: Record<WidgetKey, string> = {
  rings: 'Activity Stats',
  calories: 'Calorie & Macros',
  weight: 'Weight Tracker',
  quickActions: 'Quick Actions',
  weeklyActivity: 'Weekly Activity',
  weeklySummary: 'Weekly Summary',
}

// ── Toggle Pill ────────────────────────────────────────────────────────────────
function TogglePill({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'none',
        border: 'none', cursor: 'pointer', padding: '4px 0',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', width: 36, height: 20,
        borderRadius: 10, background: on ? 'var(--accent-dim)' : 'var(--border)',
        padding: '0 3px', transition: 'background 0.2s', position: 'relative',
        flexShrink: 0,
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%',
          background: on ? 'var(--accent)' : '#94a3b8',
          transform: on ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 0.2s, background 0.2s',
        }} />
      </span>
      <span style={{ fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const { workouts, meals, profile, dailyLog, isNewUser, addWater, setSteps, weightLog } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [editingSteps, setEditingSteps] = useState(false)
  const [stepsInput, setStepsInput] = useState('')
  const [customiseOpen, setCustomiseOpen] = useState(false)
  const [widgets, setWidgets] = useState<typeof DEFAULT_WIDGETS>(() => {
    try {
      return { ...DEFAULT_WIDGETS, ...JSON.parse(localStorage.getItem('vf_dashboard_widgets') || '{}') }
    } catch {
      return DEFAULT_WIDGETS
    }
  })
  const today = todayISO()

  function toggleWidget(k: WidgetKey) {
    setWidgets(prev => {
      const next = { ...prev, [k]: !prev[k] }
      localStorage.setItem('vf_dashboard_widgets', JSON.stringify(next))
      return next
    })
  }

  const todayWorkouts = workouts.filter(w => w.date.slice(0, 10) === today)
  const caloriesBurned = todayWorkouts.reduce((s, w) => s + w.calories, 0)
  const activeMinutes = todayWorkouts.reduce((s, w) => s + w.duration, 0)
  const streak = calcStreak(workouts)

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().slice(0, 10)
    const dayWorkouts = workouts.filter(w => w.date.slice(0, 10) === iso)
    return {
      day: DAYS[d.getDay()],
      type: dayWorkouts.length > 0 ? dayWorkouts.map(w => w.type).join(', ') : 'Rest Day',
      duration: dayWorkouts.reduce((s, w) => s + w.duration, 0),
      calories: dayWorkouts.reduce((s, w) => s + w.calories, 0),
      hasActivity: dayWorkouts.length > 0,
    }
  })

  const weekWorkouts = workouts.filter(w => (Date.now() - new Date(w.date).getTime()) / 86400000 <= 7)
  const totalCalsThisWeek = weekWorkouts.reduce((s, w) => s + w.calories, 0)
  const totalTimeThisWeek = weekWorkouts.reduce((s, w) => s + w.duration, 0)
  const h = Math.floor(totalTimeThisWeek / 60)
  const m = totalTimeThisWeek % 60

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayMeals = meals.filter(meal => meal.date?.slice(0, 10) === today)
  const calConsumed = todayMeals.reduce((s, meal) => s + meal.calories, 0)
  const calRemaining = profile.dailyCalorieGoal - calConsumed + caloriesBurned
  const macrosConsumed = {
    protein: todayMeals.reduce((s, meal) => s + (meal.protein ?? 0), 0),
    carbs:   todayMeals.reduce((s, meal) => s + (meal.carbs ?? 0), 0),
    fat:     todayMeals.reduce((s, meal) => s + (meal.fat ?? 0), 0),
  }

  function handleWater(amt: number) {
    addWater(amt)
    if (amt > 0) showToast(`+${amt}L water logged 💧`)
  }

  function handleStepsSave(e: React.FormEvent) {
    e.preventDefault()
    const steps = Number(stepsInput)
    setSteps(steps)
    showToast(`Steps updated: ${steps.toLocaleString()} 👟`)
    setEditingSteps(false)
  }

  // ── Weight chart data ──────────────────────────────────────────────────────
  const weightEntries = [...weightLog].sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
  const hasWeightData = weightEntries.length > 0
  const currentWeight = hasWeightData ? weightEntries[weightEntries.length - 1].weight : null
  const startWeight = hasWeightData ? weightEntries[0].weight : null
  const weightChange = (currentWeight !== null && startWeight !== null) ? currentWeight - startWeight : null

  const W_SVG = 500, H_SVG = 140
  const PAD = { top: 10, right: 10, bottom: 24, left: 36 }
  const wWeights = weightEntries.map(e => e.weight)
  const minW = hasWeightData ? Math.min(...wWeights) - 1 : 0
  const maxW = hasWeightData ? Math.max(...wWeights) + 1 : 10
  const xScale = (i: number) => weightEntries.length <= 1
    ? (W_SVG - PAD.left - PAD.right) / 2 + PAD.left
    : PAD.left + (i / (weightEntries.length - 1)) * (W_SVG - PAD.left - PAD.right)
  const yScale = (w: number) => PAD.top + (1 - (w - minW) / Math.max(1, maxW - minW)) * (H_SVG - PAD.top - PAD.bottom)

  const linePoints = weightEntries.map((e, i) => `${xScale(i)},${yScale(e.weight)}`).join(' ')
  const areaPath = weightEntries.length > 0
    ? `M ${xScale(0)},${H_SVG - PAD.bottom} L ${weightEntries.map((e, i) => `${xScale(i)},${yScale(e.weight)}`).join(' L ')} L ${xScale(weightEntries.length - 1)},${H_SVG - PAD.bottom} Z`
    : ''

  // Y-axis labels
  const yTicks = hasWeightData ? [minW + 1, (minW + maxW) / 2, maxW - 1].map(v => ({
    v: Math.round(v * 10) / 10,
    y: yScale(v),
  })) : []

  // X-axis labels (show first, middle, last)
  const xLabelIndices = weightEntries.length <= 1
    ? [0]
    : [0, Math.floor((weightEntries.length - 1) / 2), weightEntries.length - 1]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

      {/* Onboarding banner */}
      {isNewUser && (
        <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 16, padding: isMobile ? '20px 20px' : '24px 32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
            <div>
              <p style={{ fontSize: 22, marginBottom: 6 }}>👋</p>
              <h2 style={{ fontWeight: 700, fontSize: isMobile ? 17 : 20, marginBottom: 6, color: 'var(--accent)' }}>Welcome to Velocity Fitness!</h2>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                Start by setting your name and daily goals, then log your first workout or meal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <Link to="/settings" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Set up profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header row with Customise button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{todayStr}</p>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Good morning, {profile.name}! 👋
          </h1>
          {streak > 0 && (
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--accent)' }}>🔥 {streak}-day streak — keep it going!</p>
          )}
        </div>
        <button
          onClick={() => setCustomiseOpen(o => !o)}
          style={{
            background: customiseOpen ? 'var(--accent-dim)' : 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 14px',
            color: customiseOpen ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          ⚙️ Customise
        </button>
      </div>

      {/* Customise panel */}
      {customiseOpen && (
        <Card style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: 'var(--text-muted)' }}>Dashboard Widgets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px 32px' }}>
            {(Object.keys(DEFAULT_WIDGETS) as WidgetKey[]).map(k => (
              <TogglePill key={k} on={widgets[k]} onToggle={() => toggleWidget(k)} label={WIDGET_LABELS[k]} />
            ))}
          </div>
        </Card>
      )}

      {/* Activity Stats — simple stat cards */}
      {widgets.rings && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {[
              { icon: '👟', value: dailyLog.steps.toLocaleString(), label: 'Steps', goal: `${dailyLog.steps.toLocaleString()} of ${profile.dailyStepGoal.toLocaleString()} goal` },
              { icon: '🔥', value: caloriesBurned.toLocaleString(), label: 'Calories Burned', goal: `${caloriesBurned} of 700 goal` },
              { icon: '⏱️', value: activeMinutes.toString(), label: 'Active Minutes', goal: `${activeMinutes} of 60 goal` },
              { icon: '💧', value: parseFloat(dailyLog.water.toFixed(2)).toString() + 'L', label: 'Water', goal: `${dailyLog.water.toFixed(2)}L of ${profile.waterGoal}L goal` },
            ].map(({ icon, value, label, goal }) => (
              <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>{value}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{goal}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Calorie & Macro rings */}
      {widgets.calories && (
        <Card style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>🍽️ Today's Calorie & Macros</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}>
            {/* Large calorie ring — top, centred */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {(() => {
                const size = isMobile ? 110 : 140
                const r = (size - 16) / 2
                const circ = 2 * Math.PI * r
                const pct = Math.min(1, calConsumed / Math.max(1, profile.dailyCalorieGoal))
                const offset = circ * (1 - pct)
                return (
                  <div style={{ position: 'relative', width: size, height: size }}>
                    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
                      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#a855f7" strokeWidth={10}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{calConsumed.toLocaleString()}</span>
                      <span style={{ fontSize: isMobile ? 11 : 12, color: 'var(--text-muted)' }}>kcal</span>
                    </div>
                  </div>
                )
              })()}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calories</span>
            </div>

            {/* 3 macro rings — below, in a row, slightly smaller */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: isMobile ? 20 : 32,
              justifyContent: 'center',
            }}>
              <ProgressRing value={macrosConsumed.protein} goal={profile.proteinGoal} label="Protein" sublabel="g" color="#ef4444" size={isMobile ? 76 : 90} />
              <ProgressRing value={macrosConsumed.carbs} goal={profile.carbsGoal} label="Carbs" sublabel="g" color="#f59e0b" size={isMobile ? 76 : 90} />
              <ProgressRing value={macrosConsumed.fat} goal={profile.fatGoal} label="Fat" sublabel="g" color="#22c55e" size={isMobile ? 76 : 90} />
            </div>
          </div>

          {/* Remaining calories line */}
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 14, color: calRemaining >= 0 ? '#22c55e' : '#ef4444' }}>
            {calRemaining >= 0 ? calRemaining.toLocaleString() : Math.abs(calRemaining).toLocaleString()} kcal {calRemaining >= 0 ? 'remaining' : 'over goal'} today
          </p>
        </Card>
      )}

      {/* Weight Tracker */}
      {widgets.weight && (
        <Card style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>⚖️ Weight Progress</h2>
          {!hasWeightData ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No weigh-ins logged yet. Add one in Settings → Body Stats.
            </p>
          ) : (
            <>
              {/* Summary row */}
              <div style={{ display: 'flex', gap: isMobile ? 16 : 32, marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'var(--accent)' }}>{currentWeight} kg</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>current</p>
                </div>
                <div>
                  <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: 'var(--text)' }}>{startWeight} kg</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>start</p>
                </div>
                {weightChange !== null && (
                  <div>
                    <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: weightChange <= 0 ? '#22c55e' : '#ef4444' }}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>change</p>
                  </div>
                )}
              </div>

              {/* SVG chart */}
              <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Y-axis labels */}
                {yTicks.map(t => (
                  <g key={t.v}>
                    <line x1={PAD.left} y1={t.y} x2={W_SVG - PAD.right} y2={t.y} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
                    <text x={PAD.left - 4} y={t.y + 4} textAnchor="end" fill="var(--text-muted)" fontSize={9}>{t.v}</text>
                  </g>
                ))}

                {/* Area fill */}
                {weightEntries.length > 1 && (
                  <path d={areaPath} fill="url(#weightGrad)" />
                )}

                {/* Line */}
                {weightEntries.length > 1 && (
                  <polyline points={linePoints} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                )}

                {/* Dots */}
                {weightEntries.map((e, i) => (
                  <circle key={e.id} cx={xScale(i)} cy={yScale(e.weight)} r={4} fill="var(--accent)" stroke="var(--card)" strokeWidth={2}>
                    <title>{e.date}: {e.weight} kg</title>
                  </circle>
                ))}

                {/* X-axis labels */}
                {xLabelIndices.map(idx => {
                  if (idx >= weightEntries.length) return null
                  const entry = weightEntries[idx]
                  const shortDate = entry.date.slice(5) // MM-DD
                  return (
                    <text key={idx} x={xScale(idx)} y={H_SVG - PAD.bottom + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={9}>
                      {shortDate}
                    </text>
                  )
                })}
              </svg>
            </>
          )}
        </Card>
      )}

      {/* Quick actions */}
      {widgets.quickActions && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <Card>
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💧 Log Water</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {[0.25, 0.5, 0.75, 1].map(amt => (
                <button key={amt} onClick={() => handleWater(amt)} style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)', borderRadius: 8, padding: '8px 14px', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  +{amt}L
                </button>
              ))}
              {dailyLog.water > 0 && (
                <button onClick={() => addWater(-0.25)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>−0.25L</button>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{dailyLog.water.toFixed(2)}L</span> logged · {Math.max(0, profile.waterGoal - dailyLog.water).toFixed(2)}L remaining
            </p>
          </Card>

          <Card>
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>👟 Log Steps</h2>
            {editingSteps ? (
              <form onSubmit={handleStepsSave} style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" max="99999" autoFocus value={stepsInput} onChange={e => setStepsInput(e.target.value)} placeholder="e.g. 7500" style={{ flex: 1, background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Save</button>
                <button type="button" onClick={() => setEditingSteps(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '9px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{dailyLog.steps.toLocaleString()}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>of {profile.dailyStepGoal.toLocaleString()} goal</p>
                </div>
                <button onClick={() => { setStepsInput(dailyLog.steps.toString()); setEditingSteps(true) }} style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '8px 16px', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Update
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
        {widgets.weeklyActivity && (
          <Card>
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>This Week's Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {last7.map(({ day, type, duration, calories, hasActivity }) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-subtle)', fontSize: 13, minWidth: 32 }}>{day}</span>
                    <span style={{ fontWeight: 500, fontSize: 13, color: hasActivity ? 'var(--text)' : 'var(--text-subtle)' }}>{type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {duration > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{duration}m</span>}
                    {calories > 0 && <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>{calories} kcal</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {widgets.weeklySummary && (
          <Card>
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Weekly Summary</h2>
            {[
              { label: 'Workouts', value: weekWorkouts.length.toString(), icon: '✅' },
              { label: 'Calories Burned', value: totalCalsThisWeek.toLocaleString(), icon: '🔥' },
              { label: 'Active Time', value: h > 0 ? `${h}h ${m}m` : `${m}m`, icon: '⏱️' },
              { label: 'Streak', value: `${streak} days`, icon: '⚡' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #1e1e2e' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span>{icon}</span>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 14 }}>{value}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
