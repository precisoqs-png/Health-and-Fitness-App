import type { ProgramWeek } from '../context/AppContext'

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

function kmStr(km: number) { return `~${Math.round(km)} km` }

function buildRunningPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks, daysPerWeek, runTarget } = parsed

  // Starting long run distance and peak by target
  const targets: Record<string, { start: number; peak: number; raceLabel: string }> = {
    half_marathon: { start: 7,  peak: 20, raceLabel: 'Half Marathon' },
    marathon:      { start: 10, peak: 32, raceLabel: 'Marathon'      },
    '10k':         { start: 5,  peak: 12, raceLabel: '10K'           },
    '5k':          { start: 3,  peak: 8,  raceLabel: '5K'            },
    general:       { start: 5,  peak: 16, raceLabel: 'Running'       },
  }
  const t = targets[runTarget]

  // Phase boundaries
  const phase1End = Math.floor(weeks * 0.33)
  const phase2End = Math.floor(weeks * 0.66)
  const taperStart = weeks - 1 // last week = taper

  // Long run progression across non-taper weeks
  const peakWeek = taperStart - 1
  const longRunByWeek = (w: number): number => {
    if (w >= taperStart) return Math.round(t.peak * 0.5)
    const progress = (w - 1) / Math.max(peakWeek - 1, 1)
    return Math.round(t.start + (t.peak - t.start) * progress)
  }

  // Tempo distance ~55% of long run, min 3km
  const tempoByWeek = (w: number) => Math.max(3, Math.round(longRunByWeek(w) * 0.55))
  // Easy run ~40% of long run
  const easyByWeek = (w: number) => Math.max(3, Math.round(longRunByWeek(w) * 0.40))

  const dayLayouts: Array<(w: number, phase: number) => RunSession[]> = []

  // Build day session functions based on daysPerWeek
  if (daysPerWeek <= 3) {
    dayLayouts.push(
      (w) => [{ name: 'Easy Run', sets: 1, reps: `${kmStr(easyByWeek(w))} at easy conversational pace (60–70% HR)`, restSecs: 0 }],
      (w, ph) => ph < 2
        ? [{ name: 'Tempo Run', sets: 1, reps: `${kmStr(tempoByWeek(w))} at comfortably hard pace (75–85% HR)`, restSecs: 0 }]
        : [{ name: 'Interval Training', sets: 6, reps: '400 m at 90–95% effort', restSecs: 90 }],
      (w) => [{ name: 'Long Run', sets: 1, reps: `${kmStr(longRunByWeek(w))} at easy pace (60–70% HR)`, restSecs: 0 }],
    )
  } else if (daysPerWeek === 4) {
    dayLayouts.push(
      (w)     => [{ name: 'Easy Run', sets: 1, reps: `${kmStr(easyByWeek(w))} at easy pace (60–70% HR)`, restSecs: 0 }],
      (w, ph) => ph < 2
        ? [{ name: 'Tempo Run', sets: 1, reps: `${kmStr(tempoByWeek(w))} at comfortably hard pace (75–85% HR)`, restSecs: 0 }]
        : [{ name: 'Interval Training', sets: 6, reps: '400 m at 90–95% effort', restSecs: 90 }],
      (w)     => [{ name: 'Easy Run', sets: 1, reps: `${kmStr(easyByWeek(w))} at easy pace`, restSecs: 0 }],
      (w)     => [{ name: 'Long Run', sets: 1, reps: `${kmStr(longRunByWeek(w))} at easy pace (60–70% HR)`, restSecs: 0 }],
    )
  } else {
    // 5+ days
    dayLayouts.push(
      (w)     => [{ name: 'Easy Run', sets: 1, reps: `${kmStr(easyByWeek(w))} easy`, restSecs: 0 }],
      (w, ph) => ph < 1
        ? [{ name: 'Tempo Run', sets: 1, reps: `${kmStr(tempoByWeek(w))} tempo`, restSecs: 0 }]
        : [{ name: 'Interval Training', sets: 6, reps: '400 m at 90–95% effort', restSecs: 90 }],
      (_w)    => [{ name: 'Recovery Run', sets: 1, reps: '20–30 min very easy jog', restSecs: 0 }],
      (w)     => [{ name: 'Tempo Run', sets: 1, reps: `${kmStr(tempoByWeek(w))} tempo (75–85% HR)`, restSecs: 0 }],
      (w)     => [{ name: 'Long Run', sets: 1, reps: `${kmStr(longRunByWeek(w))} at easy pace`, restSecs: 0 }],
      (w)     => [{ name: 'Easy Run', sets: 1, reps: `${kmStr(easyByWeek(w))} easy`, restSecs: 0 }],
      ()      => [{ name: 'Rest / Cross-Train', sets: 1, reps: 'Active recovery — walk, stretch, swim', restSecs: 0 }],
    )
  }

  const dayLabels = ['Mon', 'Wed', 'Fri', 'Sat', 'Sun', 'Tue', 'Thu']
  const sessionLabels = ['Easy Run', 'Quality Session', 'Long Run', 'Easy Run', 'Quality Session', 'Long Run', 'Recovery']

  const weekData: ProgramWeek[] = Array.from({ length: weeks }, (_, wi) => {
    const weekNumber = wi + 1
    const phase = weekNumber <= phase1End ? 0 : weekNumber <= phase2End ? 1 : weekNumber < taperStart ? 2 : 3

    const days = Array.from({ length: daysPerWeek }, (__, di) => {
      const sessions = (dayLayouts[di] || dayLayouts[0])(weekNumber, phase)
      const phaseLabel = phase === 0 ? 'Base' : phase === 1 ? 'Build' : phase === 2 ? 'Peak' : 'Taper'
      const sesLabel = sessionLabels[di] || `Session ${di + 1}`
      return {
        id: crypto.randomUUID(),
        label: `${dayLabels[di]} – ${sesLabel} (Wk${weekNumber} ${phaseLabel})`,
        exercises: sessions.map(s => ({ id: crypto.randomUUID(), ...s, notes: undefined })),
      }
    })
    return { weekNumber, days }
  })

  const name = `${weeks}-Week ${t.raceLabel} Training Plan`
  return { name, weeks: weekData }
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

function applyOverload(sets: number, weekNum: number, totalWeeks: number): number {
  const third = Math.floor(totalWeeks / 3)
  if (weekNum > third * 2) return sets + 2
  if (weekNum > third) return sets + 1
  return sets
}

function buildGymPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const dayTemplates = buildDayTemplates(parsed)
  const name = buildGymName(parsed)
  const weeks: ProgramWeek[] = Array.from({ length: parsed.weeks }, (_, wi) => {
    const weekNumber = wi + 1
    return {
      weekNumber,
      days: dayTemplates.map(template => ({
        id: crypto.randomUUID(),
        label: template.label,
        exercises: pickExercises(template.groups, template.exerciseCount, parsed.goal).map(ex => ({
          id: crypto.randomUUID(), name: ex.name,
          sets: applyOverload(ex.sets, weekNumber, parsed.weeks),
          reps: ex.reps, restSecs: ex.restSecs, notes: undefined,
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
