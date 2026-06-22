import type { ProgramWeek } from '../context/AppContext'

// ── Follow-up question helper ─────────────────────────────────────────────────

export interface FollowUpQuestion { key: string; label: string; placeholder: string }

export function needsFollowUp(prompt: string): FollowUpQuestion[] {
  const p = prompt.toLowerCase().trim()
  const questions: FollowUpQuestion[] = []

  const hasWeeks    = /\d+\s*[-\s]?week/.test(p)
  const hasDays     = /\d+\s*[-\s]?(day|session|time)/.test(p)
  const hasLevel    = /beginner|novice|intermediate|advanced|experienced/.test(p)
  const hasActivity = /run|marathon|cycl|swim|gym|strength|hypertrophy|muscle|fat.loss|push|pull|leg|chest|back|squat|bench/.test(p)

  if (!hasWeeks)    questions.push({ key: 'weeks', label: 'How many weeks?',         placeholder: 'e.g. 8 or 12' })
  if (!hasDays)     questions.push({ key: 'days',  label: 'How many days per week?', placeholder: 'e.g. 3' })
  if (!hasLevel)    questions.push({ key: 'level', label: 'Fitness level?',          placeholder: 'beginner / intermediate / advanced' })
  if (!hasActivity && questions.length < 3)
    questions.push({ key: 'goal', label: 'What is your main goal?', placeholder: 'e.g. build muscle, lose fat, improve cardio' })

  return questions.slice(0, 3)
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalKey     = 'strength' | 'hypertrophy' | 'fatLoss'
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
  activity:    ActivityType
  weeks:       number
  daysPerWeek: number
  muscles:     MuscleKey[]
  goal:        GoalKey
  level:       'beginner' | 'intermediate' | 'advanced'
  splitHint:   'ppl' | 'upperLower' | 'fullBody' | 'bodyPart' | 'auto'
  runTarget:   'half_marathon' | 'marathon' | '10k' | '5k' | 'general'
}

const MUSCLE_KEYWORDS: Array<[RegExp, MuscleKey]> = [
  [/\b(chest|pec|pecs|bench)\b/,            'chest'],
  [/\b(lat|lats|latissimus)\b/,             'lats'],
  [/\b(back|row|pull)\b/,                   'back'],
  [/\b(shoulder|delt|delts|overhead)\b/,    'shoulders'],
  [/\b(tricep|tris)\b/,                     'triceps'],
  [/\b(bicep|bis|curl)\b/,                  'biceps'],
  [/\b(quad|quads)\b/,                      'quads'],
  [/\b(hamstring|ham|hams)\b/,              'hamstrings'],
  [/\b(glute|glutes|butt|hip)\b/,           'glutes'],
  [/\b(core|abs|ab|abdominal)\b/,           'core'],
  [/\b(leg|legs|lower body)\b/,             'legs'],
  [/\b(cardio|cycling|aerobic)\b/,          'cardio'],
]

export function parsePrompt(prompt: string): ParsedPrompt {
  const p = prompt.toLowerCase()

  let activity: ActivityType = 'gym'
  if (/\b(run|running|marathon|half[\s-]?marathon|5k|10k|couch\s+to\s+5k|c25k|jog|jogging)\b/.test(p)) activity = 'running'
  else if (/\b(cycl|cycling|bike|biking|bicycle|spin|spinning|velodrome)\b/.test(p)) activity = 'cycling'
  else if (/\b(swim|swimming|pool|freestyle|open\s+water)\b/.test(p)) activity = 'swimming'
  else if (/\b(fat\s+loss|weight\s+loss|tone|toning|shred|cut|cutting)\b/.test(p)) activity = 'hybrid'

  let runTarget: ParsedPrompt['runTarget'] = 'general'
  if (/\b(half[\s-]?marathon|21\.?1?\s*k|half)\b/.test(p))              runTarget = 'half_marathon'
  else if (/\bfull\s+marathon\b|\b42\s*k\b|\bmarathon\b/.test(p))       runTarget = 'marathon'
  else if (/\b10\s*k(m|ilometers?)?\b/.test(p))                          runTarget = '10k'
  else if (/\b5\s*k(m|ilometers?)?\b|\bcouch\s+to\s+5k\b|\bc25k\b/.test(p)) runTarget = '5k'

  const weeksMatch  = p.match(/(\d+)\s*[-\s]?week/)
  const weeks       = weeksMatch ? Math.min(Math.max(parseInt(weeksMatch[1]), 1), 52) : 8

  const daysMatch   = p.match(/(\d+)\s*[-\s]?(day|session|time)/)
  const daysPerWeek = daysMatch ? Math.min(Math.max(parseInt(daysMatch[1]), 1), 7) : 3

  const muscles: MuscleKey[] = []
  for (const [re, key] of MUSCLE_KEYWORDS) {
    if (re.test(p) && !muscles.includes(key)) muscles.push(key)
  }

  let goal: GoalKey = 'hypertrophy'
  if (/\b(strength|strong|power|powerlifting|heavy)\b/.test(p)) goal = 'strength'
  else if (/\b(fat\s+loss|cut|cutting|lean|weight\s+loss|tone|toning|shred)\b/.test(p)) goal = 'fatLoss'

  let level: ParsedPrompt['level'] = 'intermediate'
  if (/\b(beginner|novice|new|starter|starting)\b/.test(p)) level = 'beginner'
  else if (/\b(advanced|elite|experienced)\b/.test(p)) level = 'advanced'

  let splitHint: ParsedPrompt['splitHint'] = 'auto'
  if (/\b(push[\s/-]pull[\s/-]leg|ppl)\b/.test(p))  splitHint = 'ppl'
  else if (/\b(upper[\s/-]lower)\b/.test(p))          splitHint = 'upperLower'
  else if (/\b(full[\s/-]?body|total\s+body)\b/.test(p)) splitHint = 'fullBody'
  else if (muscles.length > 0)                         splitHint = 'bodyPart'

  return { activity, weeks, daysPerWeek, muscles, goal, level, splitHint, runTarget }
}

