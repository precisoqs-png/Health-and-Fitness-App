import type { ProgramWeek } from '../context/AppContext'

// ── Follow-up question helper ─────────────────────────────────────────────────

export interface FollowUpQuestion { key: string; label: string; placeholder: string }

export function needsFollowUp(prompt: string): FollowUpQuestion[] {
  const p = prompt.toLowerCase().trim()
  const questions: FollowUpQuestion[] = []

  const hasWeeks = /\d+\s*[-\s]?week/.test(p)
  const hasDays  = /\d+\s*[-\s]?(day|session|time)/.test(p)
  const hasLevel = /beginner|novice|intermediate|advanced|experienced/.test(p)
  const hasActivity = /run|marathon|cycl|swim|gym|strength|hypertrophy|muscle|fat.loss|push|pull|leg|chest|back|squat|bench/.test(p)

  if (!hasWeeks) questions.push({ key: 'weeks',    label: 'How many weeks?',          placeholder: 'e.g. 8 or 12' })
  if (!hasDays)  questions.push({ key: 'days',     label: 'How many days per week?',  placeholder: 'e.g. 3' })
  if (!hasLevel) questions.push({ key: 'level',    label: 'Fitness level?',           placeholder: 'beginner / intermediate / advanced' })
  // Only ask about goal if the prompt is vague (no clear activity)
  if (!hasActivity && questions.length < 3) questions.push({ key: 'goal', label: 'What is your main goal?', placeholder: 'e.g. build muscle, lose fat, improve cardio' })

  return questions.slice(0, 3)
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalKey = 'strength' | 'hypertrophy' | 'fatLoss'
type ActivityType = 'running' | 'cycling' | 'swimming' | 'gym' | 'hybrid'
export type MuscleKey = 'chest' | 'lats' | 'back' | 'shoulders' | 'triceps' | 'biceps' | 'quads' | 'hamstrings' | 'glutes' | 'core' | 'legs' | 'cardio'

// ── Exercise library ──────────────────────────────────────────────────────────

interface ExDef { name: string; sets: number; reps: string; restSecs: number }

const GOAL_PARAMS: Record<GoalKey, { sets: number; reps: string; rest: number }> = {
  strength:    { sets: 5, reps: '3-5',   rest: 180 },
  hypertrophy: { sets: 4, reps: '8-12',  rest: 90  },
  fatLoss:     { sets: 3, reps: '15-20', rest: 45  },
}

export const LIBRARY: Record<MuscleKey, string[]> = {
  chest:      ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Chest Fly', 'Cable Crossover', 'Push-Up', 'Dumbbell Pullover'],
  lats:       ['Pull-Up', 'Lat Pulldown', 'Seated Cable Row', 'Single-Arm Dumbbell Row', 'T-Bar Row', 'Straight-Arm Pulldown'],
  back:       ['Barbell Row', 'Cable Row', 'Face Pull', 'Rack Pull', 'Chest-Supported Row', 'Inverted Row'],
  shoulders:  ['Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press'],
  triceps:    ['Skull Crusher', 'Tricep Pushdown', 'Overhead Tricep Extension', 'Close-Grip Bench Press', 'Dip'],
  biceps:     ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Concentration Curl', 'Cable Curl'],
  quads:      ['Squat', 'Leg Press', 'Hack Squat', 'Leg Extension', 'Bulgarian Split Squat', 'Front Squat'],
  hamstrings: ['Romanian Deadlift', 'Leg Curl', 'Nordic Curl', 'Stiff-Leg Deadlift', 'Good Morning'],
  glutes:     ['Hip Thrust', 'Glute Bridge', 'Cable Kickback', 'Sumo Deadlift', 'Step-Up', 'Curtsy Lunge'],
  core:       ['Plank', 'Cable Crunch', 'Hanging Leg Raise', 'Ab Rollout', 'Russian Twist', 'Pallof Press'],
  legs:       ['Deadlift', 'Lunges', 'Calf Raise', 'Box Jump', 'Wall Sit'],
  cardio:     ['Treadmill Run', 'Stationary Bike', 'Rowing Machine', 'Jump Rope', 'Stairmaster'],
}

// Reverse map: exercise name → muscle group (for swap alternatives)
export const EXERCISE_MUSCLE_MAP: Record<string, MuscleKey> = (() => {
  const map: Record<string, MuscleKey> = {}
  for (const [group, exercises] of Object.entries(LIBRARY)) {
    for (const ex of exercises) map[ex] = group as MuscleKey
  }
  return map
})()

function pickExercises(groups: MuscleKey[], count: number, goal: GoalKey): ExDef[] {
  const p = GOAL_PARAMS[goal]
  const pool: string[] = []
  for (const g of groups) {
    for (const ex of (LIBRARY[g] || [])) if (!pool.includes(ex)) pool.push(ex)
  }
  return pool.slice(0, count).map(name => ({ name, sets: p.sets, reps: p.reps, restSecs: p.rest }))
}

// ── Parsed prompt ─────────────────────────────────────────────────────────────

interface ParsedPrompt {
  activity: ActivityType
  weeks: number
  daysPerWeek: number
  muscles: MuscleKey[]
  goal: GoalKey
  level: 'beginner' | 'intermediate' | 'advanced'
  splitHint: 'ppl' | 'upperLower' | 'fullBody' | 'bodyPart' | 'auto'
  runTarget: 'half_marathon' | 'marathon' | '10k' | '5k' | 'general'
}

const MUSCLE_KEYWORDS: Array<[RegExp, MuscleKey]> = [
  [/\b(chest|pec|pecs|bench)\b/, 'chest'],
  [/\b(lat|lats|latissimus)\b/, 'lats'],
  [/\b(back|row|pull)\b/, 'back'],
  [/\b(shoulder|delt|delts|overhead)\b/, 'shoulders'],
  [/\b(tricep|tris)\b/, 'triceps'],
  [/\b(bicep|bis|curl)\b/, 'biceps'],
  [/\b(quad|quads)\b/, 'quads'],
  [/\b(hamstring|ham|hams)\b/, 'hamstrings'],
  [/\b(glute|glutes|butt|hip)\b/, 'glutes'],
  [/\b(core|abs|ab|abdominal)\b/, 'core'],
  [/\b(leg|legs|lower body)\b/, 'legs'],
  [/\b(cardio|cycling|aerobic)\b/, 'cardio'],
]

export function parsePrompt(prompt: string): ParsedPrompt {
  const p = prompt.toLowerCase()

  // Activity type (detect before muscle keywords to avoid false positives)
  let activity: ActivityType = 'gym'
  if (/\b(run|running|marathon|half[\s-]?marathon|5k|10k|couch\s+to\s+5k|c25k|jog|jogging)\b/.test(p)) activity = 'running'
  else if (/\b(cycl|cycling|bike|biking|bicycle|spin|spinning|velodrome)\b/.test(p)) activity = 'cycling'
  else if (/\b(swim|swimming|pool|freestyle|open\s+water)\b/.test(p)) activity = 'swimming'
  else if (/\b(fat\s+loss|weight\s+loss|tone|toning|shred|cut|cutting)\b/.test(p)) activity = 'hybrid'

  // Run target distance
  let runTarget: ParsedPrompt['runTarget'] = 'general'
  if (/\b(half[\s-]?marathon|21\.?1?\s*k|half)\b/.test(p)) runTarget = 'half_marathon'
  else if (/\bfull\s+marathon\b|\b42\s*k\b|\bmarathon\b/.test(p)) runTarget = 'marathon'
  else if (/\b10\s*k(m|ilometers?)?\b/.test(p)) runTarget = '10k'
  else if (/\b5\s*k(m|ilometers?)?\b|\bcouch\s+to\s+5k\b|\bc25k\b/.test(p)) runTarget = '5k'

  // Weeks
  const weeksMatch = p.match(/(\d+)\s*[-\s]?week/)
  const weeks = weeksMatch ? Math.min(Math.max(parseInt(weeksMatch[1]), 1), 52) : 8

  // Days per week
  const daysMatch = p.match(/(\d+)\s*[-\s]?(day|session|time)/)
  const daysPerWeek = daysMatch ? Math.min(Math.max(parseInt(daysMatch[1]), 1), 7) : 3

  // Muscles (only meaningful for gym programs)
  const muscles: MuscleKey[] = []
  for (const [re, key] of MUSCLE_KEYWORDS) {
    if (re.test(p) && !muscles.includes(key)) muscles.push(key)
  }

  // Goal
  let goal: GoalKey = 'hypertrophy'
  if (/\b(strength|strong|power|powerlifting|heavy)\b/.test(p)) goal = 'strength'
  else if (/\b(fat\s+loss|cut|cutting|lean|weight\s+loss|tone|toning|shred)\b/.test(p)) goal = 'fatLoss'

  // Level
  let level: ParsedPrompt['level'] = 'intermediate'
  if (/\b(beginner|novice|new|starter|starting)\b/.test(p)) level = 'beginner'
  else if (/\b(advanced|elite|experienced)\b/.test(p)) level = 'advanced'

  // Split hint
  let splitHint: ParsedPrompt['splitHint'] = 'auto'
  if (/\b(push[\s/-]pull[\s/-]leg|ppl)\b/.test(p)) splitHint = 'ppl'
  else if (/\b(upper[\s/-]lower)\b/.test(p)) splitHint = 'upperLower'
  else if (/\b(full[\s/-]?body|total\s+body)\b/.test(p)) splitHint = 'fullBody'
  else if (muscles.length > 0) splitHint = 'bodyPart'

  return { activity, weeks, daysPerWeek, muscles, goal, level, splitHint, runTarget }
}

// ── Running plan builder ──────────────────────────────────────────────────────

interface RunSession { name: string; sets: number; reps: string; restSecs: number }

function buildRunningPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks: totalWeeks, daysPerWeek, runTarget, level } = parsed

  // Level-specific pace zones
  const paceZones = {
    easy:     level === 'beginner' ? '6:00–6:30/km' : level === 'advanced' ? '5:00–5:20/km' : '5:20–5:50/km',
    tempo:    level === 'beginner' ? '5:30–5:55/km' : level === 'advanced' ? '4:20–4:40/km' : '4:50–5:10/km',
    lt:       level === 'beginner' ? '5:10–5:30/km' : level === 'advanced' ? '4:10–4:25/km' : '4:35–4:55/km',
    interval: level === 'beginner' ? '4:55–5:15/km' : level === 'advanced' ? '3:55–4:15/km' : '4:20–4:40/km',
    race:     level === 'beginner' ? '5:45–6:10/km' : level === 'advanced' ? '4:30–4:45/km' : '5:00–5:20/km',
  }

  const raceInfo: Record<string, { startLong: number; peakLong: number; label: string; dist: string }> = {
    half_marathon: { startLong: 8,  peakLong: 19, label: 'Half Marathon', dist: '21.1 km' },
    marathon:      { startLong: 14, peakLong: 32, label: 'Marathon',      dist: '42.2 km' },
    '10k':         { startLong: 5,  peakLong: 12, label: '10K',           dist: '10 km'   },
    '5k':          { startLong: 3,  peakLong: 8,  label: '5K',            dist: '5 km'    },
    general:       { startLong: 6,  peakLong: 18, label: 'Running',       dist: 'goal'    },
  }
  const ri = raceInfo[runTarget] ?? raceInfo.general

  // Week type helpers
  const isRecovery = (w: number) => w % 4 === 0 && w < totalWeeks
  const isTaper1   = (w: number) => totalWeeks >= 8 && w === totalWeeks - 1
  const isTaper2   = (w: number) => totalWeeks >= 10 && w === totalWeeks - 2
  const isRaceWk   = (w: number) => w === totalWeeks

  // Phase label per week
  function phaseName(w: number): string {
    if (isRaceWk(w))   return 'Race Week 🏁'
    if (isTaper1(w))   return 'Taper — Wk 2'
    if (isTaper2(w))   return 'Taper — Wk 1'
    if (isRecovery(w)) return 'Recovery Week 🔄'
    const pct = (w - 1) / Math.max(totalWeeks - 3, 1)
    if (pct < 0.25) return 'Phase 1: Base Building'
    if (pct < 0.5)  return 'Phase 2: Aerobic Development'
    if (pct < 0.75) return 'Phase 3: Lactate Threshold'
    return 'Phase 4: Race Pace Sharpening'
  }

  // Phase index (for quality session type)
  function phaseIdx(w: number): number {
    if (isRaceWk(w))             return 4
    if (isTaper1(w) || isTaper2(w)) return 3
    if (isRecovery(w))           return -1
    const pct = (w - 1) / Math.max(totalWeeks - 3, 1)
    return pct < 0.25 ? 0 : pct < 0.5 ? 1 : pct < 0.75 ? 2 : 3
  }

  // Build weeks (excludes recovery/taper/race) for long-run progression
  const buildWks = Array.from({ length: totalWeeks }, (_, i) => i + 1)
    .filter(w => !isRecovery(w) && !isTaper1(w) && !isTaper2(w) && !isRaceWk(w))

  function longRunKm(w: number): number {
    if (isRaceWk(w))  return Math.round(ri.peakLong * 0.28)
    if (isTaper1(w))  return Math.round(ri.peakLong * 0.52)
    if (isTaper2(w))  return Math.round(ri.peakLong * 0.65)
    if (isRecovery(w)) return Math.round(longRunKm(w - 1) * 0.75)
    const idx = buildWks.indexOf(w)
    if (idx < 0) return ri.startLong
    const progress = idx / Math.max(buildWks.length - 1, 1)
    return Math.round(ri.startLong + (ri.peakLong - ri.startLong) * Math.min(1, progress))
  }

  function easyKm(w: number): number {
    return Math.max(3, Math.round(longRunKm(w) * (isRecovery(w) ? 0.38 : 0.45)))
  }

  // Quality session — evolves each phase
  function qualitySession(w: number): RunSession {
    const ph = phaseIdx(w)
    const lr = longRunKm(w)
    if (isRaceWk(w)) return {
      name: 'Pre-Race Shakeout', sets: 1,
      reps: `20 min easy (${paceZones.easy}) + 6×100 m strides at race pace (${paceZones.race}) — save your legs for tomorrow`,
      restSecs: 0,
    }
    if (isTaper1(w) || isTaper2(w)) return {
      name: 'Race-Pace Run', sets: 3,
      reps: `1 km at target race pace (${paceZones.race}) with 2 min easy recovery — stay sharp, not tired`,
      restSecs: 120,
    }
    if (isRecovery(w)) return {
      name: 'Easy Run + Strides', sets: 1,
      reps: `${easyKm(w)} km easy (${paceZones.easy}) + 6×20 sec gentle strides — recovery week: keep it truly easy`,
      restSecs: 0,
    }
    if (ph === 0) return { // Base Building — Fartlek
      name: 'Fartlek Run', sets: 1,
      reps: `${Math.max(4, Math.round(lr * 0.55))} km total — 1 km warm-up easy, then 8×1 min surges at ${paceZones.interval} (90 sec easy jog recovery), 1 km cool-down`,
      restSecs: 0,
    }
    if (ph === 1) return { // Aerobic Development — Tempo
      name: 'Continuous Tempo Run', sets: 1,
      reps: `1.5 km easy warm-up + ${Math.max(3, Math.round(lr * 0.5))} km continuous at tempo pace (${paceZones.tempo}) + 1 km cool-down`,
      restSecs: 0,
    }
    if (ph === 2) return { // Lactate Threshold — LT Intervals
      name: 'Lactate Threshold Intervals',
      sets: Math.min(5, 3 + Math.floor((w - totalWeeks * 0.5) / 2)),
      reps: `1.2 km at LT pace (${paceZones.lt}) with 90 sec easy jog recovery between reps — controlled hard effort`,
      restSecs: 90,
    }
    return { // Race Pace Sharpening
      name: 'Race-Pace Intervals', sets: 4,
      reps: `1.6 km at target race pace (${paceZones.race}) with 2 min walk/jog recovery — dial in exactly how race pace feels`,
      restSecs: 120,
    }
  }

  const dayKeys3    = ['Mon', 'Wed', 'Sat']
  const dayKeys4    = ['Mon', 'Tue', 'Thu', 'Sat']
  const dayKeys5p   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const weekData: ProgramWeek[] = Array.from({ length: totalWeeks }, (_, wi) => {
    const w = wi + 1
    const lrKm = longRunKm(w)
    const easyRunKm = easyKm(w)
    const phLabel = phaseName(w)
    const raceWk = isRaceWk(w)

    const longRunSession: RunSession = {
      name: raceWk ? 'Race Day 🏁' : isTaper1(w) ? 'Taper Long Run' : 'Long Run',
      sets: 1,
      reps: raceWk
        ? `RACE DAY — ${ri.label} (${ri.dist}). Target pace: ${paceZones.race}. Trust the training — you're ready!`
        : `${lrKm} km at easy long-run pace (${paceZones.easy}) — stay conversational; if you can't speak a sentence, slow down`,
      restSecs: 0,
    }

    type DayDef = { day: string; sessionLabel: string; s: RunSession }
    let days: DayDef[]

    if (daysPerWeek <= 3) {
      days = [
        { day: dayKeys3[0], sessionLabel: 'Easy Run',        s: { name: 'Easy Run',     sets: 1, reps: `${easyRunKm} km easy (${paceZones.easy}) — RPE 4–5, keep it conversational`, restSecs: 0 } },
        { day: dayKeys3[1], sessionLabel: 'Quality Session', s: qualitySession(w) },
        { day: dayKeys3[2], sessionLabel: 'Long Run',        s: longRunSession },
      ]
    } else if (daysPerWeek === 4) {
      days = [
        { day: dayKeys4[0], sessionLabel: 'Easy Run',        s: { name: 'Easy Run',          sets: 1, reps: `${easyRunKm} km easy (${paceZones.easy})`, restSecs: 0 } },
        { day: dayKeys4[1], sessionLabel: 'Quality Session', s: qualitySession(w) },
        { day: dayKeys4[2], sessionLabel: 'Easy Recovery',   s: { name: 'Easy Recovery Run', sets: 1, reps: `${Math.max(3, easyRunKm - 2)} km very easy (${paceZones.easy}) — flush out Thursday fatigue`, restSecs: 0 } },
        { day: dayKeys4[3], sessionLabel: 'Long Run',        s: longRunSession },
      ]
    } else {
      days = [
        { day: dayKeys5p[0], sessionLabel: 'Easy Run',         s: { name: 'Easy Run',               sets: 1, reps: `${easyRunKm} km easy (${paceZones.easy})`, restSecs: 0 } },
        { day: dayKeys5p[1], sessionLabel: 'Quality Session',  s: qualitySession(w) },
        { day: dayKeys5p[2], sessionLabel: 'Recovery Run',     s: { name: 'Recovery Run',            sets: 1, reps: `${Math.max(3, easyRunKm - 2)} km very easy jog — 30–60 sec/km slower than easy pace`, restSecs: 0 } },
        { day: dayKeys5p[3], sessionLabel: 'Mid-Week Long',    s: { name: 'Midweek Medium-Long Run', sets: 1, reps: `${Math.round(lrKm * 0.68)} km at easy-to-moderate pace (${paceZones.easy})`, restSecs: 0 } },
        { day: dayKeys5p[4], sessionLabel: 'Easy Run',         s: { name: 'Easy Run',               sets: 1, reps: `${Math.max(3, easyRunKm - 1)} km easy — light legs before Saturday`, restSecs: 0 } },
        { day: dayKeys5p[5], sessionLabel: 'Long Run',         s: longRunSession },
        { day: dayKeys5p[6], sessionLabel: 'Rest/Cross-Train', s: { name: 'Rest or Cross-Train',    sets: 1, reps: 'Swimming, cycling, yoga, or complete rest — zero running today, let muscles absorb the week', restSecs: 0 } },
      ]
    }

    return {
      weekNumber: w,
      days: days.slice(0, daysPerWeek).map(({ day, sessionLabel, s }) => ({
        id: crypto.randomUUID(),
        label: `${day} – ${sessionLabel} [${phLabel}]`,
        exercises: [{ id: crypto.randomUUID(), name: s.name, sets: s.sets, reps: s.reps, restSecs: s.restSecs, notes: undefined }],
      })),
    }
  })

  return {
    name: `${totalWeeks}-Week ${ri.label} Training Plan (${level.charAt(0).toUpperCase() + level.slice(1)})`,
    weeks: weekData,
  }
}

