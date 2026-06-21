import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { ProgramExercise, ProgramDay, ProgramWeek, DiarySet } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import { useToast } from '../context/ToastContext'
import Card from '../components/Card'
import { generateProgram } from '../lib/programGenerator'

type Tab = 'program' | 'build' | 'history'

const EXERCISE_SUGGESTIONS = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Incline Bench Press', 'Romanian Deadlift', 'Leg Press', 'Pull-Up', 'Dip',
  'Bicep Curl', 'Tricep Pushdown', 'Lateral Raise', 'Cable Row', 'Leg Curl',
  'Leg Extension', 'Calf Raise', 'Face Pull', 'Chest Fly', 'Hip Thrust',
  'Lunges', 'Bulgarian Split Squat', 'Hack Squat', 'Preacher Curl', 'Skull Crusher',
]

export default function Programs() {
  const { programs, diary, activeProgramId, addProgram, deleteProgram, setActiveProgram, logDiaryEntry, deleteDiaryEntry } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [tab, setTab] = useState<Tab>('program')

  // AI builder state
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  function handleGenerateProgram() {
    if (!aiPrompt.trim()) { showToast('Describe the program you want', 'error'); return }
    setAiLoading(true)
    setAiError('')
    // Brief timeout so the loading state renders before synchronous work
    setTimeout(() => {
      try {
        const result = generateProgram(aiPrompt)
        addProgram({ name: result.name, weeks: result.weeks })
        showToast('Program generated ✓')
        setAiPrompt('')
        setTab('program')
      } catch (err) {
        setAiError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setAiLoading(false)
      }
    }, 80)
  }

  // Build program state
  const [buildName, setBuildName] = useState('')
  const [buildWeeks, setBuildWeeks] = useState(12)
  const [days, setDays] = useState<ProgramDay[]>([
    { id: crypto.randomUUID(), label: 'Day A', exercises: [] }
  ])
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)

  // Log session state
  const [loggingDayId, setLoggingDayId] = useState<string | null>(null)
  const [loggingWeek, setLoggingWeek] = useState<number>(1)
  const [logSets, setLogSets] = useState<Record<string, Array<{ reps: number; weight: number }>>>({})

  const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0] || null

  // ---- Build Program ----
  function addDay() {
    setDays(prev => [...prev, { id: crypto.randomUUID(), label: `Day ${String.fromCharCode(65 + prev.length)}`, exercises: [] }])
  }

  function removeDay(dayId: string) {
    setDays(prev => prev.filter(d => d.id !== dayId))
  }

  function addExercise(dayId: string) {
    setDays(prev => prev.map(d => d.id !== dayId ? d : {
      ...d,
      exercises: [...d.exercises, { id: crypto.randomUUID(), name: '', sets: 3, reps: '8-10', restSecs: 90 }]
    }))
  }

  function updateExercise(dayId: string, exId: string, field: keyof ProgramExercise, value: string | number) {
    setDays(prev => prev.map(d => d.id !== dayId ? d : {
      ...d,
      exercises: d.exercises.map(ex => ex.id !== exId ? ex : { ...ex, [field]: value })
    }))
  }

  function removeExercise(dayId: string, exId: string) {
    setDays(prev => prev.map(d => d.id !== dayId ? d : {
      ...d,
      exercises: d.exercises.filter(ex => ex.id !== exId)
    }))
  }

  function handleSaveProgram() {
    if (!buildName.trim()) { showToast('Program name is required', 'error'); return }
    if (days.every(d => d.exercises.length === 0)) { showToast('Add at least one exercise', 'error'); return }
    const weeks: ProgramWeek[] = Array.from({ length: buildWeeks }, (_, i) => ({
      weekNumber: i + 1,
      days: days.map(d => ({ ...d, id: crypto.randomUUID(), exercises: d.exercises.map(ex => ({ ...ex, id: crypto.randomUUID() })) })),
    }))
    addProgram({ name: buildName, weeks })
    setBuildName('')
    setBuildWeeks(12)
    setDays([{ id: crypto.randomUUID(), label: 'Day A', exercises: [] }])
    setTab('program')
    showToast('Program created ✓')
  }

  // ---- Log Session ----
  function startLogging(weekNumber: number, day: ProgramDay) {
    setLoggingWeek(weekNumber)
    setLoggingDayId(day.id)
    const initial: Record<string, Array<{ reps: number; weight: number }>> = {}
    day.exercises.forEach(ex => {
      initial[ex.id] = Array.from({ length: ex.sets }, () => ({ reps: 0, weight: 0 }))
    })
    setLogSets(initial)
  }

  function handleSaveSession(day: ProgramDay) {
    if (!activeProgram) return
    const sets: DiarySet[] = []
    day.exercises.forEach(ex => {
      const exSets = logSets[ex.id] || []
      exSets.forEach((s, i) => {
        if (s.reps > 0 || s.weight > 0) {
          sets.push({ exerciseId: ex.id, exerciseName: ex.name, setNumber: i + 1, repsCompleted: s.reps, weightKg: s.weight })
        }
      })
    })
    logDiaryEntry({
      programId: activeProgram.id,
      weekNumber: loggingWeek,
      dayId: day.id,
      dayLabel: day.label,
      date: new Date().toISOString(),
      sets,
    })
    setLoggingDayId(null)
    showToast('Session logged ✓')
  }

  const totalVolume = (entry: typeof diary[0]) =>
    entry.sets.reduce((s, set) => s + set.repsCompleted * set.weightKg, 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Training Programs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Plan workouts, track sets, weights and progress</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 10, padding: 4, marginBottom: 20, border: '1px solid #2a2a3e' }}>
        {([['program', 'My Program'], ['build', 'Build Program'], ['history', 'Diary']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? 12 : 14, background: tab === key ? 'var(--accent)' : 'transparent', color: tab === key ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* MY PROGRAM TAB */}
      {tab === 'program' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {programs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card)', border: '1px solid #2a2a3e', borderRadius: 16 }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🏋️</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>No programs yet</p>
              <p style={{ fontSize: 14, color: 'var(--text-subtle)', marginBottom: 20 }}>Build your first training program to get started.</p>
              <button onClick={() => setTab('build')} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
                Build a Program
              </button>
            </div>
          ) : (
            <>
              {/* Program selector */}
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
                          <button onClick={() => { deleteProgram(p.id); showToast('Program deleted', 'info') }} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Week/Day grid */}
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
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                          <span>Week {week.weekNumber}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{week.days.length} days</span>
                            <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>{expandedWeek === week.weekNumber ? '▲' : '▼'}</span>
                          </div>
                        </button>
                        {expandedWeek === week.weekNumber && (
                          <div style={{ padding: '10px 0 4px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {week.days.map(day => (
                              <div key={day.id} style={{ background: 'var(--bg)', border: '1px solid #1e1e2e', borderRadius: 8, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{day.label}</p>
                                  {loggingDayId === day.id ? null : (
                                    <button onClick={() => startLogging(week.weekNumber, day)}
                                      style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                      Log Session
                                    </button>
                                  )}
                                </div>

                                {/* Exercise table */}
                                {day.exercises.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px', gap: 8, padding: '4px 8px', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      <span>Exercise</span><span style={{ textAlign: 'center' }}>Sets</span><span style={{ textAlign: 'center' }}>Reps</span><span style={{ textAlign: 'center' }}>Rest</span>
                                    </div>
                                    {day.exercises.map(ex => (
                                      <div key={ex.id} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px', gap: 8, padding: '8px', background: 'var(--card)', borderRadius: 6, fontSize: 14 }}>
                                        <span style={{ color: 'var(--text)' }}>{ex.name}</span>
                                        <span style={{ color: 'var(--accent)', textAlign: 'center', fontWeight: 600 }}>{ex.sets}</span>
                                        <span style={{ color: '#94a3b8', textAlign: 'center' }}>{ex.reps}</span>
                                        <span style={{ color: 'var(--text-subtle)', textAlign: 'center', fontSize: 12 }}>{ex.restSecs}s</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Inline logging */}
                                {loggingDayId === day.id && (
                                  <div style={{ marginTop: 14, borderTop: '1px solid #2a2a3e', paddingTop: 14 }}>
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
                                      <button onClick={() => setLoggingDayId(null)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
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

      {/* BUILD PROGRAM TAB */}
      {tab === 'build' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Program Builder */}
          <Card>
            <h2 style={{ ...sectionHead, marginBottom: 12 }}>✨ AI Program Builder</h2>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Describe the program you want, e.g. '12-week program to grow lats and chest with 3 gym days per week, intermediate level'"
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', fontStyle: 'italic', margin: '8px 0 12px' }}>
              AI-generated programs are suggestions only. Always consult a qualified fitness professional before starting a new training program, and use your own judgement — AI can make mistakes.
            </p>
            {aiError && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{aiError}</p>}
            <button
              onClick={handleGenerateProgram}
              disabled={aiLoading}
              style={{ background: aiLoading ? '#1e3a8a88' : '#1e3a8a', color: '#93c5fd', border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {aiLoading ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #93c5fd', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Generating…</> : '✨ Generate Program'}
            </button>
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
              Define your training days below. The same day structure repeats across all {buildWeeks} weeks — you log actual weights when you do the session.
            </p>
          </Card>

          {days.map((day, dayIdx) => (
            <Card key={day.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <input value={day.label} onChange={e => setDays(prev => prev.map(d => d.id === day.id ? { ...d, label: e.target.value } : d))}
                  style={{ ...inputStyle, fontSize: 15, fontWeight: 600, maxWidth: 160 }} />
                {days.length > 1 && (
                  <button onClick={() => removeDay(day.id)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '5px 10px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Remove Day</button>
                )}
              </div>

              {day.exercises.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px 30px', gap: 8, padding: '0 4px', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <span>Exercise</span><span style={{ textAlign: 'center' }}>Sets</span><span style={{ textAlign: 'center' }}>Reps</span><span style={{ textAlign: 'center' }}>Rest(s)</span><span />
                  </div>
                  {day.exercises.map(ex => (
                    <div key={ex.id} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px 30px', gap: 8, alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <input value={ex.name} onChange={e => updateExercise(day.id, ex.id, 'name', e.target.value)}
                          placeholder="Exercise name" style={inputStyle} list={`ex-list-${day.id}-${ex.id}`} />
                        <datalist id={`ex-list-${day.id}-${ex.id}`}>
                          {EXERCISE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </div>
                      <input type="number" min={1} max={20} value={ex.sets} onChange={e => updateExercise(day.id, ex.id, 'sets', Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center', padding: '10px 4px' }} />
                      <input value={ex.reps} onChange={e => updateExercise(day.id, ex.id, 'reps', e.target.value)} placeholder="8-10" style={{ ...inputStyle, textAlign: 'center' }} />
                      <input type="number" min={0} value={ex.restSecs} onChange={e => updateExercise(day.id, ex.id, 'restSecs', Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center', padding: '10px 4px' }} />
                      <button onClick={() => removeExercise(day.id, ex.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', fontSize: 18, cursor: 'pointer', padding: 0 }}>x</button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => addExercise(day.id)} style={{ background: 'transparent', border: '1px dashed #2a2a3e', borderRadius: 8, padding: '8px 16px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', width: '100%' }}>
                + Add Exercise
              </button>

              {dayIdx === days.length - 1 && (
                <button onClick={addDay} style={{ marginTop: 8, background: 'transparent', border: '1px dashed #2a2a3e', borderRadius: 8, padding: '8px 16px', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', width: '100%' }}>
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

      {/* DIARY / HISTORY TAB */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {diary.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card)', border: '1px solid #2a2a3e', borderRadius: 16 }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📓</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>No sessions logged yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 6 }}>Log a session from the My Program tab to see it here.</p>
            </div>
          ) : (
            diary.map(entry => (
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
                      style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '5px 10px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Group sets by exercise */}
                {(() => {
                  const byEx: Record<string, typeof entry.sets> = {}
                  entry.sets.forEach(s => { byEx[s.exerciseName] = [...(byEx[s.exerciseName] || []), s] })
                  return Object.entries(byEx).map(([name, sets]) => (
                    <div key={name} style={{ marginBottom: 10 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{name}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {sets.map((s, i) => (
                          <span key={i} style={{ background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 6, padding: '4px 10px', fontSize: 13, color: 'var(--text)' }}>
                            {s.repsCompleted} × {s.weightKg}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </Card>
            ))
          )}
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
  background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8,
  padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