// ── Running plan builder (Daniels VDOT + Seiler polarized + Pfitzinger) ───────

interface RunSession { name: string; sets: number; reps: string; restSecs: number }

function buildRunningPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks: totalWeeks, daysPerWeek, runTarget, level } = parsed

  // Jack Daniels VDOT pace zones — differentiated by level
  const paceZones = {
    easy:     level === 'beginner' ? '6:00–6:30/km' : level === 'advanced' ? '4:50–5:10/km' : '5:20–5:50/km',
    marathon: level === 'beginner' ? '5:50–6:10/km' : level === 'advanced' ? '4:35–4:50/km' : '5:05–5:20/km',
    tempo:    level === 'beginner' ? '5:20–5:40/km' : level === 'advanced' ? '4:10–4:25/km' : '4:45–5:00/km',
    lt:       level === 'beginner' ? '5:10–5:30/km' : level === 'advanced' ? '4:05–4:15/km' : '4:35–4:50/km',
    interval: level === 'beginner' ? '4:50–5:10/km' : level === 'advanced' ? '3:45–4:00/km' : '4:15–4:35/km',
    rep:      level === 'beginner' ? '4:35–4:55/km' : level === 'advanced' ? '3:30–3:45/km' : '4:00–4:20/km',
    race:     level === 'beginner' ? '5:45–6:05/km' : level === 'advanced' ? '4:20–4:40/km' : '5:00–5:20/km',
  }

  const raceInfo: Record<string, { startLong: number; peakLong: number; label: string; dist: string }> = {
    half_marathon: { startLong: 8,  peakLong: 20, label: 'Half Marathon', dist: '21.1 km' },
    marathon:      { startLong: 14, peakLong: 34, label: 'Marathon',      dist: '42.2 km' },
    '10k':         { startLong: 5,  peakLong: 13, label: '10K',           dist: '10 km'   },
    '5k':          { startLong: 3,  peakLong: 9,  label: '5K',            dist: '5 km'    },
    general:       { startLong: 6,  peakLong: 18, label: 'Running',       dist: 'goal'    },
  }
  const ri = raceInfo[runTarget] ?? raceInfo.general

  const isRecovery = (w: number) => w % 4 === 0 && w < totalWeeks
  const isTaper1   = (w: number) => totalWeeks >= 8  && w === totalWeeks - 1
  const isTaper2   = (w: number) => totalWeeks >= 10 && w === totalWeeks - 2
  const isRaceWk   = (w: number) => w === totalWeeks

  // Named mesocycles (Pfitzinger-style)
  function mesocycle(w: number): string {
    if (isRaceWk(w))   return 'Race Week'
    if (isTaper1(w))   return 'Taper — Wk 2'
    if (isTaper2(w))   return 'Taper — Wk 1'
    if (isRecovery(w)) return 'Recovery / Consolidation'
    const pct = (w - 1) / Math.max(totalWeeks - 3, 1)
    if (pct < 0.25) return 'Mesocycle 1: Base Building'
    if (pct < 0.50) return 'Mesocycle 2: Aerobic Development'
    if (pct < 0.75) return 'Mesocycle 3: Lactate Threshold'
    return 'Mesocycle 4: Race Pace Sharpening'
  }

  function phaseIdx(w: number): number {
    if (isRaceWk(w))              return 4
    if (isTaper1(w) || isTaper2(w)) return 3
    if (isRecovery(w))            return -1
    const pct = (w - 1) / Math.max(totalWeeks - 3, 1)
    return pct < 0.25 ? 0 : pct < 0.50 ? 1 : pct < 0.75 ? 2 : 3
  }

  const buildWks = Array.from({ length: totalWeeks }, (_, i) => i + 1)
    .filter(w => !isRecovery(w) && !isTaper1(w) && !isTaper2(w) && !isRaceWk(w))

  function longRunKm(w: number): number {
    if (isRaceWk(w))   return Math.round(ri.peakLong * 0.28)
    if (isTaper1(w))   return Math.round(ri.peakLong * 0.52)
    if (isTaper2(w))   return Math.round(ri.peakLong * 0.65)
    if (isRecovery(w)) return Math.round(longRunKm(w - 1) * 0.75)
    const idx = buildWks.indexOf(w)
    if (idx < 0) return ri.startLong
    const progress = idx / Math.max(buildWks.length - 1, 1)
    return Math.round(ri.startLong + (ri.peakLong - ri.startLong) * Math.min(1, progress))
  }

  function easyKm(w: number): number {
    const base = Math.max(3, Math.round(longRunKm(w) * (isRecovery(w) ? 0.38 : 0.45)))
    // 10% weekly mileage rule — scale slightly with week number in build weeks
    return base
  }

  // Seiler 80/20 polarized model — quality sessions are the 20%
  // Each phase uses specific interval progressions that scale week-over-week
  function qualitySession(w: number): RunSession {
    const ph  = phaseIdx(w)
    const lr  = longRunKm(w)

    if (isRaceWk(w)) return {
      name: 'Pre-Race Shakeout',
      sets: 1,
      reps: `20 min easy (${paceZones.easy}) + 6×100 m strides at race pace (${paceZones.race}) / full walk recovery — conserve energy for race day`,
      restSecs: 0,
    }

    if (isTaper2(w)) return {
      name: 'Taper Tune-Up — Race-Pace Reps',
      sets: 3,
      reps: `1600 m at target race pace (${paceZones.race}) / 2 min easy jog — stay sharp, stay fresh`,
      restSecs: 120,
    }

    if (isTaper1(w)) return {
      name: 'Taper Sharpener — Short Race-Pace Reps',
      sets: 4,
      reps: `800 m at race pace (${paceZones.race}) / 90 sec easy jog — legs should feel light and quick`,
      restSecs: 90,
    }

    if (isRecovery(w)) return {
      name: 'Easy Run + Gentle Strides',
      sets: 1,
      reps: `${easyKm(w)} km easy (${paceZones.easy}) + 4×20 sec gentle strides / full walk recovery — recovery week: if in doubt, go slower`,
      restSecs: 0,
    }

    // Phase 1 — Base Building: R-pace repetitions (Daniels R-zone builds neuromuscular economy)
    if (ph === 0) {
      // Scale reps 6 → 8 → 10 → etc. across build weeks in this phase
      const ph0Wks = buildWks.filter(bw => phaseIdx(bw) === 0)
      const idx    = ph0Wks.indexOf(w)
      const reps   = 6 + idx * 2          // 6, 8, 10, 12 ...
      const dist   = 200                   // metres
      return {
        name: 'Base Repetitions (R-Pace)',
        sets: Math.min(reps, 12),
        reps: `${dist} m at rep pace (${paceZones.rep}) / full recovery jog ${dist} m — economy work, not fitness fatigue`,
        restSecs: 120,
      }
    }

    // Phase 2 — Aerobic Development: Tempo intervals → cruise intervals (Daniels T-pace)
    if (ph === 1) {
      const ph1Wks = buildWks.filter(bw => phaseIdx(bw) === 1)
      const idx    = ph1Wks.indexOf(w)
      // Progress: 3×1600 m → 4×1600 m → 2×3000 m → 5×1600 m
      const progressions = [
        { sets: 3, dist: '1600 m', label: '3×1600 m at tempo' },
        { sets: 4, dist: '1600 m', label: '4×1600 m at tempo' },
        { sets: 2, dist: '3000 m', label: '2×3000 m cruise intervals' },
        { sets: 5, dist: '1600 m', label: '5×1600 m at tempo' },
      ]
      const prog = progressions[Math.min(idx, progressions.length - 1)]
      return {
        name: 'Cruise Intervals (T-Pace)',
        sets: prog.sets,
        reps: `${prog.dist} at tempo/T-pace (${paceZones.tempo}) / 60 sec standing rest — [${prog.label}] — 1.5 km easy warm-up and cool-down`,
        restSecs: 60,
      }
    }

    // Phase 3 — Lactate Threshold: LT intervals (Daniels approach with 90 sec recovery)
    if (ph === 2) {
      const ph2Wks = buildWks.filter(bw => phaseIdx(bw) === 2)
      const idx    = ph2Wks.indexOf(w)
      const progressions = [
        { sets: 4, dist: '1200 m', label: '4×1200 m LT intervals' },
        { sets: 5, dist: '1200 m', label: '5×1200 m LT intervals' },
        { sets: 3, dist: '2000 m', label: '3×2000 m LT cruise' },
        { sets: 4, dist: '2000 m', label: '4×2000 m LT cruise' },
      ]
      const prog = progressions[Math.min(idx, progressions.length - 1)]
      return {
        name: 'LT Intervals (Lactate Threshold Pace)',
        sets: prog.sets,
        reps: `${prog.dist} at LT pace (${paceZones.lt}) / 90 sec easy jog recovery — [${prog.label}] — comfortably hard effort`,
        restSecs: 90,
      }
    }

    // Phase 4 — Race Pace Sharpening: I-pace (VO2max) + race-specific
    const ph3Wks = buildWks.filter(bw => phaseIdx(bw) === 3)
    const idx    = ph3Wks.indexOf(w)
    const progressions = [
      { sets: 3, dist: '1600 m', label: '3×1600 m race pace' },
      { sets: 4, dist: '1600 m', label: '4×1600 m race pace' },
      { sets: 2, dist: '3200 m', label: '2×3200 m race pace' },
      { sets: 5, dist: '1600 m', label: '5×1600 m race pace' },
    ]
    const prog = progressions[Math.min(idx, progressions.length - 1)]
    const easyKmVal = Math.max(4, Math.round(lr * 0.45))
    return {
      name: 'Race-Pace Intervals',
      sets: prog.sets,
      reps: `${prog.dist} at target race pace (${paceZones.race}) / 2 min easy jog — [${prog.label}] — dial in exactly how race effort feels at ${easyKmVal} km total run volume`,
      restSecs: 120,
    }
  }

  const dayKeys3  = ['Mon', 'Wed', 'Sat']
  const dayKeys4  = ['Mon', 'Tue', 'Thu', 'Sat']
  const dayKeys5p = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const weekData: ProgramWeek[] = Array.from({ length: totalWeeks }, (_, wi) => {
    const w          = wi + 1
    const lrKm       = longRunKm(w)
    const easyRunKm  = easyKm(w)
    const phLabel    = mesocycle(w)
    const raceWk     = isRaceWk(w)
    const taperWk    = isTaper1(w) || isTaper2(w)

    // Approximate weekly volume note (polarized 80/20: easy = 80% of distance)
    const estWeeklyKm = Math.round(lrKm + easyRunKm * (daysPerWeek - 2) + lrKm * 0.25)

    const longRunSession: RunSession = {
      name:     raceWk ? 'Race Day' : taperWk ? 'Taper Long Run' : 'Long Run',
      sets:     1,
      reps:     raceWk
        ? `RACE DAY — ${ri.label} (${ri.dist}). Target pace: ${paceZones.race}. Trust the training!`
        : `${lrKm} km at easy long-run pace (${paceZones.easy}) — stay conversational; nasal breathing preferred. Approx week total: ~${estWeeklyKm} km`,
      restSecs: 0,
    }

    type DayDef = { day: string; sessionLabel: string; s: RunSession }
    let days: DayDef[]

    if (daysPerWeek <= 3) {
      days = [
        { day: dayKeys3[0], sessionLabel: 'Easy Run',        s: { name: 'Easy Run',     sets: 1, reps: `${easyRunKm} km easy (${paceZones.easy}) — RPE 4-5, conversational pace [Seiler Z1-Z2]`, restSecs: 0 } },
        { day: dayKeys3[1], sessionLabel: 'Quality Session', s: qualitySession(w) },
        { day: dayKeys3[2], sessionLabel: 'Long Run',        s: longRunSession },
      ]
    } else if (daysPerWeek === 4) {
      days = [
        { day: dayKeys4[0], sessionLabel: 'Easy Run',        s: { name: 'Easy Run',          sets: 1, reps: `${easyRunKm} km easy (${paceZones.easy}) — RPE 4-5`, restSecs: 0 } },
        { day: dayKeys4[1], sessionLabel: 'Quality Session', s: qualitySession(w) },
        { day: dayKeys4[2], sessionLabel: 'Easy Recovery',   s: { name: 'Easy Recovery Run', sets: 1, reps: `${Math.max(3, easyRunKm - 2)} km very easy (${paceZones.easy}) — flush Thursday fatigue`, restSecs: 0 } },
        { day: dayKeys4[3], sessionLabel: 'Long Run',        s: longRunSession },
      ]
    } else {
      const midLong = Math.round(lrKm * 0.65)
      days = [
        { day: dayKeys5p[0], sessionLabel: 'Easy Run',         s: { name: 'Easy Run',               sets: 1, reps: `${easyRunKm} km easy (${paceZones.easy}) — RPE 4-5`, restSecs: 0 } },
        { day: dayKeys5p[1], sessionLabel: 'Quality Session',  s: qualitySession(w) },
        { day: dayKeys5p[2], sessionLabel: 'Recovery Run',     s: { name: 'Recovery Run',            sets: 1, reps: `${Math.max(3, easyRunKm - 2)} km very easy jog — 30-60 sec/km slower than easy pace`, restSecs: 0 } },
        { day: dayKeys5p[3], sessionLabel: 'Mid-Week Long',    s: { name: 'Midweek Medium-Long Run', sets: 1, reps: `${midLong} km easy-to-moderate (${paceZones.easy}) — Pfitzinger medium-long run for aerobic stimulus`, restSecs: 0 } },
        { day: dayKeys5p[4], sessionLabel: 'Easy Run',         s: { name: 'Easy Run',               sets: 1, reps: `${Math.max(3, easyRunKm - 1)} km easy — light legs before Saturday`, restSecs: 0 } },
        { day: dayKeys5p[5], sessionLabel: 'Long Run',         s: longRunSession },
        { day: dayKeys5p[6], sessionLabel: 'Rest/Cross-Train', s: { name: 'Rest or Cross-Train',    sets: 1, reps: 'Swimming, cycling, yoga, or complete rest — zero running, let aerobic adaptations consolidate', restSecs: 0 } },
      ]
    }

    return {
      weekNumber: w,
      days: days.slice(0, daysPerWeek).map(({ day, sessionLabel, s }) => ({
        id:       crypto.randomUUID(),
        label:    `${day} – ${sessionLabel} [${phLabel}]`,
        exercises: [{ id: crypto.randomUUID(), name: s.name, sets: s.sets, reps: s.reps, restSecs: s.restSecs, notes: undefined }],
      })),
    }
  })

  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1)
  return {
    name:  `${totalWeeks}-Week ${ri.label} Training Plan (${levelLabel}) — Daniels VDOT / Polarized`,
    weeks: weekData,
  }
}

