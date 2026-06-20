import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

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
}

export interface DailyLog {
  date: string
  steps: number
  water: number // litres
}

interface AppState {
  profile: Profile
  workouts: Workout[]
  meals: Meal[]
  goals: Goal[]
  dailyLog: DailyLog
  addWorkout: (w: Omit<Workout, 'id' | 'date'>) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  addMeal: (m: Omit<Meal, 'id' | 'date'>) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  updateGoalProgress: (label: string, progress: number) => Promise<void>
  updateProfile: (p: Partial<Profile>) => Promise<void>
  addWater: (amount: number) => void
  setSteps: (steps: number) => void
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

function todayLog(): DailyLog {
  return { date: todayISO(), steps: 0, water: 0 }
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

// Calculate consecutive workout streak from dated workouts
export function calcStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0
  const days = new Set(workouts.map(w => w.date.slice(0, 10)))
  const sorted = Array.from(days).sort().reverse()
  const today = todayISO()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yISO = yesterday.toISOString().slice(0, 10)
  // Streak must include today or yesterday to be active
  if (sorted[0] !== today && sorted[0] !== yISO) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    prev.setDate(prev.getDate() - 1)
    if (prev.toISOString().slice(0, 10) === curr.toISOString().slice(0, 10)) {
      streak++
    } else {
      break
    }
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
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => {
    const saved = load<DailyLog>('vf_daily', todayLog())
    return saved.date === todayISO() ? saved : todayLog()
  })

  useEffect(() => { save('vf_profile', profile) }, [profile])
  useEffect(() => { save('vf_workouts', workouts) }, [workouts])
  useEffect(() => { save('vf_meals', meals) }, [meals])
  useEffect(() => { save('vf_goals', goals) }, [goals])
  useEffect(() => { save('vf_daily', dailyLog) }, [dailyLog])

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

  async function addWorkout(w: Omit<Workout, 'id' | 'date'>) {
    const newW: Workout = { ...w, id: crypto.randomUUID(), date: new Date().toISOString() }
    setWorkouts(prev => [newW, ...prev])
    if (user) await supabase.from('workouts').insert({ ...newW, user_id: user.id })
  }

  async function deleteWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id))
    if (user) await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id)
  }

  async function addMeal(m: Omit<Meal, 'id' | 'date'>) {
    const newM: Meal = { ...m, id: crypto.randomUUID(), date: new Date().toISOString() }
    setMeals(prev => [...prev, newM])
    if (user) await supabase.from('meals').insert({ ...newM, user_id: user.id, items: JSON.stringify(newM.items) })
  }

  async function deleteMeal(id: string) {
    setMeals(prev => prev.filter(m => m.id !== id))
    if (user) await supabase.from('meals').delete().eq('id', id).eq('user_id', user.id)
  }

  async function updateGoalProgress(label: string, progress: number) {
    setGoals(prev => prev.map(g => g.label === label ? { ...g, progress } : g))
    if (user) await supabase.from('goals').upsert({ user_id: user.id, label, progress }, { onConflict: 'user_id,label' })
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

  return (
    <AppContext.Provider value={{ profile, workouts, meals, goals, dailyLog, addWorkout, deleteWorkout, addMeal, deleteMeal, updateGoalProgress, updateProfile, addWater, setSteps }}>
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