// ── Cycling plan builder ──────────────────────────────────────────────────────

function buildCyclingPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks, daysPerWeek } = parsed

  const phase1End = Math.floor(weeks * 0.33)
  const phase2End = Math.floor(weeks * 0.66)

  type CycSession = { name: string; sets: number; reps: string; restSecs: number }

  const session = (w: number): CycSession[][] => {
    const phase = w <= phase1End ? 0 : w <= phase2End ? 1 : 2
    const base: CycSession[][] = [
      [{ name: 'Endurance Ride', sets: 1, reps: `${40 + w * 3} min at 60–70% HR (Zone 2)`, restSecs: 0 }],
      phase < 1
        ? [{ name: 'Tempo Ride', sets: 1, reps: `${20 + w * 2} min at 75–85% HR`, restSecs: 0 }]
        : [{ name: 'Sprint Intervals on Bike', sets: 8, reps: '20 sec all-out / 40 sec easy', restSecs: 0 }],
      [{ name: 'Endurance Ride', sets: 1, reps: `${50 + w * 4} min steady state`, restSecs: 0 }],
      [{ name: 'Hill Repeats on Bike', sets: 6, reps: '3 min hard climb / 3 min recovery descent', restSecs: 0 }],
      [{ name: 'Long Endurance Ride', sets: 1, reps: `${60 + w * 5} min at easy pace`, restSecs: 0 }],
    ]
    return base
  }

  const dayNames = ['Mon', 'Tue', 'Thu', 'Sat', 'Sun', 'Wed', 'Fri']
  const weekData: ProgramWeek[] = Array.from({ length: weeks }, (_, wi) => {
    const weekNumber = wi + 1
    const days = session(weekNumber).slice(0, daysPerWeek).map((sessions, di) => ({
      id: crypto.randomUUID(),
      label: `${dayNames[di]} – ${sessions[0].name}`,
      exercises: sessions.map(s => ({ id: crypto.randomUUID(), ...s, notes: undefined })),
    }))
    return { weekNumber, days }
  })

  return { name: `${weeks}-Week Cycling Training Plan`, weeks: weekData }
}

