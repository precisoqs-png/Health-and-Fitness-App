import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface VisionBoard {
  id: string
  user_id: string
  year: number
  created_at: string
}

export interface VisionGoal {
  id: string
  board_id: string
  user_id: string
  title: string
  category: string
  color: string
  position: number
  created_at: string
}

export interface GoalMeasurable {
  id: string
  goal_id: string
  text: string
  completed: boolean
  created_at: string
}

export interface GoalConversation {
  id: string
  goal_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export const GOAL_CATEGORIES = [
  { label: 'Health & Fitness',   color: '#22c55e' },
  { label: 'Career & Skills',    color: '#3b82f6' },
  { label: 'Relationships',      color: '#ec4899' },
  { label: 'Finance',            color: '#f59e0b' },
  { label: 'Mindset & Growth',   color: '#a855f7' },
  { label: 'Creativity',         color: '#f97316' },
  { label: 'Travel & Adventure', color: '#06b6d4' },
  { label: 'Other',              color: '#94a3b8' },
]

interface VisionState {
  boards: VisionBoard[]
  goals: VisionGoal[]
  measurables: GoalMeasurable[]
  conversations: GoalConversation[]
  selectedYear: number
  setSelectedYear: (year: number) => void
  ensureBoard: (year: number) => Promise<VisionBoard>
  addGoal: (g: Omit<VisionGoal, 'id' | 'created_at'>) => Promise<VisionGoal>
  updateGoal: (id: string, patch: Partial<VisionGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addMeasurables: (goalId: string, texts: string[]) => Promise<void>
  toggleMeasurable: (id: string) => Promise<void>
  deleteMeasurable: (id: string) => Promise<void>
  addConversationMessage: (goalId: string, role: 'user' | 'assistant', content: string) => Promise<void>
  loadConversation: (goalId: string) => Promise<void>
  progressForGoal: (goalId: string) => number
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

function uuid(): string {
  return crypto.randomUUID()
}

const VisionContext = createContext<VisionState | null>(null)

export function VisionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()

  const [boards, setBoards] = useState<VisionBoard[]>(() => load('vf_vision_boards', []))
  const [goals, setGoals] = useState<VisionGoal[]>(() => load('vf_vision_goals', []))
  const [measurables, setMeasurables] = useState<GoalMeasurable[]>(() => load('vf_vision_measurables', []))
  const [conversations, setConversations] = useState<GoalConversation[]>(() => load('vf_vision_conversations', []))
  const [selectedYear, setSelectedYearState] = useState<number>(() => load('vf_vision_year', currentYear))

  // Persist to localStorage on every change
  useEffect(() => { save('vf_vision_boards', boards) }, [boards])
  useEffect(() => { save('vf_vision_goals', goals) }, [goals])
  useEffect(() => { save('vf_vision_measurables', measurables) }, [measurables])
  useEffect(() => { save('vf_vision_conversations', conversations) }, [conversations])
  useEffect(() => { save('vf_vision_year', selectedYear) }, [selectedYear])

  // Sync from Supabase on login
  useEffect(() => {
    if (!user) return
    async function syncFromSupabase() {
      try {
        const [{ data: boardData }, { data: goalData }, { data: measData }, { data: convData }] =
          await Promise.all([
            supabase.from('vision_boards').select('*').eq('user_id', user!.id),
            supabase.from('vision_goals').select('*').eq('user_id', user!.id),
            supabase.from('goal_measurables').select('*'),
            supabase.from('goal_conversations').select('*'),
          ])
        if (boardData && boardData.length > 0) setBoards(boardData)
        if (goalData && goalData.length > 0) setGoals(goalData)
        if (measData && measData.length > 0) setMeasurables(measData)
        if (convData && convData.length > 0) setConversations(convData)
      } catch { /* offline — use localStorage */ }
    }
    syncFromSupabase()
  }, [user])

  const setSelectedYear = useCallback((year: number) => {
    setSelectedYearState(year)
  }, [])

  const ensureBoard = useCallback(async (year: number): Promise<VisionBoard> => {
    const existing = boards.find(b => b.year === year && b.user_id === (user?.id ?? 'local'))
    if (existing) return existing

    const board: VisionBoard = {
      id: uuid(),
      user_id: user?.id ?? 'local',
      year,
      created_at: new Date().toISOString(),
    }
    setBoards(prev => [...prev, board])

    if (user) {
      try {
        await supabase.from('vision_boards').insert({
          id: board.id,
          user_id: board.user_id,
          year: board.year,
          created_at: board.created_at,
        })
      } catch { /* continue with local */ }
    }
    return board
  }, [boards, user])

  const addGoal = useCallback(async (g: Omit<VisionGoal, 'id' | 'created_at'>): Promise<VisionGoal> => {
    const goal: VisionGoal = { ...g, id: uuid(), created_at: new Date().toISOString() }
    setGoals(prev => [...prev, goal])

    if (user) {
      try { await supabase.from('vision_goals').insert(goal) } catch { /* continue */ }
    }
    return goal
  }, [user])

  const updateGoal = useCallback(async (id: string, patch: Partial<VisionGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
    if (user) {
      try { await supabase.from('vision_goals').update(patch).eq('id', id) } catch { /* continue */ }
    }
  }, [user])

  const deleteGoal = useCallback(async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    setMeasurables(prev => prev.filter(m => m.goal_id !== id))
    setConversations(prev => prev.filter(c => c.goal_id !== id))
    if (user) {
      try { await supabase.from('vision_goals').delete().eq('id', id) } catch { /* continue */ }
    }
  }, [user])

