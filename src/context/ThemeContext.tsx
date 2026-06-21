import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface Theme {
  key: string
  label: string
  accent: string
  accentDim: string
  bg: string
  card: string
  inputBg: string
  border: string
  text: string
  textMuted: string
  textSubtle: string
}

export const THEMES: Theme[] = [
  {
    key: 'blue-dark',
    label: 'Blue & Dark',
    accent: 'var(--accent)',
    accentDim: 'var(--accent-dim)',
    bg: 'var(--bg)',
    card: 'var(--card)',
    inputBg: 'var(--bg)',
    border: 'var(--border)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    textSubtle: 'var(--text-subtle)',
  },
  {
    key: 'pink-light',
    label: 'Pink & White',
    accent: '#ec4899',
    accentDim: 'rgba(236,72,153,0.12)',
    bg: '#fdf2f8',
    card: '#ffffff',
    inputBg: '#fdf2f8',
    border: '#f9a8d4',
    text: '#1e1b2e',
    textMuted: '#6b7280',
    textSubtle: '#9ca3af',
  },
  {
    key: 'purple-dark',
    label: 'Purple & Dark',
    accent: '#a855f7',
    accentDim: 'rgba(168,85,247,0.12)',
    bg: '#0f0a1a',
    card: '#150f1f',
    inputBg: '#0f0a1a',
    border: '#2e1a4a',
    text: '#e2e0f0',
    textMuted: '#7c6b9e',
    textSubtle: '#5a4a7a',
  },
  {
    key: 'green-dark',
    label: 'Green & Dark',
    accent: '#22c55e',
    accentDim: 'rgba(34,197,94,0.12)',
    bg: '#071a0f',
    card: '#0d1f13',
    inputBg: '#071a0f',
    border: '#1a3a22',
    text: '#dcfce7',
    textMuted: '#4ade80',
    textSubtle: '#16a34a',
  },
  {
    key: 'red-dark',
    label: 'Red & Dark',
    accent: '#ef4444',
    accentDim: 'rgba(239,68,68,0.12)',
    bg: '#1a0707',
    card: '#1f0d0d',
    inputBg: '#1a0707',
    border: '#3a1a1a',
    text: '#fee2e2',
    textMuted: '#f87171',
    textSubtle: '#b91c1c',
  },
  {
    key: 'orange-dark',
    label: 'Orange & Dark',
    accent: '#f97316',
    accentDim: 'rgba(249,115,22,0.12)',
    bg: 'var(--bg)',
    card: 'var(--card)',
    inputBg: 'var(--bg)',
    border: 'var(--border)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    textSubtle: 'var(--text-subtle)',
  },
]

function applyTheme(theme: Theme) {
  const root = document.documentElement.style
  root.setProperty('--accent', theme.accent)
  root.setProperty('--accent-dim', theme.accentDim)
  root.setProperty('--bg', theme.bg)
  root.setProperty('--card', theme.card)
  root.setProperty('--input-bg', theme.inputBg)
  root.setProperty('--border', theme.border)
  root.setProperty('--text', theme.text)
  root.setProperty('--text-muted', theme.textMuted)
  root.setProperty('--text-subtle', theme.textSubtle)
  // Also set body background directly so full page matches
  document.body.style.background = theme.bg
  document.body.style.color = theme.text
}

interface ThemeCtx {
  theme: Theme
  setTheme: (key: string) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<string>(() => {
    try { return localStorage.getItem('vf_theme') || 'blue-dark' } catch { return 'blue-dark' }
  })

  const theme = THEMES.find(t => t.key === themeKey) || THEMES[0]

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem('vf_theme', theme.key) } catch { /* ignore */ }
  }, [theme])

  function setTheme(key: string) { setThemeKey(key) }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
