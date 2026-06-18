const meals = [
  {
    time: '7:30 AM',
    name: 'Breakfast',
    items: ['Oatmeal with berries', 'Greek yogurt', 'Black coffee'],
    calories: 420,
    protein: 28,
    carbs: 58,
    fat: 9,
  },
  {
    time: '12:00 PM',
    name: 'Lunch',
    items: ['Grilled chicken breast', 'Brown rice', 'Steamed broccoli', 'Olive oil dressing'],
    calories: 610,
    protein: 48,
    carbs: 62,
    fat: 14,
  },
  {
    time: '3:30 PM',
    name: 'Snack',
    items: ['Protein shake', 'Banana', 'Almonds (30g)'],
    calories: 340,
    protein: 32,
    carbs: 38,
    fat: 8,
  },
]

const totalCalories = meals.reduce((s, m) => s + m.calories, 0)
const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0)
const totalFat = meals.reduce((s, m) => s + m.fat, 0)

const calGoal = 2200
const proteinGoal = 160
const carbsGoal = 220
const fatGoal = 65

function MacroBar({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
  const pct = Math.min(100, Math.round((current / goal) * 100))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 14, color: '#64748b' }}>{current}g / {goal}g</span>
      </div>
      <div style={{ background: '#1e1e2e', borderRadius: 100, height: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100 }} />
      </div>
      <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{pct}%</p>
    </div>
  )
}

export default function Nutrition() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Nutrition Log</h1>
        <p style={{ color: '#64748b' }}>Today's food intake and macro breakdown</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Meals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {meals.map(({ time, name, items, calories, protein, carbs, fat }) => (
            <div key={name} style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 2 }}>{time}</p>
                  <h3 style={{ fontWeight: 600, fontSize: 18 }}>{name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>{calories}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>kcal</p>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                {items.map((item) => (
                  <p key={item} style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8 }}>• {item}</p>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid #1e1e2e' }}>
                <span style={{ fontSize: 13, color: '#22c55e' }}>P: {protein}g</span>
                <span style={{ fontSize: 13, color: '#f97316' }}>C: {carbs}g</span>
                <span style={{ fontSize: 13, color: '#3b82f6' }}>F: {fat}g</span>
              </div>
            </div>
          ))}

          <button style={{
            background: 'transparent',
            border: '2px dashed #2a2a3e',
            borderRadius: 16,
            padding: 20,
            color: '#475569',
            fontSize: 15,
            cursor: 'pointer',
            fontWeight: 500,
          }}>
            + Log a meal
          </button>
        </div>

        {/* Macro Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Daily Summary</h2>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 48, fontWeight: 800, color: '#f97316' }}>{totalCalories}</p>
              <p style={{ color: '#64748b' }}>of {calGoal} kcal</p>
              <div style={{ background: '#1e1e2e', borderRadius: 100, height: 10, marginTop: 12 }}>
                <div style={{ width: `${Math.round(totalCalories / calGoal * 100)}%`, height: '100%', background: '#f97316', borderRadius: 100 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <MacroBar label="Protein" current={totalProtein} goal={proteinGoal} color="#22c55e" />
              <MacroBar label="Carbs" current={totalCarbs} goal={carbsGoal} color="#f97316" />
              <MacroBar label="Fat" current={totalFat} goal={fatGoal} color="#3b82f6" />
            </div>
          </div>

          <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Hydration</h2>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>💧</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>1.8 L</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>of 2.5 L goal</p>
              <div style={{ background: '#1e1e2e', borderRadius: 100, height: 8, marginTop: 16 }}>
                <div style={{ width: '72%', height: '100%', background: '#3b82f6', borderRadius: 100 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
