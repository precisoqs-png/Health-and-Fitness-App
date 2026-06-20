import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'

export default function Settings() {
  const { profile, updateProfile } = useApp()
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [form, setForm] = useState({ ...profile })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await updateProfile(form)
    showToast('Settings saved ✓')
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Customize your profile and daily goals</p>
      </div>

      {/* Account info */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={sectionHeadStyle}>Account</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 2 }}>Signed in as</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>{user?.email}</p>
          </div>
          <button onClick={async () => { await signOut(); showToast('Signed out', 'info') }} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 16px', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>
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
                  <span style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>{form[key as keyof typeof form]} {unit}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={form[key as keyof typeof form] as number}
                  onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
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
          style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          Save Changes
        </button>
      </form>
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
  background: '#0f0f1a', border: '1px solid #2a2a3e', borderRadius: 8,
  padding: '10px 14px', color: '#e2e8f0', fontSize: 15, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