// ── Swimming plan builder ─────────────────────────────────────────────────────

function buildSwimmingPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks, daysPerWeek } = parsed
  const phase1End = Math.floor(weeks * 0.33)

  const weekData: ProgramWeek[] = Array.from({ length: weeks }, (_, wi) => {
    const weekNumber = wi + 1
    const phase = weekNumber <= phase1End ? 0 : 1
    const dist = 1000 + weekNumber * 100

    const sessionDefs = [
      { name: 'Steady-State Swim', reps: `${dist} m continuous at comfortable pace` },
      { name: 'Drill Session', reps: `${Math.round(dist * 0.8)} m — 50% drills, 50% full stroke` },
      phase === 0
        ? { name: 'Swim Intervals', reps: `${Math.round(dist / 100)} × 100 m with 30 sec rest` }
        : { name: 'Open Water Swim', reps: `${Math.round(dist / 1000 * 0.8)} km open water` },
      { name: 'Steady-State Swim', reps: `${Math.round(dist * 1.2)} m at easy pace` },
      { name: 'Swim Intervals', reps: `${Math.round(dist / 50)} × 50 m fast, 20 sec rest` },
    ]

    const days = sessionDefs.slice(0, daysPerWeek).map((def, di) => ({
      id: crypto.randomUUID(),
      label: `Session ${di + 1} – ${def.name}`,
      exercises: [{ id: crypto.randomUUID(), name: def.name, sets: 1, reps: def.reps, restSecs: 0, notes: undefined }],
    }))
    return { weekNumber, days }
  })

  return { name: `${weeks}-Week Swimming Training Plan`, weeks: weekData }
}

