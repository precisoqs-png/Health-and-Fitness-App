import type { ProgramWeek } from '../context/AppContext'

// ── Exercise library ──────────────────────────────────────────────────────────

interface ExDef { name: string; sets: number; reps: string; restSecs: number }

type GoalKey = 'strength' | 'hypertrophy' | 'fatLoss'

// Per-goal defaults applied when building exercises
const GOAL_PARAMS: Record<GoalKey, { sets: number; reps: string; rest: number }> = {
  strength:    { sets: 5, reps: '3-5',   rest: 180 },
  hypertrophy: { sets: 4, reps: '8-12',  rest: 90  },
  fatLoss:     { sets: 3, reps: '15-20', rest: 45  },
}

type MuscleKey = 'chest' | 'lats' | 'back' | 'shoulders' | 'triceps' | 'biceps' | 'quads' | 'hamstrings' | 'glutes' | 'core' | 'legs' | 'cardio'

// Raw exercise names per muscle group (goal params applied at generation time)
const LIBRARY: Record<MuscleKey, string[]> = {
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

function pickExercises(groups: MuscleKey[], count: number, goal: GoalKey): ExDef[] {
  const p = GOAL_PARAMS[goal]
  const pool: string[] = []
  for (const g of groups) {
    const arr = LIBRARY[g] || []
    for (const ex of arr) if (!pool.includes(ex)) pool.push(ex)
  }
  return pool.slice(0, count).map(name => ({ name, sets: p.sets, reps: p.reps, restSecs: p.rest }))
}

// ── Prompt parser ─────────────────────────────────────────────────────────────

interface ParsedPrompt {
  weeks: number
  daysPerWeek: number
  muscles: MuscleKey[]
  goal: GoalKey
  level: 'beginner' | 'intermediate' | 'advanced'
  splitHint: 'ppl' | 'upperLower' | 'fullBody' | 'bodyPart' | 'auto'
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
  [/\b(cardio|running|cycling|aerobic)\b/, 'cardio'],
]

export function parsePrompt(prompt: string): ParsedPrompt {
  const p = prompt.toLowerCase()

  // Weeks
  const weeksMatch = p.match(/(\d+)\s*[-\s]?week/)
  const weeks = weeksMatch ? Math.min(Math.max(parseInt(weeksMatch[1]), 1), 52) : 8

  // Days per week
  const daysMatch = p.match(/(\d+)\s*[-\s]?(day|session|time)/)
  const daysPerWeek = daysMatch ? Math.min(Math.max(parseInt(daysMatch[1]), 1), 7) : 3

  // Muscles
  const muscles: MuscleKey[] = []
  for (const [re, key] of MUSCLE_KEYWORDS) {
    if (re.test(p) && !muscles.includes(key)) muscles.push(key)
  }

  // Goal
  let goal: GoalKey = 'hypertrophy'
  if (/\b(strength|strong|power|powerlifting|heavy)\b/.test(p)) goal = 'strength'
  else if (/\b(fat loss|cut|cutting|lean|weight loss|cardio|tone|toning|shred)\b/.test(p)) goal = 'fatLoss'

  // Level
  let level: ParsedPrompt['level'] = 'intermediate'
  if (/\b(beginner|novice|new|starter|starting)\b/.test(p)) level = 'beginner'
  else if (/\b(advanced|elite|experienced)\b/.test(p)) level = 'advanced'

  // Split hint
  let splitHint: ParsedPrompt['splitHint'] = 'auto'
  if (/\b(push[\s/-]pull[\s/-]leg|ppl)\b/.test(p)) splitHint = 'ppl'
  else if (/\b(upper[\s/-]lower)\b/.test(p)) splitHint = 'upperLower'
  else if (/\b(full[\s/-]?body|full body|total body)\b/.test(p)) splitHint = 'fullBody'
  else if (muscles.length > 0) splitHint = 'bodyPart'

  return { weeks, daysPerWeek, muscles, goal, level, splitHint }
}

// ── Day templates ─────────────────────────────────────────────────────────────

interface DayTemplate { label: string; groups: MuscleKey[]; exerciseCount: number }

function buildDayTemplates(parsed: ParsedPrompt): DayTemplate[] {
  const { daysPerWeek, muscles, goal, splitHint } = parsed

  // Helper: exercise count per day depends on goal
  const exCount = goal === 'fatLoss' ? 6 : goal === 'strength' ? 5 : 5

  // ── Full body
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

  // ── Push / Pull / Legs
  if (splitHint === 'ppl' || (daysPerWeek >= 3 && /\b(push|pull|leg)\b/.test(muscles.join(' ')))) {
    const base: DayTemplate[] = [
      { label: 'Push Day',       groups: ['chest', 'shoulders', 'triceps'],              exerciseCount: exCount },
      { label: 'Pull Day',       groups: ['lats', 'back', 'biceps'],                     exerciseCount: exCount },
      { label: 'Leg Day',        groups: ['quads', 'hamstrings', 'glutes', 'core'],      exerciseCount: exCount },
    ]
    if (daysPerWeek === 3) return base
    if (daysPerWeek === 4) return [...base, { label: 'Upper Body', groups: ['chest', 'lats', 'shoulders'], exerciseCount: exCount }]
    if (daysPerWeek === 5) return [...base, ...base.slice(0, 2)]
    return [...base, ...base].slice(0, daysPerWeek)
  }

  // ── Upper / Lower
  if (splitHint === 'upperLower' || (daysPerWeek === 4 && muscles.length === 0)) {
    const upper: DayTemplate = { label: 'Upper Body A', groups: ['chest', 'lats', 'shoulders', 'triceps', 'biceps'], exerciseCount: exCount }
    const lower: DayTemplate = { label: 'Lower Body A', groups: ['quads', 'hamstrings', 'glutes', 'core'],            exerciseCount: exCount }
    const upper2: DayTemplate = { label: 'Upper Body B', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], exerciseCount: exCount }
    const lower2: DayTemplate = { label: 'Lower Body B', groups: ['quads', 'hamstrings', 'glutes', 'legs'],           exerciseCount: exCount }
    const seq = [upper, lower, upper2, lower2]
    return seq.slice(0, daysPerWeek)
  }

  // ── Specific muscle groups requested
  if (muscles.length > 0) {
    // Map each day to a subset of requested muscles (+ complements)
    const complement: Partial<Record<MuscleKey, MuscleKey[]>> = {
      chest:      ['triceps', 'shoulders'],
      lats:       ['biceps', 'back'],
      back:       ['biceps', 'lats'],
      shoulders:  ['triceps', 'chest'],
      triceps:    ['chest', 'shoulders'],
      biceps:     ['back', 'lats'],
      quads:      ['hamstrings', 'core'],
      hamstrings: ['glutes', 'core'],
      glutes:     ['hamstrings', 'legs'],
      core:       ['legs'],
      legs:       ['glutes', 'core'],
      cardio:     ['core'],
    }

    const days: DayTemplate[] = []
    const dayLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

    // Cycle through requested muscles for each day
    for (let i = 0; i < daysPerWeek; i++) {
      const primary = muscles[i % muscles.length]
      const extra = (complement[primary] || []).filter(g => !muscles.includes(g)).slice(0, 2) as MuscleKey[]
      const label = `Day ${dayLetters[i]} – ${toLabel([primary, ...extra].slice(0, 2))}`
      days.push({ label, groups: [primary, ...extra], exerciseCount: exCount })
    }
    return days
  }

  // ── Default: 3-day full body with A/B/C variation
  const defaults: DayTemplate[] = [
    { label: 'Day A – Chest & Back',         groups: ['chest', 'back', 'core'],                      exerciseCount: exCount },
    { label: 'Day B – Legs & Shoulders',     groups: ['quads', 'hamstrings', 'shoulders', 'core'],   exerciseCount: exCount },
    { label: 'Day C – Arms & Lats',          groups: ['biceps', 'triceps', 'lats', 'core'],          exerciseCount: exCount },
    { label: 'Day D – Upper Body',           groups: ['chest', 'lats', 'shoulders', 'triceps'],      exerciseCount: exCount },
    { label: 'Day E – Lower Body',           groups: ['quads', 'glutes', 'hamstrings', 'core'],      exerciseCount: exCount },
    { label: 'Day F – Pull & Core',          groups: ['back', 'lats', 'biceps', 'core'],             exerciseCount: exCount },
    { label: 'Day G – Active Recovery',      groups: ['core', 'cardio'],                             exerciseCount: 4 },
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

// ── Name builder ──────────────────────────────────────────────────────────────

function buildName(parsed: ParsedPrompt): string {
  const goalLabel = { strength: 'Strength', hypertrophy: 'Hypertrophy', fatLoss: 'Fat Loss' }[parsed.goal]
  const muscleLabel = parsed.muscles.length > 0
    ? toLabel(parsed.muscles.slice(0, 2))
    : (['ppl', 'auto'].includes(parsed.splitHint) && parsed.daysPerWeek >= 5)
      ? 'Full Body'
      : parsed.splitHint === 'upperLower' ? 'Upper/Lower'
      : parsed.splitHint === 'ppl' ? 'Push/Pull/Legs'
      : parsed.splitHint === 'fullBody' ? 'Full Body'
      : 'General'
  return `${parsed.weeks}-Week ${muscleLabel} ${goalLabel} Program`
}

// ── Progressive overload helper ───────────────────────────────────────────────

function applyOverload(sets: number, weekNum: number, totalWeeks: number): number {
  const third = Math.floor(totalWeeks / 3)
  if (weekNum > third * 2) return Math.min(sets + 2, sets + 2)
  if (weekNum > third) return Math.min(sets + 1, sets + 1)
  return sets
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateProgram(prompt: string): { name: string; weeks: ProgramWeek[] } {
  const parsed = parsePrompt(prompt)
  const dayTemplates = buildDayTemplates(parsed)
  const name = buildName(parsed)

  const weeks: ProgramWeek[] = Array.from({ length: parsed.weeks }, (_, wi) => {
    const weekNumber = wi + 1
    const days = dayTemplates.map(template => ({
      id: crypto.randomUUID(),
      label: template.label,
      exercises: pickExercises(template.groups, template.exerciseCount, parsed.goal).map(ex => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: applyOverload(ex.sets, weekNumber, parsed.weeks),
        reps: ex.reps,
        restSecs: ex.restSecs,
        notes: undefined,
      })),
    }))
    return { weekNumber, days }
  })

  return { name, weeks }
}
