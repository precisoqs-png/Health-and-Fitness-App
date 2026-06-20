import { useState } from 'react'
import { useApp, todayISO } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'

const emptyForm = { name: '', time: '', items: '', calories: '', protein: '', carbs: '', fat: '' }

export default function Nutrition() {
  const { meals, addMeal, profile } = useApp()
  const isMobile = useMobile()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const todayMeals = meals.filter(m => m.date?.slice(0, 10) === todayISO())

  const displayMeals = todayMeals.length > 0 ? todayMeals : [
    { id: 'p1', name: 'Breakfast', time: '7:30 AM', items: ['Oatmeal with berries', 'Greek yogurt', 'Black coffee'], calories: 420, protein: 28, carbs: 58, fat: 9 },
    { id: 'p2', name: 'Lunch', time: '12:00 PM', items: ['Grilled chicken breast', 'Brown rice', 'Steamed broccoli'], calories: 610, protein: 48, carbs: 62, fat: 14 },
  ]

  const totalCalories = displayMeals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = displayMeals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = displayMeals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = displayMeals.reduce((s, m) => s + m.fat, 0)

  const { dailyCalorieGoal: calGoal, proteinGoal, carbsGoal, fatGoal } = profile

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.calories) { setError('Meal name and calories are required.'); return }
    addMeal({
      name: form.name,
      time: form.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      items: form.items.split(',').map(s => s.trim()).filter(Boolean),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    })
    setForm(emptyForm)
    setShowForm(false)
    setError('')
  }

  const summaryCard = (
    <Card>
      <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Daily Summary</h2>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 44, fontWeight: 800, color: '#f97316' }}>{totalCalories}</p>
        <p style={{ color: '#64748b', fontSize: 13 }}>of {calGoal} kcal</p>
        <div style={{ marginTop: 10 }}>
          <ProgressBar pct={Math.round(totalCalories / calGoal * 100)} color="#f97316" height={10} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Protein', current: totalProtein, goal: proteinGoal, color: '#22c55e' },
          { label: 'Carbs', current: totalCarbs, goal: carbsGoal, color: '#f97316' },
          { label: 'Fat', current: totalFat, goal: fatGoal, color: '#3b82f6' },
        ].map(({ label, current, goal, color }) => {
          const pct = Math.min(100, Math.round((current / goal) * 100))
          return (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{current}g / {goal}g</span>
              </div>
              <ProgressBar pct={pct} color={color} height={7} />
            </div>
          )
        })}
      </div>
    </Card>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Nutrition Log</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Today's food intake and macro breakdown</p>
      </div>

      {/* On mobile, show summary card first */}
      {isMobile && <div style={{ marginBottom: 20 }}>{summaryCard}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayMeals.map((meal) => (
            <Card key={meal.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 2 }}>{meal.time}</p>
                  <h3 style={{ fontWeight: 600, fontSize: 16 }}>{meal.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#f97316' }}>{meal.calories}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>kcal</p>
                </div>
              </div>
              {meal.items.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {meal.items.map((item) => (
                    <p key={item} style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>• {item}</p>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #1e1e2e' }}>
                <span style={{ fontSize: 13, color: '#22c55e' }}>P: {meal.protein}g</span>
                <span style={{ fontSize: 13, color: '#f97316' }}>C: {meal.carbs}g</span>
                <span style={{ fontSize: 13, color: '#3b82f6' }}>F: {meal.fat}g</span>
              </div>
            </Card>
          ))}

          {showForm ? (
            <Card>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Log a Meal</h3>
              {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</p>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input
                    placeholder="Meal name *"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                  <input
                    placeholder="Time (e.g. 6:30 PM)"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <input
                  placeholder="Food items (comma-separated)"
                  value={form.items}
                  onChange={e => setForm(f => ({ ...f, items: e.target.value }))}
                  style={inputStyle}
                />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
                  {(['calories', 'protein', 'carbs', 'fat'] as const).map(field => (
                    <input
                      key={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1) + (field === 'calories' ? ' *' : ' g')}
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      type="number"
                      min="0"
                      style={inputStyle}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    Save Meal
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setError('') }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 14 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              style={{ background: 'transparent', border: '2px dashed #2a2a3e', borderRadius: 14, padding: 18, color: '#475569', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}
            >
              + Log a meal
            </button>
          )}
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {summaryCard}
            <Card>
              <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Hydration</h2>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 6 }}>💧</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#3b82f6' }}>1.8 L</p>
                <p style={{ color: '#64748b', fontSize: 13 }}>of {profile.waterGoal} L goal</p>
                <div style={{ marginTop: 14 }}>
                  <ProgressBar pct={Math.round(1.8 / profile.waterGoal * 100)} color="#3b82f6" height={7} />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {isMobile && (
        <Card style={{ marginTop: 20 }}>
          <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Hydration</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32 }}>💧</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>1.8 L</span>
                <span style={{ color: '#64748b', fontSize: 13 }}>of {profile.waterGoal} L</span>
              </div>
              <ProgressBar pct={Math.round(1.8 / profile.waterGoal * 100)} color="#3b82f6" height={7} />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0f0f1a',
  border: '1px solid #2a2a3e',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