// ── Gym plan builder (unchanged logic) ───────────────────────────────────────

interface DayTemplate { label: string; groups: MuscleKey[]; exerciseCount: number }

function buildDayTemplates(parsed: ParsedPrompt): DayTemplate[] {
  const { daysPerWeek, muscles, goal, splitHint } = parsed
  const exCount = goal === 'fatLoss' ? 6 : 5

  if (splitHint === 'fullBody' || daysPerWeek <= 2) {
    const allGroups: MuscleKey[] = muscles.length > 0
      ? [...muscles, ...(['quads', 'back', 'chest'] as MuscleKey[]).filter(g => !muscles.includes(g))]
      : ['chest', 'back', 'quads', 'hamstrings', 'shoulders', 'core']
    if (daysPerWeek === 1) return [{ label: 'Full Body', groups: allGroups, exerciseCount: exCount + 1 }]
    return [
      { label: 'Full Body A', groups: allGroups, exerciseCount: exCount },
      { label: 'Full Body B', groups: [...allGroups].reverse(), exerciseCount: exCount },
    ].slice(0, daysPerWeek)
  }

  if (splitHint === 'ppl' || (daysPerWeek >= 3 && /\b(push|pull|leg)\b/.test(muscles.join(' ')))) {
    const base: DayTemplate[] = [
      { label: 'Push Day',  groups: ['chest', 'shoulders', 'triceps'],         exerciseCount: exCount },
      { label: 'Pull Day',  groups: ['lats', 'back', 'biceps'],                exerciseCount: exCount },
      { label: 'Leg Day',   groups: ['quads', 'hamstrings', 'glutes', 'core'], exerciseCount: exCount },
    ]
    if (daysPerWeek === 3) return base
    if (daysPerWeek === 4) return [...base, { label: 'Upper Body', groups: ['chest', 'lats', 'shoulders'], exerciseCount: exCount }]
    return [...base, ...base].slice(0, daysPerWeek)
  }

  if (splitHint === 'upperLower' || (daysPerWeek === 4 && muscles.length === 0)) {
    return ([
      { label: 'Upper Body A', groups: ['chest', 'lats', 'shoulders', 'triceps', 'biceps'] as MuscleKey[], exerciseCount: exCount },
      { label: 'Lower Body A', groups: ['quads', 'hamstrings', 'glutes', 'core'] as MuscleKey[],           exerciseCount: exCount },
      { label: 'Upper Body B', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] as MuscleKey[], exerciseCount: exCount },
      { label: 'Lower Body B', groups: ['quads', 'glutes', 'hamstrings', 'legs'] as MuscleKey[],           exerciseCount: exCount },
    ] as DayTemplate[]).slice(0, daysPerWeek)
  }

  if (muscles.length > 0) {
    const complement: Partial<Record<MuscleKey, MuscleKey[]>> = {
      chest: ['triceps', 'shoulders'], lats: ['biceps', 'back'], back: ['biceps', 'lats'],
      shoulders: ['triceps', 'chest'], triceps: ['chest', 'shoulders'], biceps: ['back', 'lats'],
      quads: ['hamstrings', 'core'], hamstrings: ['glutes', 'core'], glutes: ['hamstrings', 'legs'],
      core: ['legs'], legs: ['glutes', 'core'], cardio: ['core'],
    }
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    return Array.from({ length: daysPerWeek }, (_, i) => {
      const primary = muscles[i % muscles.length]
      const extra = (complement[primary] || []).filter(g => !muscles.includes(g)).slice(0, 2) as MuscleKey[]
      return { label: `Day ${letters[i]} – ${toLabel([primary, ...extra].slice(0, 2))}`, groups: [primary, ...extra], exerciseCount: exCount }
    })
  }

  const defaults: DayTemplate[] = [
    { label: 'Day A – Chest & Back',       groups: ['chest', 'back', 'core'],                    exerciseCount: exCount },
    { label: 'Day B – Legs & Shoulders',   groups: ['quads', 'hamstrings', 'shoulders', 'core'], exerciseCount: exCount },
    { label: 'Day C – Arms & Lats',        groups: ['biceps', 'triceps', 'lats', 'core'],        exerciseCount: exCount },
    { label: 'Day D – Upper Body',         groups: ['chest', 'lats', 'shoulders', 'triceps'],    exerciseCount: exCount },
    { label: 'Day E – Lower Body',         groups: ['quads', 'glutes', 'hamstrings', 'core'],    exerciseCount: exCount },
    { label: 'Day F – Pull & Core',        groups: ['back', 'lats', 'biceps', 'core'],           exerciseCount: exCount },
    { label: 'Day G – Active Recovery',    groups: ['core', 'cardio'],                           exerciseCount: 4       },
  ]
  return defaults.slice(0, daysPerWeek)
}

