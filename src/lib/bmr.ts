export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type GoalType = 'lose_fast' | 'lose' | 'lose_slow' | 'maintain' | 'gain'
export type Gender = 'male' | 'female'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const GOAL_OPTIONS: Array<{ value: GoalType; label: string; delta: number }> = [
  { value: 'lose_fast',  label: 'Lose — Aggressive (−700 kcal/day, ~0.9kg/week)', delta: -700 },
  { value: 'lose',       label: 'Lose — Moderate (−500 kcal/day, ~0.5kg/week)',   delta: -500 },
  { value: 'lose_slow',  label: 'Lose — Mild (−250 kcal/day, ~0.25kg/week)',       delta: -250 },
  { value: 'maintain',   label: 'Maintain Weight (TDEE)',                           delta:    0 },
  { value: 'gain',       label: 'Gain Muscle — Lean Bulk (+300 kcal/day)',          delta: +300 },
]

export function calcBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

export function calcCalorieTarget(tdee: number, goalType: GoalType): number {
  const option = GOAL_OPTIONS.find(o => o.value === goalType)
  return tdee + (option?.delta ?? -500)
}

export function calcMacros(calories: number, weightKg: number): { protein: number; carbs: number; fat: number } {
  const protein = Math.round(weightKg * 2)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  return { protein, carbs, fat: Math.max(fat, 20) }
}

export function calcDynamicCalorieTarget(
  tdee: number,
  currentWeight: number,
  goalWeight: number,
  targetWeeks: number,
): { target: number; weeklyChange: number; capped: boolean } {
  const weeklyWeightChange = (currentWeight - goalWeight) / Math.max(targetWeeks, 1)
  const dailyDelta = (weeklyWeightChange * 7700) / 7
  const raw = Math.round(tdee - dailyDelta)
  const floor = 1300
  const capped = raw < floor
  return { target: capped ? floor : raw, weeklyChange: weeklyWeightChange, capped }
}
