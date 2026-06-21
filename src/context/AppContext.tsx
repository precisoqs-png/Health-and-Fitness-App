import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { FoodItem } from '../data/foods'
export type { FoodItem }

export interface Workout {
  id: string
  type: string
  icon: string
  date: string
  duration: number
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
  date: string
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
  // Body stats for BMR calculator
  height: number       // cm
  age: number
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goalType: 'lose_fast' | 'lose' | 'lose_slow' | 'maintain' | 'gain'
  goalWeight: number   // kg
  currentWeight: number // kg
  targetWeeks: number  // weeks to reach goal weight
}

export interface DailyLog {
  date: string
  steps: number
  water: number
}

export interface WeightEntry {
  id: string
  date: string
  weight: number
}

export interface ProgramExercise {
  id: string
  name: string
  sets: number
  reps: string      // e.g. "8-10"
  restSecs: number
  notes?: string
}

export interface ProgramDay {
  id: string
  label: string
  exercises: ProgramExercise[]
}

export interface ProgramWeek {
  weekNumber: number
  days: ProgramDay[]
}

export interface TrainingProgram {
  id: string
  name: string
  weeks: ProgramWeek[]
  createdAt: string
}

export interface DiarySet {
  exerciseId: string
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg: number
  notes?: string
}

export interface DiaryEntry {
  id: string
  programId: string
  weekNumber: number
  dayId: string
  dayLabel: string
  date: string
  sets: DiarySet[]
}

interface AppState {
  profile: Profile
  workouts: Workout[]
  meals: Meal[]
  goals: Goal[]
  dailyLog: DailyLog
  weightLog: WeightEntry[]
  isNewUser: boolean
  customFoods: FoodItem[]
  programs: TrainingProgram[]
  diary: DiaryEntry[]
  activeProgramId: string | null
  addWorkout: (w: Omit<Workout, 'id'>) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  addMeal: (m: Omit<Meal, 'id'>) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  updateMeal: (id: string, m: Omit<Meal, 'id'>) => Promise<void>
  updateGoalProgress: (label: string, progress: number) => Promise<void>
  addGoal: (g: Goal) => Promise<void>
  deleteGoal: (label: string) => Promise<void>
  updateProfile: (p: Partial<Profile>) => Promise<void>
  addWater: (amount: number) => void
  setSteps: (steps: number) => void
  addWeight: (weight: number) => void
  addCustomFood: (f: Omit<FoodItem, 'id' | 'isCustom'>) => void
  deleteCustomFood: (id: string) => void
  copyMealsForDay: (fromDate: string, toDate: string) => void
  addProgram: (p: Omit<TrainingProgram, 'id' | 'createdAt'>) => void
  updateProgram: (id: string, p: TrainingProgram) => void
  deleteProgram: (id: string) => void
  setActiveProgram: (id: string | null) => void
  logDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void
  deleteDiaryEntry: (id: string) => void
}

const defaultProfile: Profile = {
  name: 'Athlete',
  dailyCalorieGoal: 2200,
  dailyStepGoal: 10000,
  waterGoal: 2.5,
  proteinGoal: 160,
  carbsGoal: 220,
  fatGoal: 65,
  height: 175,
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
  goalType: 'lose',
  goalWeight: 80,
  currentWeight: 80,
  targetWeeks: 12,
}