function toLabel(groups: MuscleKey[]): string {
  const names: Record<MuscleKey, string> = {
    chest: 'Chest', lats: 'Lats', back: 'Back', shoulders: 'Shoulders',
    triceps: 'Triceps', biceps: 'Biceps', quads: 'Quads', hamstrings: 'Hamstrings',
    glutes: 'Glutes', core: 'Core', legs: 'Legs', cardio: 'Cardio',
  }
  return groups.map(g => names[g] || g).join(' & ')
}

function buildGymName(parsed: ParsedPrompt): string {
  const goalLabel = { strength: 'Strength', hypertrophy: 'Hypertrophy', fatLoss: 'Fat Loss' }[parsed.goal]
  const muscleLabel = parsed.muscles.length > 0
    ? toLabel(parsed.muscles.slice(0, 2))
    : parsed.splitHint === 'upperLower' ? 'Upper/Lower'
    : parsed.splitHint === 'ppl' ? 'Push/Pull/Legs'
    : parsed.splitHint === 'fullBody' ? 'Full Body'
    : 'General'
  return `${parsed.weeks}-Week ${muscleLabel} ${goalLabel} Program`
}

function getGymPhase(weekNum: number, totalWeeks: number): string {
  const pct = (weekNum - 1) / Math.max(totalWeeks - 1, 1)
  if (pct < 0.25) return 'Phase 1: Foundation'
  if (pct < 0.50) return 'Phase 2: Build'
  if (pct < 0.75) return 'Phase 3: Overload'
  return 'Phase 4: Peak Strength'
}

