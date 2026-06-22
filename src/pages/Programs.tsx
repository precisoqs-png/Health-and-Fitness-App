import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import type { ProgramExercise, ProgramDay, ProgramWeek, TrainingProgram, DiarySet } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import { useToast } from '../context/ToastContext'
import Card from '../components/Card'
import { generateProgram, needsFollowUp, LIBRARY, EXERCISE_MUSCLE_MAP } from '../lib/programGenerator'
import type { FollowUpQuestion } from '../lib/programGenerator'
import { todayISO } from '../context/AppContext'
import { EXERCISE_DEMOS } from '../lib/exerciseDemos'

type Tab = 'program' | 'build' | 'history'

const ALL_EXERCISES = Object.values(LIBRARY).flat()

// ── Program editing helpers ───────────────────────────────────────────────────

function applyToAllWeeks(
  prog: TrainingProgram,
  dayIndex: number,
  transform: (day: ProgramDay) => ProgramDay,
): TrainingProgram {
  return {
    ...prog,
    weeks: prog.weeks.map(w => ({
      ...w,
      days: w.days.map((d, di) => di === dayIndex ? transform(d) : d),
    })),
  }
}

// ── Exercise Demo Modal ───────────────────────────────────────────────────────

function DemoModal({ name, onClose }: { name: string; onClose: () => void }) {
  const demo = EXERCISE_DEMOS[name]
  const diffColor = { beginner: '#22c55e', intermediate: 'var(--accent)', advanced: '#ef4444' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 36 }}>{demo?.emoji ?? '🏋️'}</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{name}</h2>
              {demo && (
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: diffColor[demo.difficulty] + '22', color: diffColor[demo.difficulty] }}>
                    {demo.difficulty}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {demo.equipment}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {demo ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Muscles worked</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {demo.muscleGroups.map(m => (
                  <span key={m} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{m}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>How to perform</p>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{demo.description}</p>
            </div>

            <div>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Coaching tips</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {demo.tips.map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No demo info available for this exercise yet.</p>
        )}
      </div>
    </div>
  )
}

// ── Swap Modal ────────────────────────────────────────────────────────────────

function SwapModal({ exName, onSelect, onClose }: { exName: string; onSelect: (name: string) => void; onClose: () => void }) {
  const muscleGroup = EXERCISE_MUSCLE_MAP[exName]
  const alternatives = muscleGroup
    ? (LIBRARY[muscleGroup] || []).filter(e => e !== exName).slice(0, 8)
    : ALL_EXERCISES.filter(e => e !== exName).slice(0, 8)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 380, width: '100%', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Swap Exercise</h3>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Replacing: {exName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {alternatives.map(alt => (
            <button key={alt} onClick={() => { onSelect(alt); onClose() }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span>{alt}</span>
              <span style={{ color: 'var(--accent)', fontSize: 13 }}>Select</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Add Exercise Modal ────────────────────────────────────────────────────────

function AddExModal({ onAdd, onClose }: { onAdd: (name: string) => void; onClose: () => void }) {
  const [value, setValue] = useState('')
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 380, width: '100%', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Add Exercise</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="Exercise name…"
          list="add-ex-list" autoFocus
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 10 }} />
        <datalist id="add-ex-list">{ALL_EXERCISES.map(e => <option key={e} value={e} />)}</datalist>
        <button onClick={() => { if (value.trim()) { onAdd(value.trim()); onClose() } }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14, width: '100%' }}>
          Add Exercise
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Programs() {
  const { programs, diary, activeProgramId, addProgram, updateProgram, deleteProgram, setActiveProgram, logDiaryEntry, deleteDiaryEntry } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [tab, setTab] = useState<Tab>('program')

  // AI builder state
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [thinking, setThinking] = useState(false)
  const [thinkingMsg, setThinkingMsg] = useState(0)
  const [followUpQs, setFollowUpQs] = useState<FollowUpQuestion[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})

  const THINKING_MSGS = ['Analysing your goal…', 'Applying exercise science principles…', 'Building your personalised plan…']

  // Diary date state
  const [diaryDate, setDiaryDate] = useState<string>(() => {
    try { return localStorage.getItem('vf_diary_date') || todayISO() } catch { return todayISO() }
  })
  const [diaryView, setDiaryView] = useState<'log' | 'progression'>('log')
  const [progressionExIdx, setProgressionExIdx] = useState(0)

  // Modal state
  const [demoExercise, setDemoExercise] = useState<string | null>(null)
  const [swapTarget, setSwapTarget] = useState<{ programId: string; dayIndex: number; exIndex: number; exName: string } | null>(null)
  const [addExTarget, setAddExTarget] = useState<{ programId: string; dayIndex: number } | null>(null)

  // Manual build state
  const [buildName, setBuildName] = useState('')
  const [buildWeeks, setBuildWeeks] = useState(12)
  const [buildDays, setBuildDays] = useState<ProgramDay[]>([{ id: crypto.randomUUID(), label: 'Day A', exercises: [] }])
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)

  // Log session state
  const [loggingDayId, setLoggingDayId] = useState<string | null>(null)
  const [loggingWeek, setLoggingWeek] = useState<number>(1)
  const [logSets, setLogSets] = useState<Record<string, Array<{ reps: number; weight: number }>>>({})

  const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0] || null

  useEffect(() => {
    const id = setInterval(() => {
      const today = todayISO()
      setDiaryDate(prev => {
        if (prev !== today) { localStorage.setItem('vf_diary_date', today); return today }
        return prev
      })
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── AI generator ──────────────────────────────────────────────────────────

  function doGenerate(prompt: string) {
    setAiLoading(true)
    setAiError('')
    setTimeout(() => {
      try {
        const result = generateProgram(prompt)
        addProgram({ name: result.name, weeks: result.weeks })
        showToast('Program generated ✓')
        setAiPrompt('')
        setFollowUpQs([])
        setFollowUpAnswers({})
        setTab('program')
      } catch (err) {
        setAiError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setAiLoading(false)
      }
    }, 80)
  }

  function handleGenerateProgram() {
    if (!aiPrompt.trim()) { showToast('Describe the program you want', 'error'); return }
    setAiError('')
    setFollowUpQs([])
    setFollowUpAnswers({})
    setThinking(true)
    setThinkingMsg(0)
    let idx = 0
    const msgInterval = setInterval(() => {
      idx = (idx + 1) % THINKING_MSGS.length
      setThinkingMsg(idx)
    }, 800)
    setTimeout(() => {
      clearInterval(msgInterval)
      setThinking(false)
      setThinkingMsg(0)
      const qs = needsFollowUp(aiPrompt)
      if (qs.length > 0) {
        setFollowUpQs(qs)
      } else {
        doGenerate(aiPrompt)
      }
    }, 2400)
  }

  function handleSubmitFollowUp() {
    const extra = Object.entries(followUpAnswers).map(([k, v]) => `${k}: ${v}`).join(', ')
    doGenerate(aiPrompt + (extra ? ' ' + extra : ''))
  }

  // ── Program editing ───────────────────────────────────────────────────────

  function handleSwap(newName: string) {
    if (!swapTarget) return
    const { programId, dayIndex, exIndex } = swapTarget
    const prog = programs.find(p => p.id === programId)
    if (!prog) return
    const updated = applyToAllWeeks(prog, dayIndex, day => ({
      ...day,
      exercises: day.exercises.map((ex, ei) => ei === exIndex ? { ...ex, name: newName } : ex),
    }))
    updateProgram(programId, updated)
    showToast('Exercise swapped ✓')
  }

  function handleDeleteExercise(programId: string, dayIndex: number, exIndex: number) {
    const prog = programs.find(p => p.id === programId)
    if (!prog) return
    const updated = applyToAllWeeks(prog, dayIndex, day => ({
      ...day,
      exercises: day.exercises.filter((_, ei) => ei !== exIndex),
    }))
    updateProgram(programId, updated)
    showToast('Exercise removed', 'info')
  }

  function handleAddExercise(name: string) {
    if (!addExTarget) return
    const { programId, dayIndex } = addExTarget
    const prog = programs.find(p => p.id === programId)
    if (!prog) return
    const updated = applyToAllWeeks(prog, dayIndex, day => ({
      ...day,
      exercises: [...day.exercises, { id: crypto.randomUUID(), name, sets: 3, reps: '8-12', restSecs: 90 }],
    }))
    updateProgram(programId, updated)
    showToast('Exercise added ✓')
  }

  function handleUpdateField(programId: string, dayIndex: number, exIndex: number, field: 'sets' | 'reps', value: string | number) {
    const prog = programs.find(p => p.id === programId)
    if (!prog) return
    const updated = applyToAllWeeks(prog, dayIndex, day => ({
      ...day,
      exercises: day.exercises.map((ex, ei) => ei === exIndex ? { ...ex, [field]: field === 'sets' ? Number(value) : value } : ex),
    }))
    updateProgram(programId, updated)
  }

  // ── Manual builder helpers ────────────────────────────────────────────────

  function addDay() {
    setBuildDays(prev => [...prev, { id: crypto.randomUUID(), label: `Day ${String.fromCharCode(65 + prev.length)}`, exercises: [] }])
  }
  function removeDay(dayId: string) { setBuildDays(prev => prev.filter(d => d.id !== dayId)) }
  function addExerciseToBuild(dayId: string) {
    setBuildDays(prev => prev.map(d => d.id !== dayId ? d : { ...d, exercises: [...d.exercises, { id: crypto.randomUUID(), name: '', sets: 3, reps: '8-10', restSecs: 90 }] }))
  }
  function updateBuildExercise(dayId: string, exId: string, field: keyof ProgramExercise, value: string | number) {
    setBuildDays(prev => prev.map(d => d.id !== dayId ? d : { ...d, exercises: d.exercises.map(ex => ex.id !== exId ? ex : { ...ex, [field]: value }) }))
  }
  function removeBuildExercise(dayId: string, exId: string) {
    setBuildDays(prev => prev.map(d => d.id !== dayId ? d : { ...d, exercises: d.exercises.filter(ex => ex.id !== exId) }))
  }
  function handleSaveProgram() {
    if (!buildName.trim()) { showToast('Program name is required', 'error'); return }
    if (buildDays.every(d => d.exercises.length === 0)) { showToast('Add at least one exercise', 'error'); return }
    const weeks: ProgramWeek[] = Array.from({ length: buildWeeks }, (_, i) => ({
      weekNumber: i + 1,
      days: buildDays.map(d => ({ ...d, id: crypto.randomUUID(), exercises: d.exercises.map(ex => ({ ...ex, id: crypto.randomUUID() })) })),
    }))
    addProgram({ name: buildName, weeks })
    setBuildName(''); setBuildWeeks(12); setBuildDays([{ id: crypto.randomUUID(), label: 'Day A', exercises: [] }])
    setTab('program'); showToast('Program created ✓')
  }

  // ── Session logging ───────────────────────────────────────────────────────

  function startLogging(weekNumber: number, day: ProgramDay) {
    setLoggingWeek(weekNumber); setLoggingDayId(day.id)
    const initial: Record<string, Array<{ reps: number; weight: number }>> = {}
    day.exercises.forEach(ex => { initial[ex.id] = Array.from({ length: ex.sets }, () => ({ reps: 0, weight: 0 })) })
    setLogSets(initial)
  }

  function handleSaveSession(day: ProgramDay) {
    if (!activeProgram) return
    const sets: DiarySet[] = []
    day.exercises.forEach(ex => {
      ;(logSets[ex.id] || []).forEach((s, i) => {
        if (s.reps > 0 || s.weight > 0) sets.push({ exerciseId: ex.id, exerciseName: ex.name, setNumber: i + 1, repsCompleted: s.reps, weightKg: s.weight })
      })
    })
    logDiaryEntry({ programId: activeProgram.id, weekNumber: loggingWeek, dayId: day.id, dayLabel: day.label, date: new Date().toISOString(), sets })
    setLoggingDayId(null); showToast('Session logged ✓')
  }

  const totalVolume = (entry: typeof diary[0]) => entry.sets.reduce((s, set) => s + set.repsCompleted * set.weightKg, 0)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      {/* Modals */}
      {demoExercise && <DemoModal name={demoExercise} onClose={() => setDemoExercise(null)} />}
      {swapTarget && <SwapModal exName={swapTarget.exName} onSelect={handleSwap} onClose={() => setSwapTarget(null)} />}
      {addExTarget && <AddExModal onAdd={handleAddExercise} onClose={() => setAddExTarget(null)} />}

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Training Programs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Plan workouts, track sets, weights and progress</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 10, padding: 4, marginBottom: 20, border: '1px solid var(--border)' }}>
        {([['program', 'My Program'], ['build', 'Build Program'], ['history', 'Diary']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? 12 : 14, background: tab === key ? 'var(--accent)' : 'transparent', color: tab === key ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── MY PROGRAM TAB ── */}
      {tab === 'program' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {programs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🏋️</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>No programs yet</p>
              <p style={{ fontSize: 14, color: 'var(--text-subtle)', marginBottom: 20 }}>Build your first training program to get started.</p>
              <button onClick={() => setTab('build')} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
                Build a Program
              </button>
            </div>
          ) : (
            <>
              {programs.length > 1 && (
                <Card>
                  <h2 style={sectionHead}>Active Program</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {programs.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: `1px solid ${p.id === activeProgramId ? 'var(--accent)' : 'var(--border)'}` }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{p.weeks.length} weeks · {p.weeks[0]?.days.length || 0} days/week</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {p.id !== activeProgramId && <button onClick={() => setActiveProgram(p.id)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Select</button>}
                          {p.id === activeProgramId && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, padding: '5px 8px' }}>Active</span>}
                          <button onClick={() => { deleteProgram(p.id); showToast('Program deleted', 'info') }} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeProgram && (
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 16 }}>{activeProgram.name}</h2>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{activeProgram.weeks.length} weeks</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {activeProgram.weeks.map(week => (
                      <div key={week.weekNumber}>
                        <button onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                          <span>Week {week.weekNumber}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{week.days.length} days</span>
                            <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>{expandedWeek === week.weekNumber ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {expandedWeek === week.weekNumber && (
                          <div style={{ padding: '10px 0 4px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {week.days.map((day, dayIndex) => (
                              <div key={day.id} style={{ background: 'var(--bg)', border: '1px solid #1e1e2e', borderRadius: 8, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{day.label}</p>
                                  {loggingDayId !== day.id && (
                                    <button onClick={() => startLogging(week.weekNumber, day)}
                                      style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                      Log Session
                                    </button>
                                  )}
                                </div>

                                {/* Exercise table with editing */}
                                {day.exercises.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 80px 44px 28px', gap: 6, padding: '2px 6px', fontSize: 10, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      <span>Exercise</span>
                                      <span style={{ textAlign: 'center' }}>Sets</span>
                                      <span style={{ textAlign: 'center' }}>Reps</span>
                                      <span style={{ textAlign: 'center' }}>⇄</span>
                                      <span />
                                    </div>
                                    {day.exercises.map((ex, exIndex) => (
                                      <div key={ex.id} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 80px 44px 28px', gap: 6, alignItems: 'center', padding: '4px 6px', background: 'var(--card)', borderRadius: 6 }}>
                                        {/* Name — click for demo */}
                                        <button onClick={() => setDemoExercise(ex.name)}
                                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', fontSize: 13, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {ex.name}
                                        </button>
                                        {/* Sets — inline editable */}
                                        <input type="number" min={1} max={20} value={ex.sets}
                                          onChange={e => handleUpdateField(activeProgram.id, dayIndex, exIndex, 'sets', e.target.value)}
                                          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 4px', color: 'var(--accent)', fontSize: 13, fontWeight: 600, textAlign: 'center', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
                                        {/* Reps — inline editable */}
                                        <input value={ex.reps}
                                          onChange={e => handleUpdateField(activeProgram.id, dayIndex, exIndex, 'reps', e.target.value)}
                                          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 6px', color: '#94a3b8', fontSize: 13, textAlign: 'center', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
                                        {/* Swap */}
                                        <button onClick={() => setSwapTarget({ programId: activeProgram.id, dayIndex, exIndex, exName: ex.name })}
                                          title="Swap exercise"
                                          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 0', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                                          ⇄
                                        </button>
                                        {/* Delete */}
                                        <button onClick={() => handleDeleteExercise(activeProgram.id, dayIndex, exIndex)}
                                          title="Remove exercise"
                                          style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', fontSize: 17, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Add exercise to this day */}
                                <button onClick={() => setAddExTarget({ programId: activeProgram.id, dayIndex })}
                                  style={{ marginTop: 8, width: '100%', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 6, padding: '6px 0', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                                  + Add Exercise
                                </button>

                                {/* Inline logging */}
                                {loggingDayId === day.id && (
                                  <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                                    <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>Logging Session — Week {loggingWeek}</p>
                                    {day.exercises.map(ex => (
                                      <div key={ex.id} style={{ marginBottom: 14 }}>
                                        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>{ex.name}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 6, marginBottom: 4 }}>
                                          <span style={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center' }}>Set</span>
                                          <span style={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center' }}>Reps</span>
                                          <span style={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center' }}>Weight (kg)</span>
                                        </div>
                                        {(logSets[ex.id] || []).map((set, si) => (
                                          <div key={si} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 6, marginBottom: 6 }}>
                                            <span style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 10, fontWeight: 600 }}>{si + 1}</span>
                                            <input type="number" min={0} value={set.reps || ''} placeholder="0"
                                              onChange={e => setLogSets(prev => ({ ...prev, [ex.id]: prev[ex.id].map((s, i) => i === si ? { ...s, reps: Number(e.target.value) } : s) }))}
                                              style={inputStyle} />
                                            <input type="number" min={0} step={0.5} value={set.weight || ''} placeholder="0"
                                              onChange={e => setLogSets(prev => ({ ...prev, [ex.id]: prev[ex.id].map((s, i) => i === si ? { ...s, weight: Number(e.target.value) } : s) }))}
                                              style={inputStyle} />
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                      <button onClick={() => handleSaveSession(day)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Save Session</button>
                                      <button onClick={() => setLoggingDayId(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ── BUILD PROGRAM TAB ── */}
      {tab === 'build' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h2 style={{ ...sectionHead, marginBottom: 12 }}>✨ Smart Program Builder</h2>
            <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4}
              placeholder="Describe what you want — e.g. '12-week half marathon training 3 days a week', 'chest and lats 4 days hypertrophy', 'push pull legs 5 days', 'cycling 8 weeks beginner'"
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', fontStyle: 'italic', margin: '8px 0 12px' }}>
              Programs are suggestions only. Always consult a qualified fitness professional before starting a new training program, and use your own judgement.
            </p>
            {aiError && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{aiError}</p>}

            {thinking && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500, transition: 'opacity 0.3s' }}>{THINKING_MSGS[thinkingMsg]}</span>
              </div>
            )}

            {!thinking && followUpQs.length > 0 && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>A few quick questions to build a better program:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {followUpQs.map(q => (
                    <div key={q.key}>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{q.label}</p>
                      <input
                        value={followUpAnswers[q.key] || ''}
                        onChange={e => setFollowUpAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                        placeholder={q.placeholder}
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={handleSubmitFollowUp} disabled={aiLoading}
                    style={{ background: aiLoading ? '#1e3a8a88' : '#1e3a8a', color: '#93c5fd', border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {aiLoading ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #93c5fd', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Generating…</> : '✨ Generate Now'}
                  </button>
                  <button onClick={() => setFollowUpQs([])} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
                    Skip
                  </button>
                </div>
              </div>
            )}

            {!thinking && followUpQs.length === 0 && (
              <button onClick={handleGenerateProgram} disabled={aiLoading}
                style={{ background: aiLoading ? '#1e3a8a88' : '#1e3a8a', color: '#93c5fd', border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {aiLoading
                  ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #93c5fd', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Generating…</>
                  : '✨ Generate Program'}
              </button>
            )}
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-subtle)', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span>or build manually below</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <Card>
            <h2 style={sectionHead}>Program Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 12 }}>
              <div>
                <p style={labelText}>Program Name</p>
                <input value={buildName} onChange={e => setBuildName(e.target.value)} placeholder="e.g. 12-Week Strength Builder" style={inputStyle} />
              </div>
              <div>
                <p style={labelText}>Number of Weeks</p>
                <input type="number" min={1} max={52} value={buildWeeks} onChange={e => setBuildWeeks(Number(e.target.value))} style={inputStyle} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 10 }}>
              Define your training days below. The same structure repeats across all {buildWeeks} weeks.
            </p>
          </Card>

          {buildDays.map((day, dayIdx) => (
            <Card key={day.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <input value={day.label} onChange={e => setBuildDays(prev => prev.map(d => d.id === day.id ? { ...d, label: e.target.value } : d))}
                  style={{ ...inputStyle, fontSize: 15, fontWeight: 600, maxWidth: 160 }} />
                {buildDays.length > 1 && (
                  <button onClick={() => removeDay(day.id)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Remove Day</button>
                )}
              </div>

              {day.exercises.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px 30px', gap: 8, padding: '0 4px', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <span>Exercise</span><span style={{ textAlign: 'center' }}>Sets</span><span style={{ textAlign: 'center' }}>Reps</span><span style={{ textAlign: 'center' }}>Rest(s)</span><span />
                  </div>
                  {day.exercises.map(ex => (
                    <div key={ex.id} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px 30px', gap: 8, alignItems: 'center' }}>
                      <div>
                        <input value={ex.name} onChange={e => updateBuildExercise(day.id, ex.id, 'name', e.target.value)}
                          placeholder="Exercise name" style={inputStyle} list={`bl-${day.id}-${ex.id}`} />
                        <datalist id={`bl-${day.id}-${ex.id}`}>{ALL_EXERCISES.map(s => <option key={s} value={s} />)}</datalist>
                      </div>
                      <input type="number" min={1} max={20} value={ex.sets} onChange={e => updateBuildExercise(day.id, ex.id, 'sets', Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center', padding: '10px 4px' }} />
                      <input value={ex.reps} onChange={e => updateBuildExercise(day.id, ex.id, 'reps', e.target.value)} placeholder="8-10" style={{ ...inputStyle, textAlign: 'center' }} />
                      <input type="number" min={0} value={ex.restSecs} onChange={e => updateBuildExercise(day.id, ex.id, 'restSecs', Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center', padding: '10px 4px' }} />
                      <button onClick={() => removeBuildExercise(day.id, ex.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', fontSize: 18, cursor: 'pointer', padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => addExerciseToBuild(day.id)} style={{ background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', width: '100%' }}>
                + Add Exercise
              </button>
              {dayIdx === buildDays.length - 1 && (
                <button onClick={addDay} style={{ marginTop: 8, background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', width: '100%' }}>
                  + Add Training Day
                </button>
              )}
            </Card>
          ))}

          <button onClick={handleSaveProgram} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
            Save Program
          </button>
        </div>
      )}

      {/* ── DIARY TAB ── */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* View toggle + date navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button
                onClick={() => setDiaryView('log')}
                style={{ background: diaryView === 'log' ? 'var(--accent)' : 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 16px', color: diaryView === 'log' ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                📅 Log
              </button>
              <button
                onClick={() => setDiaryView('progression')}
                style={{ background: diaryView === 'progression' ? 'var(--accent)' : 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 16px', color: diaryView === 'progression' ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                📈 Progression
              </button>
            </div>

            {/* Date navigation — only shown in log view */}
            {diaryView === 'log' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '4px 0' }}>
                <button onClick={() => {
                  const d = new Date(diaryDate); d.setDate(d.getDate() - 1)
                  const s = d.toISOString().slice(0, 10)
                  setDiaryDate(s); localStorage.setItem('vf_diary_date', s)
                }} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}>←</button>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 160, textAlign: 'center' }}>
                  {new Date(diaryDate + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button onClick={() => {
                  const d = new Date(diaryDate); d.setDate(d.getDate() + 1)
                  const s = d.toISOString().slice(0, 10)
                  if (s <= todayISO()) { setDiaryDate(s); localStorage.setItem('vf_diary_date', s) }
                }} disabled={diaryDate >= todayISO()} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: diaryDate >= todayISO() ? 'var(--text-subtle)' : 'var(--text)', cursor: diaryDate >= todayISO() ? 'not-allowed' : 'pointer', fontSize: 16 }}>→</button>
              </div>
            )}
          </div>

          {/* Log view */}
          {diaryView === 'log' && (
            diary.filter(e => e.date.slice(0, 10) === diaryDate).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📓</p>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>No sessions on this day</p>
                <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 6 }}>Log a session from the My Program tab to see it here.</p>
              </div>
            ) : (
              diary.filter(e => e.date.slice(0, 10) === diaryDate).map(entry => (
                <Card key={entry.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{entry.dayLabel}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 2 }}>
                        Week {entry.weekNumber} · {new Date(entry.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{totalVolume(entry).toLocaleString()}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>kg volume</p>
                      </div>
                      <button onClick={() => { deleteDiaryEntry(entry.id); showToast('Entry deleted', 'info') }}
                        style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                  {(() => {
                    const byEx: Record<string, typeof entry.sets> = {}
                    entry.sets.forEach(s => { byEx[s.exerciseName] = [...(byEx[s.exerciseName] || []), s] })
                    return Object.entries(byEx).map(([name, sets]) => (
                      <div key={name} style={{ marginBottom: 10 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{name}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {sets.map((s, i) => (
                            <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 13, color: 'var(--text)' }}>
                              {s.repsCompleted} × {s.weightKg}kg
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </Card>
              ))
            )
          )}

          {/* Progression view */}
          {diaryView === 'progression' && (() => {
            if (diary.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>📓</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>No sessions logged yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 6 }}>Log a session from the My Program tab to see it here.</p>
                </div>
              )
            }

            // Build per-exercise history
            const allExercises: Record<string, Array<{ date: string; weekNumber: number; sets: DiarySet[] }>> = {}
            diary.forEach(entry => {
              entry.sets.forEach(set => {
                if (!allExercises[set.exerciseName]) allExercises[set.exerciseName] = []
                const existing = allExercises[set.exerciseName].find(e => e.date === entry.date && e.weekNumber === entry.weekNumber)
                if (existing) {
                  existing.sets.push(set)
                } else {
                  allExercises[set.exerciseName].push({ date: entry.date, weekNumber: entry.weekNumber, sets: [set] })
                }
              })
            })
            const exerciseNames = Object.keys(allExercises).sort()
            exerciseNames.forEach(name => allExercises[name].sort((a, b) => a.date.localeCompare(b.date)))

            const clampedIdx = Math.min(progressionExIdx, exerciseNames.length - 1)
            const currentName = exerciseNames[clampedIdx]
            const sessions = allExercises[currentName]

            // Determine if bodyweight (all weights 0)
            const allBodyweight = sessions.every(s => s.sets.every(set => set.weightKg === 0))
            // Max value per session: max weight or max reps if bodyweight
            const sessionMaxValues = sessions.map(s =>
              allBodyweight
                ? Math.max(...s.sets.map(set => set.repsCompleted))
                : Math.max(...s.sets.map(set => set.weightKg))
            )

            // Summary bar text
            const summaryText = sessions.length === 1
              ? 'Log this exercise again next week to track progression'
              : (() => {
                  const first = sessionMaxValues[0]
                  const latest = sessionMaxValues[sessionMaxValues.length - 1]
                  const pct = first === 0 ? 0 : ((latest - first) / first) * 100
                  const sign = pct >= 0 ? '+' : ''
                  const unit = allBodyweight ? 'reps' : 'kg'
                  return `First: ${first} ${unit} → Latest: ${latest} ${unit} (${sign}${pct.toFixed(1)}% over ${sessions.length} sessions)`
                })()

            // SVG chart dimensions
            const vbW = 300, vbH = 120
            const padL = 30, padR = 20, padT = 20, padB = 24
            const chartW = vbW - padL - padR
            const chartH = vbH - padT - padB

            const minVal = Math.min(...sessionMaxValues)
            const maxVal = Math.max(...sessionMaxValues)
            const valRange = maxVal === minVal ? 1 : maxVal - minVal

            const toX = (i: number) => sessions.length === 1
              ? padL + chartW / 2
              : padL + (i / (sessions.length - 1)) * chartW
            const toY = (v: number) => padT + chartH - ((v - minVal) / valRange) * chartH

            const points = sessionMaxValues.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

            // Y-axis labels
            const yMid = (minVal + maxVal) / 2
            const unit = allBodyweight ? 'reps' : 'kg'

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Exercise selector */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <button
                    onClick={() => setProgressionExIdx((clampedIdx - 1 + exerciseNames.length) % exerciseNames.length)}
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}
                  >←</button>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'center', minWidth: 180 }}>
                    {currentName} ({clampedIdx + 1} of {exerciseNames.length})
                  </span>
                  <button
                    onClick={() => setProgressionExIdx((clampedIdx + 1) % exerciseNames.length)}
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}
                  >→</button>
                </div>

                <Card>
                  {/* Summary bar */}
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' }}>{summaryText}</p>

                  {/* SVG line chart */}
                  <svg viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                    {/* Grid lines */}
                    {[minVal, yMid, maxVal].map((v, i) => (
                      <line key={i} x1={padL} y1={toY(v)} x2={padL + chartW} y2={toY(v)}
                        stroke="var(--border)" strokeWidth={0.5} />
                    ))}
                    {/* Y-axis labels */}
                    {[minVal, yMid, maxVal].map((v, i) => (
                      <text key={i} x={padL - 4} y={toY(v) + 4} textAnchor="end"
                        fontSize={8} fill="var(--text-muted)">
                        {Number.isInteger(v) ? v : v.toFixed(1)}
                      </text>
                    ))}
                    {/* Unit label */}
                    <text x={padL - 4} y={padT - 6} textAnchor="end" fontSize={7} fill="var(--text-subtle)">{unit}</text>
                    {/* X-axis labels */}
                    {sessions.map((_, i) => (
                      <text key={i} x={toX(i)} y={vbH - 4} textAnchor="middle"
                        fontSize={8} fill="var(--text-muted)">
                        {i + 1}
                      </text>
                    ))}
                    {/* Line */}
                    {sessions.length > 1 && (
                      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
                    )}
                    {/* Dots */}
                    {sessionMaxValues.map((v, i) => (
                      <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="var(--accent)">
                        <title>{`Session ${i + 1}: ${v} ${unit}`}</title>
                      </circle>
                    ))}
                  </svg>

                  {/* Entry list */}
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sessions.map((session, i) => {
                      const firstSet = session.sets[0]
                      const setCount = session.sets.length
                      const prevMax = i > 0 ? sessionMaxValues[i - 1] : null
                      const currMax = sessionMaxValues[i]
                      const diff = prevMax !== null ? currMax - prevMax : null
                      const dateLabel = new Date(session.date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>{dateLabel}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Week {session.weekNumber}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--text)' }}>
                              {setCount} × {firstSet.repsCompleted} × {firstSet.weightKg} kg
                            </span>
                            {diff !== null && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: diff > 0 ? '#22c55e' : diff < 0 ? '#ef4444' : 'var(--text-muted)' }}>
                                {diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : '–'} {unit}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

const sectionHead: React.CSSProperties = {
  fontWeight: 600, fontSize: 12, marginBottom: 14,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1,
}
const labelText: React.CSSProperties = { fontSize: 13, color: '#94a3b8', marginBottom: 6 }
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