// ── Cycling plan builder (Coggan power zones + Friel + Seiler polarized) ──────

function buildCyclingPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks: totalWeeks, daysPerWeek, level } = parsed

  // Phase boundaries
  const phase1End = Math.floor(totalWeeks * 0.33)
  const phase2End = Math.floor(totalWeeks * 0.66)

  function cycPhaseName(w: number): string {
    const isDeload = w % 4 === 0 && w < totalWeeks
    if (isDeload) return 'Recovery Week'
    if (w <= phase1End) return 'Phase 1: Aerobic Base (Zone 2)'
    if (w <= phase2End) return 'Phase 2: Sweet Spot Build'
    return 'Phase 3: VO2max / Race Sharpening'
  }

  // Base ride duration scales each week (not static) — Friel progressive overload
  function baseDuration(w: number): number {
    const isDeload = w % 4 === 0 && w < totalWeeks
    if (isDeload) return Math.round(baseDuration(w - 1) * 0.6)
    const base = level === 'beginner' ? 50 : level === 'advanced' ? 80 : 65
    return Math.min(base + w * 4, level === 'beginner' ? 120 : 180)
  }

  // Seiler polarized: ~80% easy volume, ~20% quality
  type CycSession = { name: string; sets: number; reps: string; restSecs: number }

  function zone2Session(w: number): CycSession {
    const dur = baseDuration(w)
    return {
      name:     'Zone 2 Aerobic Base Ride',
      sets:     1,
      reps:     `${dur} min @ Zone 2 (56-75% FTP) — conversational effort, nasal breathing if possible. Week ${w} volume: aim for ${dur} uninterrupted minutes. Cadence 85-95 rpm.`,
      restSecs: 0,
    }
  }

  function qualityCycSession(w: number): CycSession {
    const isDeload = w % 4 === 0 && w < totalWeeks
    if (isDeload) return {
      name:     'Recovery Spin',
      sets:     1,
      reps:     `45 min @ Zone 1 (< 56% FTP) — active recovery only, no effort above easy. Spin out the legs.`,
      restSecs: 0,
    }

    if (w <= phase1End) {
      // Base phase: progressive Zone 2 + short sweet spot introduction
      const ssIntervals = Math.min(2 + Math.floor(w / 2), 4)
      return {
        name:     'Sweet Spot Introduction',
        sets:     ssIntervals,
        reps:     `6 min @ sweet spot (88-93% FTP) / 4 min Zone 1 recovery — [Week ${w}: ${ssIntervals} reps, building to 4×8 by phase end]`,
        restSecs: 240,
      }
    }

    if (w <= phase2End) {
      // Sweet spot build — intervals grow from 4×8 min to 3×15 min
      const ph2Idx = w - phase1End - 1
      const progressions = [
        { sets: 4, dur: 8,  label: '4×8 min sweet spot' },
        { sets: 4, dur: 10, label: '4×10 min sweet spot' },
        { sets: 3, dur: 12, label: '3×12 min sweet spot' },
        { sets: 3, dur: 15, label: '3×15 min sweet spot' },
        { sets: 2, dur: 20, label: '2×20 min sweet spot — classic Coggan block' },
      ]
      const prog = progressions[Math.min(ph2Idx, progressions.length - 1)]
      return {
        name:     'Sweet Spot Intervals',
        sets:     prog.sets,
        reps:     `${prog.dur} min @ sweet spot (88-93% FTP) / 4 min Zone 1 recovery — [${prog.label}]. 10 min Zone 2 warm-up + cool-down.`,
        restSecs: 240,
      }
    }

    // Phase 3: VO2max blocks (Coggan Zone 5-6, 106-120% FTP)
    const ph3Idx = w - phase2End - 1
    const progressions = [
      { sets: 4, dur: 4, label: '4×4 min VO2max' },
      { sets: 5, dur: 4, label: '5×4 min VO2max' },
      { sets: 4, dur: 5, label: '4×5 min VO2max' },
      { sets: 5, dur: 5, label: '5×5 min VO2max' },
      { sets: 6, dur: 4, label: '6×4 min VO2max — peak block' },
    ]
    const prog = progressions[Math.min(ph3Idx, progressions.length - 1)]
    return {
      name:     'VO2max Intervals',
      sets:     prog.sets,
      reps:     `${prog.dur} min @ 106-120% FTP (Zone 5) / 4 min easy recovery — [${prog.label}]. Hard but sustainable, RPE 8-9. 15 min Zone 2 warm-up required.`,
      restSecs: 240,
    }
  }

  function hillSession(w: number): CycSession {
    const reps = Math.min(4 + Math.floor(w / 3), 8)
    return {
      name:     'Hill / Strength Intervals',
      sets:     reps,
      reps:     `3 min hard climb @ Zone 4 (91-105% FTP) / 3 min easy descent recovery — [Week ${w}: ${reps} reps]. Cadence 60-70 rpm on climbs (force development).`,
      restSecs: 180,
    }
  }

  function longRide(w: number): CycSession {
    const dur  = baseDuration(w) + 30
    const isDeload = w % 4 === 0 && w < totalWeeks
    return {
      name:     isDeload ? 'Easy Long Ride' : 'Endurance Long Ride',
      sets:     1,
      reps:     isDeload
        ? `${Math.round(dur * 0.65)} min @ Zone 1-2 (< 76% FTP) — recovery long ride, no efforts above easy`
        : `${dur} min @ Zone 2 (56-75% FTP) with 2×10 min @ Zone 3 (76-90% FTP) mid-ride — Friel progressive long ride, Week ${w}`,
      restSecs: 0,
    }
  }

  const dayNames = ['Mon', 'Tue', 'Thu', 'Sat', 'Sun', 'Wed', 'Fri']

  const weekData: ProgramWeek[] = Array.from({ length: totalWeeks }, (_, wi) => {
    const w         = wi + 1
    const phLabel   = cycPhaseName(w)

    const sessionDefs: CycSession[] = [
      zone2Session(w),
      qualityCycSession(w),
      zone2Session(w),
      hillSession(w),
      longRide(w),
      qualityCycSession(w),
      zone2Session(w),
    ]

    const days = sessionDefs.slice(0, daysPerWeek).map((s, di) => ({
      id:       crypto.randomUUID(),
      label:    `${dayNames[di]} – ${s.name} [${phLabel}]`,
      exercises: [{ id: crypto.randomUUID(), name: s.name, sets: s.sets, reps: s.reps, restSecs: s.restSecs, notes: undefined }],
    }))

    return { weekNumber: w, days }
  })

  return { name: `${totalWeeks}-Week Cycling Training Plan — Coggan Power Zones / Polarized`, weeks: weekData }
}