function isGymDeload(weekNum: number): boolean {
  return weekNum % 4 === 0
}

function gymSets(base: number, weekNum: number, totalWeeks: number): number {
  if (isGymDeload(weekNum)) return Math.max(2, base - 1)
  const pct = (weekNum - 1) / Math.max(totalWeeks - 1, 1)
  if (pct < 0.25) return base
  if (pct < 0.50) return base + 1
  if (pct < 0.75) return base + 2
  return base + 2
}

function gymReps(base: string, weekNum: number, goal: GoalKey): string {
  if (isGymDeload(weekNum)) {
    return `${base.split('–')[0].split('-')[0].trim()} reps @ RPE 6 — deload: 60% of normal load, prioritise form`
  }
  const rpe = Math.min(9, 6 + Math.floor(weekNum / 3))
  const blockNote = weekNum <= 3 ? 'establish baseline load'
    : weekNum <= 6 ? '+2.5 kg vs Block 1'
    : weekNum <= 9 ? '+5 kg vs Block 1'
    : 'peak load — push to RPE 9'

  if (goal === 'strength') {
    const strongReps = weekNum <= 3 ? '5' : weekNum <= 6 ? '4–5' : weekNum <= 9 ? '3–4' : '1–3'
    return `${strongReps} reps @ RPE ${rpe} (${blockNote})`
  }
  if (goal === 'fatLoss') {
    const restNote = weekNum <= 6 ? '45 sec rest' : '30 sec rest'
    return `${base} reps @ RPE ${rpe} (${restNote} between sets — keep heart rate elevated)`
  }
  // Hypertrophy — keep rep range, increase load each block
  if (base.includes('–') || base.includes('-')) {
    const parts = base.replace('–', '-').split('-').map(s => Number(s.trim()))
    const [lo, hi] = parts
    if (weekNum > 9) return `${lo}–${Math.max(lo, hi - 2)} reps @ RPE ${rpe} (${blockNote} — heavier, fewer reps)`
    return `${lo}–${hi} reps @ RPE ${rpe} (${blockNote})`
  }
  return `${base} reps @ RPE ${rpe} (${blockNote})`
}

