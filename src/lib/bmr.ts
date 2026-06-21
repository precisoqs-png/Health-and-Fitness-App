export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type GoalType = 'lose' | 'maintain' | 'gain'
export type Gender = 'male' | 'female'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calcBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

export function calcCalorieTarget(tdee: number, goalType: GoalType): number {
  if (goalType === 'lose') return tdee - 500
  if (goalType === 'gain') return tdee + 300
  return tdee
}

export function calcMacros(calories: number, weightKg: number): { protein: number; carbs: number; fat: number } {
  const protein = Math.round(weightKg * 2)           // 2g per kg bodyweight
  const fat = Math.round((calories * 0.25) / 9)      // 25% of calories from fat
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  return { protein, carbs, fat: Math.max(fat, 20) }
}
