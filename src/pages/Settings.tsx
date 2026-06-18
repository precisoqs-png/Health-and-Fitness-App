import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from '../components/Card'

export default function Settings() {
  const { profile, updateProfile } = useApp()
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Settings</h1>
        <p style={{ color: '#64748b' }}>Customize your profile and daily goals</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 12, marginBottom: 20, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Display Name</span>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                placeholder="Your name"
              />
            </label>
          </div>
        </Card>

        <Card>
          <h2 style={{ fontWeight: 600, fontSize: 12, marginBottom: 20, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Daily Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'dailyCalorieGoal', label: 'Calorie Goal', unit: 'kcal', min: 1000, max: 5000 },
              { key: 'dailyStepGoal', label: 'Step Goal', unit: 'steps', min: 1000, max: 30000 },
              { key: 'proteinGoal', label: 'Protein Goal', unit: 'g', min: 50, max: 400 },
              { key: 'carbsGoal', label: 'Carbs Goal', unit: 'g', min: 50, max: 600 },
              { key: 'fatGoal', label: 'Fat Goal', unit: 'g', min: 20, max: 200 },
            ].map(({ key, label, unit, min, max }) => (
              <label key={key} style={labelStyle}>
                <span style={labelTextStyle}>{label} <span style={{ color: '#475569' }}>({unit})</span></span>
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                  style={inputStyle}
                />
              </label>
            ))}
            <label style={labelStyle}>
              <span style={labelTextStyle}>Water Goal <span style={{ color: '#475569' }}>(L)</span></span>
              <input
                type="number"
                min={0.5}
                max={10}
                step={0.1}
                value={form.waterGoal}
                onChange={e => setForm(f => ({ ...f, waterGoal: Number(e.target.value) }))}
                style={inputStyle}
              />
            </label>
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="submit"
            style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Save Changes
          </button>
          {saved && <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 500 }}>✓ Saved!</span>}
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const labelTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#94a3b8',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  background: '#0f0f1a',
  border: '1px solid #2a2a3e',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
