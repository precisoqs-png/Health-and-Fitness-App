import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface Workout {
  id: string
  type: string
  icon: string
  date: string // ISO date string
  duration: number // minutes
  calories: number
}

export interface Meal {
  id: string
  name: string
  time: string
  items: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Goal {
  label: string
  progress: number
  total: number
  unit: string
  icon: string
  color: string
}

export interface Profile {
  name: string
  dailyCalorieGoal: number
  dailyStepGoal: number
  waterGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

interface AppState {
  profile: Profile
  workouts: Workout[]
  meals: Meal[]
  goals: Goal[]
  addWorkout: (w: Omit<Workout, 'id' | 'date'>) => void
  addMeal: (m: Omit<Meal, 'id'>) => void
  updateGoalProgress: (label: string, progress: number) => void
  updateProfile: (p: Partial<Profile>) => void
}

const defaultProfile: Profile = {
  name: 'Athlete',
  dailyCalorieGoal: 2200,
  dailyStepGoal: 10000,
  waterGoal: 2.5,
  proteinGoal: 160,
  carbsGoal: 220,
  fatGoal: 65,
}

const defaultGoals: Goal[] = [
  { label: 'Lose 5kg', progress: 3.2, total: 5, unit: 'kg', icon: '⚖️', color: '#f97316' },
  { label: 'Run 100km this month', progress: 68, total: 100, unit: 'km', icon: '🏃', color: '#22c55e' },
  { label: 'Workout 20 days', progress: 14, total: 20, unit: 'days', icon: '💪', color: '#a855f7' },
  { label: 'Hit protein goal 30 days', progress: 22, total: 30, unit: 'days', icon: '🥩', color: '#ef4444' },
]

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [goals, setGoals] = useState<Goal[]>(defaultGoals)

  function addWorkout(w: Omit<Workout, 'id' | 'date'>) {
    setWorkouts(prev => [
      { ...w, id: crypto.randomUUID(), date: new Date().toISOString() },
      ...prev,
    ])
  }

  function addMeal(m: Omit<Meal, 'id'>) {
    setMeals(prev => [...prev, { ...m, id: crypto.randomUUID() }])
  }

  function updateGoalProgress(label: string, progress: number) {
    setGoals(prev => prev.map(g => g.label === label ? { ...g, progress } : g))
  }

  function updateProfile(p: Partial<Profile>) {
    setProfile(prev => ({ ...prev, ...p }))
  }

  return (
    <AppContext.Provider value={{ profile, workouts, meals, goals, addWorkout, addMeal, updateGoalProgress, updateProfile }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
