import { useState } from 'react'
import { useApp, todayISO } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'

const emptyForm = { name: '', time: '', items: '', calories: '', protein: '', carbs: '', fat: '' }

export default function Nutrition() {
  const { meals, addMeal, deleteMeal, profile, dailyLog, addWater } = useApp()
  const isMobile = useMobile()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const todayMeals = meals.filter(m => m.date?.slice(0, 10) === todayISO())
  const totalCalories = todayMeals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = todayMeals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = todayMeals.reduce((s, m) => s + m.fat, 0)

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
      <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Daily Summary</h2>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <p style={{ fontSize: 42, fontWeight: 800, color: totalCalories > calGoal ? '#ef4444' : '#f97316' }}>{totalCalories}</p>
        <p style={{ color: '#64748b', fontSize: 13 }}>of {calGoal} kcal goal</p>
        <div style={{ marginTop: 10 }}>
          <ProgressBar pct={Math.min(100, Math.round(totalCalories / calGoal * 100))} color={totalCalories > calGoal ? '#ef4444' : '#f97316'} height={10} />
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
          {calGoal - totalCalories > 0 ? `${calGoal - totalCalories} kcal remaining` : `${totalCalories - calGoal} kcal over goal`}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

  const waterCard = (
    <Card>
      <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💧 Hydration</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#3b82f6' }}>{dailyLog.water.toFixed(1)}L</span>
            <span style={{ color: '#64748b', fontSize: 13, alignSelf: 'flex-end' }}>of {profile.waterGoal}L</span>
          </div>
          <ProgressBar pct={Math.min(100, Math.round(dailyLog.water / profile.waterGoal * 100))} color="#3b82f6" height={8} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0.25, 0.5, 1].map(amt => (
          <button key={amt} onClick={() => addWater(amt)} style={{ flex: 1, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: '7px 0', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            +{amt}L
          </button>
        ))}
        {dailyLog.water > 0 && (
          <button onClick={() => addWater(-0.25)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '7px 10px', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>−</button>
        )}
      </div>
    </Card>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Nutrition Log</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Track today's food and hydration</p>
      </div>

      {isMobile && <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>{summaryCard}{waterCard}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {todayMeals.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16 }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🥗</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>No meals logged yet</p>
              <p style={{ fontSize: 13, color: '#475569' }}>Tap "Log a meal" below to add your first meal.</p>
            </div>
          )}

          {todayMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={() => deleteMeal(meal.id)} />
          ))}

          {showForm ? (
            <Card>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Log a Meal</h3>
              {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</p>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input placeholder="Meal name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                  <input placeholder="Time (e.g. 6:30 PM)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
                </div>
                <input placeholder="Food items (comma-separated)" value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
                  {(['calories', 'protein', 'carbs', 'fat'] as const).map(field => (
                    <input key={field} placeholder={field === 'calories' ? 'Calories *' : `${field.charAt(0).toUpperCase() + field.slice(1)} g`} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} type="number" min="0" style={inputStyle} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Save Meal</button>
                  <button type="button" onClick={() => { setShowForm(false); setError('') }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                </div>
              </form>
            </Card>
          ) : (
            <button onClick={() => setShowForm(true)} style={{ background: 'transparent', border: '2px dashed #2a2a3e', borderRadius: 14, padding: 18, color: '#475569', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>
              + Log a meal
            </button>
          )}
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {summaryCard}
            {waterCard}
          </div>
        )}
      </div>
    </div>
  )
}

function MealCard({ meal, onDelete }: { meal: { id: string; name: string; time: string; items: string[]; calories: number; protein: number; carbs: number; fat: number }; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 12, color: '#475569', marginBottom: 2 }}>{meal.time}</p>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>{meal.name}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#f97316' }}>{meal.calories}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>kcal</p>
          </div>
          {confirming ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={onDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
              <button onClick={() => setConfirming(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} style={{ background: 'transparent', border: 'none', color: '#334155', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>⋯</button>
          )}
        </div>
      </div>
      {meal.items.length > 0 && (
        <div style={{ marginBottom: 10 }}>
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