  const addMeasurables = useCallback(async (goalId: string, texts: string[]) => {
    const newItems: GoalMeasurable[] = texts.map(text => ({
      id: uuid(),
      goal_id: goalId,
      text,
      completed: false,
      created_at: new Date().toISOString(),
    }))
    setMeasurables(prev => [...prev, ...newItems])
    if (user) {
      try { await supabase.from('goal_measurables').insert(newItems) } catch { /* continue */ }
    }
  }, [user])

  const toggleMeasurable = useCallback(async (id: string) => {
    let newVal = false
    setMeasurables(prev => prev.map(m => {
      if (m.id !== id) return m
      newVal = !m.completed
      return { ...m, completed: newVal }
    }))
    if (user) {
      try { await supabase.from('goal_measurables').update({ completed: newVal }).eq('id', id) } catch { /* continue */ }
    }
  }, [user])

  const deleteMeasurable = useCallback(async (id: string) => {
    setMeasurables(prev => prev.filter(m => m.id !== id))
    if (user) {
      try { await supabase.from('goal_measurables').delete().eq('id', id) } catch { /* continue */ }
    }
  }, [user])

  const addConversationMessage = useCallback(async (goalId: string, role: 'user' | 'assistant', content: string) => {
    const msg: GoalConversation = {
      id: uuid(),
      goal_id: goalId,
      role,
      content,
      created_at: new Date().toISOString(),
    }
    setConversations(prev => [...prev, msg])
    if (user) {
      try { await supabase.from('goal_conversations').insert(msg) } catch { /* continue */ }
    }
  }, [user])

  const loadConversation = useCallback(async (goalId: string) => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('goal_conversations')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at')
      if (data) {
        setConversations(prev => {
          const others = prev.filter(c => c.goal_id !== goalId)
          return [...others, ...data]
        })
      }
    } catch { /* use local */ }
  }, [user])

  const progressForGoal = useCallback((goalId: string): number => {
    const items = measurables.filter(m => m.goal_id === goalId)
    if (items.length === 0) return 0
    const done = items.filter(m => m.completed).length
    return Math.round((done / items.length) * 100)
  }, [measurables])

  return (
    <VisionContext.Provider value={{
      boards, goals, measurables, conversations, selectedYear,
      setSelectedYear, ensureBoard, addGoal, updateGoal, deleteGoal,
      addMeasurables, toggleMeasurable, deleteMeasurable,
      addConversationMessage, loadConversation, progressForGoal,
    }}>
      {children}
    </VisionContext.Provider>
  )
}

export function useVision(): VisionState {
  const ctx = useContext(VisionContext)
  if (!ctx) throw new Error('useVision must be used within VisionProvider')
  return ctx
}
