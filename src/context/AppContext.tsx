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

interface AppState {
  profile: Profile
  workouts: Workout[]
  meals: Meal[]
  goals: Goal[]
  addWorkout: (w: Omit<Workout, 'id' | 'date'>) => Promise<void>
  addMeal: (m: Omit<Meal, 'id' | 'date'>) => Promise<void>
  updateGoalProgress: (label: string, progress: number) => Promise<void>
  updateProfile: (p: Partial<Profile>) => Promise<void>
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

// localStorage fallback helpers
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile>(() => load('vf_profile', defaultProfile))
  const [workouts, setWorkouts] = useState<Workout[]>(() => load('vf_workouts', []))
  const [meals, setMeals] = useState<Meal[]>(() => load('vf_meals', []))
  const [goals, setGoals] = useState<Goal[]>(() => load('vf_goals', defaultGoals))

  // Persist to localStorage as fallback
  useEffect(() => { save('vf_profile', profile) }, [profile])
  useEffect(() => { save('vf_workouts', workouts) }, [workouts])
  useEffect(() => { save('vf_meals', meals) }, [meals])
  useEffect(() => { save('vf_goals', goals) }, [goals])

  // Load from Supabase when user logs in
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
    if (user) {
      await supabase.from('workouts').insert({ ...newW, user_id: user.id })
    }
  }

  async function addMeal(m: Omit<Meal, 'id' | 'date'>) {
    const newM: Meal = { ...m, id: crypto.randomUUID(), date: new Date().toISOString() }
    setMeals(prev => [...prev, newM])
    if (user) {
      await supabase.from('meals').insert({ ...newM, user_id: user.id, items: JSON.stringify(newM.items) })
    }
  }

  async function updateGoalProgress(label: string, progress: number) {
    setGoals(prev => prev.map(g => g.label === label ? { ...g, progress } : g))
    if (user) {
      await supabase.from('goals').upsert({ user_id: user.id, label, progress }, { onConflict: 'user_id,label' })
    }
  }

  async function updateProfile(p: Partial<Profile>) {
    const updated = { ...profile, ...p }
    setProfile(updated)
    if (user) {
      await supabase.from('profiles').upsert({ ...updated, user_id: user.id }, { onConflict: 'user_id' })
    }
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