function gymRest(base: number, weekNum: number, goal: GoalKey): number {
  if (isGymDeload(weekNum)) return Math.max(60, base - 30)
  const pct = (weekNum - 1) / 52
  if (goal === 'strength' && pct > 0.6) return base + 30
  return base
}

function buildGymPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const dayTemplates = buildDayTemplates(parsed)
  const name = buildGymName(parsed)
  const totalWeeks = parsed.weeks

  const weeks: ProgramWeek[] = Array.from({ length: totalWeeks }, (_, wi) => {
    const weekNumber = wi + 1
    const deload = isGymDeload(weekNumber)
    const phase = deload ? `Wk ${weekNumber}: Deload 🔄` : `${getGymPhase(weekNumber, totalWeeks)} — Wk ${weekNumber}`

    return {
      weekNumber,
      days: dayTemplates.map(template => ({
        id: crypto.randomUUID(),
        label: `${template.label} [${phase}]`,
        exercises: pickExercises(template.groups, template.exerciseCount, parsed.goal).map(ex => ({
          id: crypto.randomUUID(),
          name: ex.name,
          sets: gymSets(ex.sets, weekNumber, totalWeeks),
          reps: gymReps(ex.reps, weekNumber, parsed.goal),
          restSecs: gymRest(ex.restSecs, weekNumber, parsed.goal),
          notes: undefined,
        })),
      })),
    }
  })
  return { name, weeks }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateProgram(prompt: string): { name: string; weeks: ProgramWeek[] } {
  const parsed = parsePrompt(prompt)
  switch (parsed.activity) {
    case 'running':  return buildRunningPlan(parsed)
    case 'cycling':  return buildCyclingPlan(parsed)
    case 'swimming': return buildSwimmingPlan(parsed)
    default:         return buildGymPlan(parsed)
  }
}