// ── Swimming plan builder (CSS + USA Swimming drills) ────────────────────────

function buildSwimmingPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const { weeks: totalWeeks, daysPerWeek, level } = parsed

  const phase1End = Math.floor(totalWeeks * 0.33)
  const phase2End = Math.floor(totalWeeks * 0.66)

  // CSS (Critical Swim Speed) based targets — phrased as offset from CSS threshold
  const cssDesc = level === 'beginner'
    ? 'CSS + 15 sec/100m (comfortable aerobic)'
    : level === 'advanced'
    ? 'CSS + 5 sec/100m (near-threshold)'
    : 'CSS + 10 sec/100m (aerobic threshold)'

  const cssHard = level === 'beginner' ? 'CSS + 5 sec/100m' : level === 'advanced' ? 'CSS pace (max aerobic)' : 'CSS + 5 sec/100m'

  function swimPhase(w: number): string {
    const isDeload = w % 4 === 0 && w < totalWeeks
    if (isDeload) return 'Recovery Week'
    if (w <= phase1End) return 'Phase 1: Aerobic Base + Technique'
    if (w <= phase2End) return 'Phase 2: CSS Threshold Build'
    return 'Phase 3: Race-Pace Sharpening'
  }

  // Base volume scales — 10% weekly rule applied to total metres
  function baseVolume(w: number): number {
    const isDeload = w % 4 === 0 && w < totalWeeks
    const start    = level === 'beginner' ? 1200 : level === 'advanced' ? 2500 : 1800
    if (isDeload) return Math.round(baseVolume(w - 1) * 0.6)
    return Math.min(start + w * 150, level === 'advanced' ? 5000 : 3500)
  }

  type SwimSession = { name: string; sets: number; reps: string; restSecs: number }

  function techniqueSession(w: number): SwimSession {
    const vol = baseVolume(w)
    // Drills evolve across weeks: catch-up → finger-drag → bilateral → DPS focus
    const drills = [
      `${Math.round(vol * 0.4)} m as 25 m catch-up drill / 25 m full freestyle — focus: early vertical forearm`,
      `${Math.round(vol * 0.4)} m as 25 m finger-drag drill / 25 m full freestyle — focus: high elbow recovery`,
      `${Math.round(vol * 0.4)} m as 25 m bilateral breathing (breathe every 3 strokes) / 25 m normal — balance focus`,
      `${Math.round(vol * 0.4)} m as 25 m distance-per-stroke count / 25 m full stroke — reduce strokes per length by 1-2`,
    ]
    const drillIdx = Math.min(Math.floor((w - 1) / Math.max(Math.ceil(totalWeeks / 4), 1)), drills.length - 1)
    return {
      name:     'Stroke Efficiency Drill Set',
      sets:     1,
      reps:     drills[drillIdx] + ` + ${Math.round(vol * 0.3)} m easy cool-down`,
      restSecs: 20,
    }
  }

  function aerobicIntervals(w: number): SwimSession {
    const vol  = baseVolume(w)
    const reps = Math.round(vol / 100)

    if (w <= phase1End) {
      // Phase 1: shorter intervals at CSS + offset
      const ph1Idx = w - 1
      const progressions = [
        `8×100 m @ ${cssDesc} / 15 sec rest — controlled effort, count strokes`,
        `10×100 m @ ${cssDesc} / 15 sec rest — focus on even split each rep`,
        `6×150 m @ ${cssDesc} / 20 sec rest — extend aerobic intervals`,
        `12×100 m @ ${cssDesc} / 15 sec rest — volume peak for phase 1`,
      ]
      return {
        name:     'CSS Aerobic Intervals',
        sets:     Math.min(reps, 12),
        reps:     progressions[Math.min(ph1Idx, progressions.length - 1)],
        restSecs: 15,
      }
    }

    if (w <= phase2End) {
      // Phase 2: longer CSS sets + negative splits
      const ph2Idx = w - phase1End - 1
      const progressions = [
        `3×400 m negative split (2nd 200 m faster than 1st) @ ${cssDesc} / 45 sec — pacing discipline`,
        `4×300 m @ ${cssDesc} / 30 sec rest — sustained threshold work`,
        `2×600 m @ ${cssDesc} / 60 sec rest — aerobic endurance block`,
        `5×200 m @ ${cssHard} / 20 sec rest — intensity uptick`,
        `3×500 m @ ${cssDesc} / 45 sec rest — volume peak for phase 2`,
      ]
      return {
        name:     'CSS Threshold Set',
        sets:     1,
        reps:     progressions[Math.min(ph2Idx, progressions.length - 1)],
        restSecs: 45,
      }
    }

    // Phase 3: race-pace sets + speed work
    const ph3Idx = w - phase2End - 1
    const progressions = [
      `10×100 m @ ${cssHard} / 10 sec rest — near-CSS race sharpener`,
      `8×100 m @ CSS pace (maximal aerobic speed) / 15 sec rest`,
      `5×200 m @ CSS pace / 20 sec rest — race-pace specificity`,
      `4×100 m @ CSS - 5 sec/100m (above CSS speed) / 30 sec — anaerobic capacity touch`,
    ]
    return {
      name:     'Race-Pace Set',
      sets:     1,
      reps:     progressions[Math.min(ph3Idx, progressions.length - 1)],
      restSecs: 20,
    }
  }

  function steadySet(w: number): SwimSession {
    const vol      = baseVolume(w)
    const isDeload = w % 4 === 0 && w < totalWeeks
    return {
      name:     isDeload ? 'Easy Swim' : 'Steady Aerobic Swim',
      sets:     1,
      reps:     isDeload
        ? `${Math.round(vol * 0.7)} m continuous easy — recovery focus, no effort above aerobic`
        : `${vol} m continuous @ easy pace (CSS + 20 sec/100m) — Week ${w} steady state. Bilateral breathing throughout.`,
      restSecs: 0,
    }
  }

  function kickAndPullSet(w: number): SwimSession {
    const vol = baseVolume(w)
    const reps = Math.min(4 + Math.floor(w / 3), 8)
    return {
      name:     'Kick + Pull Strength Set',
      sets:     reps,
      reps:     `${Math.round(vol * 0.05)} m kick-only (kickboard) / 15 sec + ${Math.round(vol * 0.05)} m pull-only (buoy) / 15 sec — [Week ${w}: ${reps} rounds] — isolate leg power and catch strength`,
      restSecs: 15,
    }
  }

  const dayNames = ['Mon', 'Wed', 'Fri', 'Tue', 'Thu', 'Sat', 'Sun']

  const weekData: ProgramWeek[] = Array.from({ length: totalWeeks }, (_, wi) => {
    const w       = wi + 1
    const phLabel = swimPhase(w)

    const sessionDefs: SwimSession[] = [
      techniqueSession(w),
      aerobicIntervals(w),
      steadySet(w),
      kickAndPullSet(w),
      aerobicIntervals(w),
      steadySet(w),
      techniqueSession(w),
    ]

    const days = sessionDefs.slice(0, daysPerWeek).map((s, di) => ({
      id:       crypto.randomUUID(),
      label:    `${dayNames[di]} – ${s.name} [${phLabel}]`,
      exercises: [{ id: crypto.randomUUID(), name: s.name, sets: s.sets, reps: s.reps, restSecs: s.restSecs, notes: undefined }],
    }))

    return { weekNumber: w, days }
  })

  return { name: `${totalWeeks}-Week Swimming Training Plan — CSS Threshold / USA Swimming Drills`, weeks: weekData }
}

