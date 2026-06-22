import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import { calcBMR, calcTDEE, calcMacros, GOAL_OPTIONS, calcDynamicCalorieTarget } from '../lib/bmr'
import type { ActivityLevel, GoalType, Gender } from '../lib/bmr'
import { useTheme, THEMES } from '../context/ThemeContext'

export default function Settings() {
  const { profile, updateProfile, weightLog } = useApp()
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState({ ...profile })

  const latestWeight = weightLog.length > 0 ? weightLog.sort((a, b) => b.date.localeCompare(a.date))[0] : null
  const calcWeight = latestWeight ? latestWeight.weight : form.currentWeight

  const bmr = Math.round(calcBMR(calcWeight, form.height, form.age, form.gender as Gender))
  const tdee = calcTDEE(bmr, form.activityLevel as ActivityLevel)
  const dynTarget = calcDynamicCalorieTarget(tdee, calcWeight, form.goalWeight, form.targetWeeks || 12)
  const targetCals = dynTarget.target
  const macros = calcMacros(targetCals, calcWeight)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await updateProfile(form)
    showToast('Settings saved ✓')
  }

  async function applyCalculator() {
    const updated = {
      ...form,
      dailyCalorieGoal: targetCals,
      proteinGoal: macros.protein,
      carbsGoal: macros.carbs,
      fatGoal: macros.fat,
    }
    setForm(updated)
    await updateProfile(updated)
    showToast('Goals updated from calculator ✓')
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Customize your profile, goals and body stats</p>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <h2 style={sectionHeadStyle}>Account</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 2 }}>Signed in as</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{user?.email}</p>
          </div>
          <button onClick={async () => { await signOut(); showToast('Signed out', 'info') }} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 16px', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </Card>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <h2 style={sectionHeadStyle}>Profile</h2>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Display Name</span>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your name" />
          </label>
        </Card>

        <Card>
          <h2 style={sectionHeadStyle}>Body Stats & BMR Calculator</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12 }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Age</span>
                <input type="number" min={10} max={100} value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Height (cm)</span>
                <input type="number" min={100} max={250} value={form.height} onChange={e => setForm(f => ({ ...f, height: Number(e.target.value) }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Current Weight (kg)</span>
                <input type="number" min={30} max={300} step={0.1} value={form.currentWeight} onChange={e => setForm(f => ({ ...f, currentWeight: Number(e.target.value) }))} style={inputStyle} />
              </label>
            </div>

            <label style={labelStyle}>
              <span style={labelTextStyle}>Gender</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['male', 'female'] as const).map(g => (
                  <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: g }))}
                    style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid ' + (form.gender === g ? 'var(--accent)' : 'var(--border)'), background: form.gender === g ? '#1e3a8a22' : 'transparent', color: form.gender === g ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </label>

            <label style={labelStyle}>
              <span style={labelTextStyle}>Activity Level</span>
              <select value={form.activityLevel} onChange={e => setForm(f => ({ ...f, activityLevel: e.target.value as ActivityLevel }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="sedentary">Sedentary (desk job, no exercise)</option>
                <option value="light">Light (1-3 days/week exercise)</option>
                <option value="moderate">Moderate (3-5 days/week exercise)</option>
                <option value="active">Active (6-7 days/week exercise)</option>
                <option value="very_active">Very Active (athlete / physical job)</option>
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Goal</span>
                <select value={form.goalType} onChange={e => setForm(f => ({ ...f, goalType: e.target.value as GoalType }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Goal Weight (kg)</span>
                <input type="number" min={30} max={300} step={0.1} value={form.goalWeight} onChange={e => setForm(f => ({ ...f, goalWeight: Number(e.target.value) }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Reach goal in (weeks)</span>
                <input type="number" min={1} max={104} value={form.targetWeeks || 12} onChange={e => setForm(f => ({ ...f, targetWeeks: Number(e.target.value) }))} style={inputStyle} />
              </label>
            </div>

            {/* Dynamic target banner — shown prominently when goal weight differs */}
            {Math.abs(form.goalWeight - calcWeight) > 0.5 && (
              <div style={{ background: '#1e3a8a22', border: '1px solid var(--accent)', borderRadius: 12, padding: '14px 16px', marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Your Personalised Calorie Target</p>
                <p style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{targetCals.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>kcal/day</span></p>
                <p style={{ fontSize: 13, color: 'var(--text)' }}>
                  {dynTarget.weeklyChange > 0
                    ? <>To lose <strong>{dynTarget.weeklyChange.toFixed(2)} kg/week</strong> and reach <strong>{form.goalWeight} kg</strong> in <strong>{form.targetWeeks || 12} weeks</strong></>
                    : <>To gain <strong>{Math.abs(dynTarget.weeklyChange).toFixed(2)} kg/week</strong> and reach <strong>{form.goalWeight} kg</strong> in <strong>{form.targetWeeks || 12} weeks</strong></>}
                  {dynTarget.capped && <span style={{ color: '#f59e0b', display: 'block', marginTop: 4, fontSize: 12 }}>⚠️ Floor applied — going lower than 1,300 kcal/day is unsafe</span>}
                </p>
                {latestWeight && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Based on your last weigh-in: {latestWeight.weight} kg on {new Date(latestWeight.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            <div style={{ background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 10, padding: '14px 16px', marginTop: 4 }}>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Reference ranges</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'BMR', value: bmr + ' kcal', sub: 'base metabolic rate' },
                  { label: 'TDEE', value: tdee + ' kcal', sub: 'total daily expenditure' },
                  { label: 'Activity Target', value: targetCals + ' kcal', sub: 'goal-adjusted' },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{ textAlign: 'center', opacity: 0.75 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: 'var(--text-muted)' }}>{value}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{sub}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Protein', value: macros.protein, color: '#22c55e' },
                  { label: 'Carbs', value: macros.carbs, color: 'var(--accent)' },
                  { label: 'Fat', value: macros.fat, color: '#a855f7' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'var(--card)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color }}>{value}g</p>
                  </div>
                ))}
              </div>
              <button type="button" onClick={applyCalculator}
                style={{ width: '100%', background: '#1e3a8a', color: '#93c5fd', border: '1px solid #3b82f6', borderRadius: 8, padding: '9px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Apply These Targets to My Goals
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 style={sectionHeadStyle}>Daily Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'dailyCalorieGoal', label: 'Calorie Goal', unit: 'kcal', min: 1000, max: 5000, step: 50 },
              { key: 'dailyStepGoal', label: 'Step Goal', unit: 'steps', min: 1000, max: 30000, step: 500 },
              { key: 'proteinGoal', label: 'Protein Goal', unit: 'g', min: 50, max: 400, step: 5 },
              { key: 'carbsGoal', label: 'Carbs Goal', unit: 'g', min: 50, max: 600, step: 5 },
              { key: 'fatGoal', label: 'Fat Goal', unit: 'g', min: 20, max: 200, step: 5 },
              { key: 'waterGoal', label: 'Water Goal', unit: 'L', min: 0.5, max: 10, step: 0.25 },
            ].map(({ key, label, unit, min, max, step }) => (
              <label key={key} style={labelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={labelTextStyle}>{label}</span>
                  <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{form[key as keyof typeof form]} {unit}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={form[key as keyof typeof form] as number}
                  onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: '#334155' }}>{min} {unit}</span>
                  <span style={{ fontSize: 11, color: '#334155' }}>{max} {unit}</span>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <button
          type="submit"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          Save Changes
        </button>
      </form>

      {/* Appearance — outside form, no submit needed */}
      <Card style={{ marginTop: 20 }}>
        <h2 style={sectionHeadStyle}>Appearance</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Choose your colour theme</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {THEMES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTheme(t.key); showToast(`Theme: ${t.label}`, 'info') }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '14px 8px', borderRadius: 12,
                border: `2px solid ${theme.key === t.key ? t.accent : 'var(--border)'}`,
                background: t.bg, cursor: 'pointer', transition: 'border-color 0.15s',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {theme.key === t.key && <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text, textAlign: 'center', lineHeight: 1.3 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

const sectionHeadStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: 12, marginBottom: 18,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1,
}
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelTextStyle: React.CSSProperties = { fontSize: 14, color: '#94a3b8', fontWeight: 500 }
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8,
  padding: '10px 14px', color: 'var(--text)', fontSize: 15, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