const defaultGoals: Goal[] = [
  { label: 'Lose 5kg', progress: 3.2, total: 5, unit: 'kg', icon: '⚖️', color: 'var(--accent)' },
  { label: 'Run 100km this month', progress: 68, total: 100, unit: 'km', icon: '🏃', color: '#22c55e' },
  { label: 'Workout 20 days', progress: 14, total: 20, unit: 'days', icon: '💪', color: '#a855f7' },
  { label: 'Hit protein goal 30 days', progress: 22, total: 30, unit: 'days', icon: '🥩', color: '#ef4444' },
]

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export function calcStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0
  const days = new Set(workouts.map(w => w.date.slice(0, 10)))
  const sorted = Array.from(days).sort().reverse()
  const today = todayISO()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yISO = yesterday.toISOString().slice(0, 10)
  if (sorted[0] !== today && sorted[0] !== yISO) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    prev.setDate(prev.getDate() - 1)
    if (prev.toISOString().slice(0, 10) === sorted[i]) streak++
    else break
  }
  return streak
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile>(() => load('vf_profile', defaultProfile))
  const [workouts, setWorkouts] = useState<Workout[]>(() => load('vf_workouts', []))
  const [meals, setMeals] = useState<Meal[]>(() => load('vf_meals', []))
  const [goals, setGoals] = useState<Goal[]>(() => load('vf_goals', defaultGoals))
  const [weightLog, setWeightLog] = useState<WeightEntry[]>(() => load('vf_weights', []))
  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() => load('vf_custom_foods', []))
  const [programs, setPrograms] = useState<TrainingProgram[]>(() => load('vf_programs', []))
  const [diary, setDiary] = useState<DiaryEntry[]>(() => load('vf_diary', []))
  const [activeProgramId, setActiveProgramId] = useState<string | null>(() => load('vf_active_program', null))
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => {
    const saved = load<DailyLog>('vf_daily', { date: todayISO(), steps: 0, water: 0 })
    return saved.date === todayISO() ? saved : { date: todayISO(), steps: 0, water: 0 }
  })

  // Detect new users: default name and no real data
  const isNewUser = profile.name === 'Athlete' && workouts.length === 0 && meals.length === 0

  useEffect(() => { save('vf_profile', profile) }, [profile])
  useEffect(() => { save('vf_workouts', workouts) }, [workouts])
  useEffect(() => { save('vf_meals', meals) }, [meals])
  useEffect(() => { save('vf_goals', goals) }, [goals])
  useEffect(() => { save('vf_daily', dailyLog) }, [dailyLog])
  useEffect(() => { save('vf_weights', weightLog) }, [weightLog])
  useEffect(() => { save('vf_custom_foods', customFoods) }, [customFoods])
  useEffect(() => { save('vf_programs', programs) }, [programs])
  useEffect(() => { save('vf_diary', diary) }, [diary])
  useEffect(() => { save('vf_active_program', activeProgramId) }, [activeProgramId])

  const loadFromSupabase = useCallback(async (uid: string) => {
    const [{ data: wData }, { data: mData }, { data: gData }, { data: pData }] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('meals').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', uid),
      supabase.from('profiles').select('*').eq('user_id', uid).single(),
    ])
    if (wData) setWorkouts(wData)
    if (mData) setMeals(mData.map(m => ({ ...m, items: Array.isArray(m.items) ? m.items : JSON.parse(m.items || '[]') })))
    if (gData && gData.length > 0) setGoals(gData)
    if (pData) setProfile(pData)
  }, [])

  useEffect(() => {
    if (user) loadFromSupabase(user.id)
  }, [user, loadFromSupabase])

  async function addWorkout(w: Omit<Workout, 'id'>) {
    const newW: Workout = { ...w, id: crypto.randomUUID() }
    setWorkouts(prev => [newW, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    if (user) await supabase.from('workouts').insert({ ...newW, user_id: user.id })
  }

  async function deleteWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id))
    if (user) await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id)
  }

  async function addMeal(m: Omit<Meal, 'id'>) {
    const newM: Meal = { ...m, id: crypto.randomUUID() }
    setMeals(prev => [...prev, newM])
    if (user) await supabase.from('meals').insert({ ...newM, user_id: user.id, items: JSON.stringify(newM.items) })
  }

  async function deleteMeal(id: string) {
    setMeals(prev => prev.filter(m => m.id !== id))
    if (user) await supabase.from('meals').delete().eq('id', id).eq('user_id', user.id)
  }

  async function updateMeal(id: string, m: Omit<Meal, 'id'>) {
    const updated: Meal = { ...m, id }
    setMeals(prev => prev.map(meal => meal.id === id ? updated : meal))
    if (user) await supabase.from('meals').update({ ...updated, items: JSON.stringify(updated.items) }).eq('id', id).eq('user_id', user.id)
  }

  async function updateGoalProgress(label: string, progress: number) {
    setGoals(prev => prev.map(g => g.label === label ? { ...g, progress } : g))
    if (user) await supabase.from('goals').upsert({ user_id: user.id, label, progress }, { onConflict: 'user_id,label' })
  }

  async function addGoal(g: Goal) {
    setGoals(prev => [...prev, g])
    if (user) await supabase.from('goals').upsert({ ...g, user_id: user.id }, { onConflict: 'user_id,label' })
  }

  async function deleteGoal(label: string) {
    setGoals(prev => prev.filter(g => g.label !== label))
    if (user) await supabase.from('goals').delete().eq('user_id', user.id).eq('label', label)
  }

  async function updateProfile(p: Partial<Profile>) {
    const updated = { ...profile, ...p }
    setProfile(updated)
    if (user) await supabase.from('profiles').upsert({ ...updated, user_id: user.id }, { onConflict: 'user_id' })
  }

  function addWater(amount: number) {
    setDailyLog(prev => ({ ...prev, water: Math.max(0, +(prev.water + amount).toFixed(2)) }))
  }

  function setSteps(steps: number) {
    setDailyLog(prev => ({ ...prev, steps: Math.max(0, steps) }))
  }

  function addWeight(weight: number) {
    const entry: WeightEntry = { id: crypto.randomUUID(), date: new Date().toISOString(), weight }
    setWeightLog(prev => [entry, ...prev].slice(0, 90))
  }

  function addCustomFood(f: Omit<FoodItem, 'id' | 'isCustom'>) {
    const newF: FoodItem = { ...f, id: crypto.randomUUID(), isCustom: true }
    setCustomFoods(prev => [...prev, newF])
  }

  function deleteCustomFood(id: string) {
    setCustomFoods(prev => prev.filter(f => f.id !== id))
  }

  function copyMealsForDay(fromDate: string, toDate: string) {
    const source = meals.filter(m => m.date?.slice(0, 10) === fromDate)
    if (source.length === 0) return
    const copies = source.map(m => ({
      ...m,
      id: crypto.randomUUID(),
      date: toDate + 'T' + (m.date?.slice(11) ?? '12:00:00.000Z'),
    }))
    setMeals(prev => [...prev, ...copies])
  }

  function addProgram(p: Omit<TrainingProgram, 'id' | 'createdAt'>) {
    const newP: TrainingProgram = { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setPrograms(prev => [...prev, newP])
    if (!activeProgramId) setActiveProgramId(newP.id)
  }

  function updateProgram(id: string, p: TrainingProgram) {
    setPrograms(prev => prev.map(prog => prog.id === id ? p : prog))
  }

  function deleteProgram(id: string) {
    setPrograms(prev => prev.filter(p => p.id !== id))
    if (activeProgramId === id) setActiveProgramId(null)
  }

  function setActiveProgram(id: string | null) {
    setActiveProgramId(id)
  }

  function logDiaryEntry(entry: Omit<DiaryEntry, 'id'>) {
    const newEntry: DiaryEntry = { ...entry, id: crypto.randomUUID() }
    setDiary(prev => [newEntry, ...prev])
  }

  function deleteDiaryEntry(id: string) {
    setDiary(prev => prev.filter(e => e.id !== id))
  }

  return (
    <AppContext.Provider value={{
      profile, workouts, meals, goals, dailyLog, weightLog, isNewUser,
      customFoods, programs, diary, activeProgramId,
      addWorkout, deleteWorkout, addMeal, deleteMeal, updateMeal,
      updateGoalProgress, addGoal, deleteGoal, updateProfile,
      addWater, setSteps, addWeight,
      addCustomFood, deleteCustomFood, copyMealsForDay,
      addProgram, updateProgram, deleteProgram, setActiveProgram,
      logDiaryEntry, deleteDiaryEntry,
    }}>
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