// ── Gym plan builder (NSCA linear periodization + Schoenfeld + DUP) ───────────

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
      { label: 'Push Day (Chest / Shoulders / Triceps)', groups: ['chest', 'shoulders', 'triceps'],         exerciseCount: exCount },
      { label: 'Pull Day (Lats / Back / Biceps)',        groups: ['lats', 'back', 'biceps'],                exerciseCount: exCount },
      { label: 'Leg Day (Quads / Hamstrings / Glutes)',  groups: ['quads', 'hamstrings', 'glutes', 'core'], exerciseCount: exCount },
    ]
    if (daysPerWeek === 3) return base
    if (daysPerWeek === 4) return [...base, { label: 'Upper Body Volume', groups: ['chest', 'lats', 'shoulders'], exerciseCount: exCount }]
    return [...base, ...base].slice(0, daysPerWeek)
  }

  if (splitHint === 'upperLower' || (daysPerWeek === 4 && muscles.length === 0)) {
    return ([
      { label: 'Upper Body A — Strength Focus',    groups: ['chest', 'lats', 'shoulders', 'triceps', 'biceps'] as MuscleKey[], exerciseCount: exCount },
      { label: 'Lower Body A — Strength Focus',    groups: ['quads', 'hamstrings', 'glutes', 'core'] as MuscleKey[],           exerciseCount: exCount },
      { label: 'Upper Body B — Hypertrophy Focus', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] as MuscleKey[], exerciseCount: exCount },
      { label: 'Lower Body B — Hypertrophy Focus', groups: ['quads', 'glutes', 'hamstrings', 'legs'] as MuscleKey[],           exerciseCount: exCount },
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
      const extra   = (complement[primary] || []).filter(g => !muscles.includes(g)).slice(0, 2) as MuscleKey[]
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
  const goalLabel   = { strength: 'Strength', hypertrophy: 'Hypertrophy', fatLoss: 'Fat Loss' }[parsed.goal]
  const muscleLabel = parsed.muscles.length > 0
    ? toLabel(parsed.muscles.slice(0, 2))
    : parsed.splitHint === 'upperLower' ? 'Upper/Lower'
    : parsed.splitHint === 'ppl'        ? 'Push/Pull/Legs'
    : parsed.splitHint === 'fullBody'   ? 'Full Body'
    : 'General'
  return `${parsed.weeks}-Week ${muscleLabel} ${goalLabel} Program — NSCA Periodization`
}

// NSCA linear periodization block system (Schoenfeld + Prilepin)
// Block 1 (wks 1-3):  Hypertrophy Foundation — 3×10-12 @ RPE 7
// Block 2 (wks 4-6):  Strength-Hypertrophy  — 4×6-8  @ RPE 8
// Block 3 (wks 7-9):  Strength               — 5×4-5  @ RPE 8-9
// Block 4 (wks 10+):  Peak/Intensification   — 5×2-3  @ RPE 9
// Deload every 4th week: 50% volume, RPE 5-6

function gymBlock(weekNum: number): number {
  if (weekNum <= 3)  return 1
  if (weekNum <= 6)  return 2
  if (weekNum <= 9)  return 3
  return 4
}

function isGymDeload(weekNum: number): boolean {
  return weekNum % 4 === 0
}

function getGymPhase(weekNum: number, _totalWeeks: number): string {
  if (isGymDeload(weekNum)) return `Wk ${weekNum}: Deload (50% volume, RPE 5-6)`
  const block = gymBlock(weekNum)
  const blockLabels: Record<number, string> = {
    1: 'Block 1: Hypertrophy Foundation',
    2: 'Block 2: Strength-Hypertrophy',
    3: 'Block 3: Strength',
    4: 'Block 4: Intensification / Peak',
  }
  return `${blockLabels[block] ?? 'Block 4: Peak'} — Wk ${weekNum}`
}

// DUP: Day A = strength focus, Day B = hypertrophy focus, Day C = power/endurance
// Applied when >= 3 days/week
function dupFocus(dayIndex: number, daysPerWeek: number): string {
  if (daysPerWeek < 3) return ''
  const focuses = ['Strength Focus (heavy, lower reps)', 'Hypertrophy Focus (moderate load, higher volume)', 'Power / Endurance Focus (explosive or metabolic)']
  return focuses[dayIndex % focuses.length]
}

// Compound lifts (listed first per NSCA compound-first ordering)
const COMPOUND_LIFTS = new Set(['Bench Press', 'Barbell Row', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-Up', 'Romanian Deadlift', 'Hip Thrust', 'Front Squat'])

function gymRepsAndSets(weekNum: number, dayIndex: number, daysPerWeek: number, goal: GoalKey, isCompound: boolean): { sets: number; reps: string; restSecs: number } {
  if (isGymDeload(weekNum)) {
    return {
      sets:     2,
      reps:     `10 reps @ RPE 5-6 — DELOAD: 50% of last week's load, technique focus only`,
      restSecs: 60,
    }
  }

  const block = gymBlock(weekNum)

  // DUP modifier shifts the scheme slightly per day
  const dupIdx = daysPerWeek >= 3 ? dayIndex % 3 : 0

  if (goal === 'strength') {
    // Pure strength — lower reps, heavier loads, longer rest
    const schemes: Record<number, { sets: number; reps: string; restSecs: number }> = {
      1: { sets: 3, reps: `5 reps @ RPE 7 — Week ${weekNum}: establish your baseline load for this movement`,     restSecs: 180 },
      2: { sets: 4, reps: `4-5 reps @ RPE 8 — add 2.5 kg vs Block 1`,                                             restSecs: 210 },
      3: { sets: 5, reps: `3-4 reps @ RPE 8-9 — add 5 kg vs Block 1, push limit on final set`,                    restSecs: 240 },
      4: { sets: 5, reps: `2-3 reps @ RPE 9 — peak intensification: maximal load, crisp technique, long rest`,    restSecs: 300 },
    }
    const base = schemes[block]
    if (dupIdx === 2) {
      return { ...base, sets: base.sets - 1, reps: base.reps.replace(/^(\d)-?(\d)? reps/, '6-8 reps'), restSecs: 90 }
    }
    return base
  }

  if (goal === 'fatLoss') {
    // Higher rep, shorter rest, metabolic stimulus
    const schemes: Record<number, { sets: number; reps: string; restSecs: number }> = {
      1: { sets: 3, reps: `12-15 reps @ RPE 7 — Week ${weekNum}: 45 sec rest (keeps HR elevated, metabolic focus)`,  restSecs: 45 },
      2: { sets: 3, reps: `10-12 reps @ RPE 8 — add 2.5 kg vs Block 1, 30 sec rest (circuit intensity)`,              restSecs: 30 },
      3: { sets: 4, reps: `8-10 reps @ RPE 8 — strength-endurance hybrid, 45 sec rest`,                               restSecs: 45 },
      4: { sets: 4, reps: `6-8 reps @ RPE 8-9 — heavier load, metabolic demand still high`,                           restSecs: 60 },
    }
    return schemes[block]
  }

  // Hypertrophy — Schoenfeld progressive overload, 3-5 min rest for compounds
  // DUP: Day A = heavier/lower reps, Day B = moderate, Day C = lighter/higher reps + pump
  const hypertrophyByBlock: Record<number, { sets: number; reps: string; restSecs: number }[]> = {
    1: [
      { sets: 3, reps: `12 reps @ RPE 7 — Week ${weekNum}: establish your baseline load for this movement`,     restSecs: isCompound ? 120 : 90 },
      { sets: 3, reps: `10 reps @ RPE 8 — add 2.5 kg vs Week 1, Schoenfeld 6-20 rep range for hypertrophy`,    restSecs: isCompound ? 120 : 90 },
      { sets: 4, reps: `8 reps @ RPE 8 — add 2.5 kg vs Week 2, volume increase via extra set`,                  restSecs: isCompound ? 150 : 90 },
    ],
    2: [
      { sets: 4, reps: `8 reps @ RPE 8 — Block 2 reset: use Block 1's week 3 weight`,                           restSecs: isCompound ? 150 : 90 },
      { sets: 4, reps: `6-7 reps @ RPE 8-9 — add 2.5 kg, strength-hypertrophy overlap (Prilepin zone)`,         restSecs: isCompound ? 150 : 90 },
      { sets: 4, reps: `6 reps @ RPE 9 — add 2.5 kg, max effort compound sets`,                                  restSecs: isCompound ? 180 : 120 },
    ],
    3: [
      { sets: 5, reps: `5 reps @ RPE 8 — Block 3: neural adaptations, add 5 kg vs Block 2 peak`,                restSecs: isCompound ? 210 : 120 },
      { sets: 5, reps: `4-5 reps @ RPE 8-9 — add 2.5 kg, crisp bar speed on every rep`,                         restSecs: isCompound ? 210 : 120 },
      { sets: 5, reps: `4 reps @ RPE 9 — add 2.5 kg, do not miss reps — stop a set early if form breaks`,       restSecs: isCompound ? 240 : 150 },
    ],
    4: [
      { sets: 5, reps: `3 reps @ RPE 9 — Block 4 Peak: maximal load, full recovery between sets`,                restSecs: isCompound ? 270 : 150 },
      { sets: 5, reps: `2-3 reps @ RPE 9 — add 2.5-5 kg if block 3 was solid`,                                  restSecs: isCompound ? 270 : 150 },
      { sets: 5, reps: `2 reps @ RPE 9-10 — peak intensification, no grinding — if in doubt, bail`,              restSecs: isCompound ? 300 : 180 },
    ],
  }

  const blockSchemes = hypertrophyByBlock[block] ?? hypertrophyByBlock[4]
  // Within a 3-week block, pick the week-within-block (0, 1, 2)
  const weekInBlock = (weekNum - 1) % 3
  const base = blockSchemes[Math.min(weekInBlock, blockSchemes.length - 1)]

  // DUP adjustment: Day C gets lighter, higher reps for pump / endurance
  if (dupIdx === 2) {
    return {
      sets:     base.sets - 1,
      reps:     `15 reps @ RPE 7 — DUP Day C: hypertrophy pump / endurance focus (lighter load, higher volume density)`,
      restSecs: 60,
    }
  }

  return base
}

function buildGymPlan(parsed: ParsedPrompt): { name: string; weeks: ProgramWeek[] } {
  const dayTemplates = buildDayTemplates(parsed)
  const name         = buildGymName(parsed)
  const totalWeeks   = parsed.weeks

  const weeks: ProgramWeek[] = Array.from({ length: totalWeeks }, (_, wi) => {
    const weekNumber = wi + 1
    const phase      = getGymPhase(weekNumber, totalWeeks)

    return {
      weekNumber,
      days: dayTemplates.map((template, dayIdx) => {
        // Get exercises — sort compounds first (NSCA compound-first ordering)
        const rawExercises = pickExercises(template.groups, template.exerciseCount, parsed.goal)
        const sortedExercises = [
          ...rawExercises.filter(ex => COMPOUND_LIFTS.has(ex.name)),
          ...rawExercises.filter(ex => !COMPOUND_LIFTS.has(ex.name)),
        ]

        const dupNote = parsed.daysPerWeek >= 3 ? ` — ${dupFocus(dayIdx, parsed.daysPerWeek)}` : ''

        return {
          id:    crypto.randomUUID(),
          label: `${template.label} [${phase}${dupNote}]`,
          exercises: sortedExercises.map((ex, exIdx) => {
            const isCompound = COMPOUND_LIFTS.has(ex.name)
            const { sets, reps, restSecs } = gymRepsAndSets(weekNumber, dayIdx, parsed.daysPerWeek, parsed.goal, isCompound)
            const compoundNote = exIdx === 0 ? 'PRIMARY COMPOUND — do this first, when fresh' : isCompound ? 'compound movement' : 'accessory'
            return {
              id:       crypto.randomUUID(),
              name:     ex.name,
              sets,
              reps,
              restSecs,
              notes:    compoundNote,
            }
          }),
        }
      }),
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
