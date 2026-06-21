import { useState, useMemo } from 'react'
import { useToast } from '../context/ToastContext'
import { useApp, todayISO } from '../context/AppContext'
import type { FoodItem } from '../context/AppContext'
import { useMobile } from '../hooks/useMobile'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import { BUILT_IN_FOODS } from '../data/foods'

type Tab = 'log' | 'database' | 'myfoods'

const emptyMealForm = { name: '', time: '' }
const emptyCustomFood = { name: '', calories: '', protein: '', carbs: '', fat: '', servingSize: '100', category: 'Other' }

export default function Nutrition() {
  const { meals, addMeal, deleteMeal, profile, dailyLog, addWater, customFoods, addCustomFood, deleteCustomFood } = useApp()
  const { showToast } = useToast()
  const isMobile = useMobile()
  const [tab, setTab] = useState<Tab>('log')
  const [showForm, setShowForm] = useState(false)
  const [mealForm, setMealForm] = useState(emptyMealForm)
  const [selectedItems, setSelectedItems] = useState<Array<{ food: FoodItem; grams: number; mode: 'g' | 'srv'; serves: number }>>([])
  const [foodSearch, setFoodSearch] = useState('')
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false)
  const [customFoodForm, setCustomFoodForm] = useState(emptyCustomFood)
  const [dbSearch, setDbSearch] = useState('')
  const [dbCategory, setDbCategory] = useState('All')

  const todayMeals = meals.filter(m => m.date?.slice(0, 10) === todayISO())
  const totalCalories = todayMeals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = todayMeals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = todayMeals.reduce((s, m) => s + m.fat, 0)
  const { dailyCalorieGoal: calGoal, proteinGoal, carbsGoal, fatGoal } = profile

  const allFoods = useMemo(() => [...BUILT_IN_FOODS, ...customFoods], [customFoods])

  const searchResults = useMemo(() => {
    if (!foodSearch.trim()) return []
    const q = foodSearch.toLowerCase()
    return allFoods.filter(f => f.name.toLowerCase().includes(q)).slice(0, 8)
  }, [foodSearch, allFoods])

  // Calculated totals from selected items
  function effG({ food, grams, mode, serves }: typeof selectedItems[0]) {
    return mode === 'srv' ? Math.round(serves * food.servingSize) : grams
  }
  const itemCalories = selectedItems.reduce((s, item) => s + Math.round(item.food.calories * effG(item) / 100), 0)
  const itemProtein = selectedItems.reduce((s, item) => s + Math.round(item.food.protein * effG(item) / 100), 0)
  const itemCarbs = selectedItems.reduce((s, item) => s + Math.round(item.food.carbs * effG(item) / 100), 0)
  const itemFat = selectedItems.reduce((s, item) => s + Math.round(item.food.fat * effG(item) / 100), 0)

  function addFoodToMeal(food: FoodItem) {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.food.id === food.id)
      if (existing) return prev
      return [...prev, { food, grams: food.servingSize, mode: 'srv' as const, serves: 1 }]
    })
    setFoodSearch('')
  }

  function handleLogMeal(e: React.FormEvent) {
    e.preventDefault()
    if (!mealForm.name) { showToast('Meal name is required', 'error'); return }
    if (selectedItems.length === 0 && itemCalories === 0) { showToast('Add at least one food item', 'error'); return }
    addMeal({
      name: mealForm.name,
      time: mealForm.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      items: selectedItems.map(item => `${item.food.name} (${effG(item)}g)`),
      calories: itemCalories,
      protein: itemProtein,
      carbs: itemCarbs,
      fat: itemFat,
      date: new Date().toISOString(),
    })
    setMealForm(emptyMealForm)
    setSelectedItems([])
    setShowForm(false)
    showToast('Meal logged ✓')
  }

  function handleAddCustomFood(e: React.FormEvent) {
    e.preventDefault()
    if (!customFoodForm.name || !customFoodForm.calories) { showToast('Name and calories are required', 'error'); return }
    addCustomFood({
      name: customFoodForm.name,
      calories: Number(customFoodForm.calories),
      protein: Number(customFoodForm.protein) || 0,
      carbs: Number(customFoodForm.carbs) || 0,
      fat: Number(customFoodForm.fat) || 0,
      servingSize: Number(customFoodForm.servingSize) || 100,
      category: customFoodForm.category,
    })
    setCustomFoodForm(emptyCustomFood)
    setShowCustomFoodForm(false)
    showToast('Custom food saved ✓')
  }

  const categories = ['All', ...Array.from(new Set(BUILT_IN_FOODS.map(f => f.category)))]
  const filteredDb = BUILT_IN_FOODS.filter(f =>
    (dbCategory === 'All' || f.category === dbCategory) &&
    (!dbSearch || f.name.toLowerCase().includes(dbSearch.toLowerCase()))
  )

  const summaryCard = (
    <Card>
      <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Daily Summary</h2>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <p style={{ fontSize: 42, fontWeight: 800, color: totalCalories > calGoal ? '#ef4444' : 'var(--accent)' }}>{totalCalories}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>of {calGoal} kcal goal</p>
        <div style={{ marginTop: 10 }}>
          <ProgressBar pct={Math.min(100, Math.round(totalCalories / calGoal * 100))} color={totalCalories > calGoal ? '#ef4444' : 'var(--accent)'} height={10} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          {calGoal - totalCalories > 0 ? `${calGoal - totalCalories} kcal remaining` : `${totalCalories - calGoal} kcal over goal`}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Protein', current: totalProtein, goal: proteinGoal, color: '#22c55e' },
          { label: 'Carbs', current: totalCarbs, goal: carbsGoal, color: 'var(--accent)' },
          { label: 'Fat', current: totalFat, goal: fatGoal, color: '#a855f7' },
        ].map(({ label, current, goal, color }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{current}g / {goal}g</span>
            </div>
            <ProgressBar pct={Math.min(100, Math.round((current / goal) * 100))} color={color} height={7} />
          </div>
        ))}
      </div>
    </Card>
  )

  const waterCard = (
    <Card>
      <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Hydration</h2>
      <div style={{ flex: 1, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{dailyLog.water.toFixed(1)}L</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13, alignSelf: 'flex-end' }}>of {profile.waterGoal}L</span>
        </div>
        <ProgressBar pct={Math.min(100, Math.round(dailyLog.water / profile.waterGoal * 100))} color="var(--accent)" height={8} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0.25, 0.5, 1].map(amt => (
          <button key={amt} onClick={() => addWater(amt)} style={{ flex: 1, background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)', borderRadius: 8, padding: '7px 0', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            +{amt}L
          </button>
        ))}
        {dailyLog.water > 0 && (
          <button onClick={() => addWater(-0.25)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '7px 10px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>-</button>
        )}
      </div>
    </Card>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Nutrition</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track food, macros and hydration</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 10, padding: 4, marginBottom: 20, border: '1px solid #2a2a3e' }}>
        {([['log', "Today's Log"], ['database', 'Food Database'], ['myfoods', 'My Foods']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? 12 : 14, background: tab === key ? 'var(--accent)' : 'transparent', color: tab === key ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* TODAY'S LOG TAB */}
      {tab === 'log' && (
        <>
          {isMobile && <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>{summaryCard}{waterCard}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {todayMeals.length === 0 && !showForm && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card)', border: '1px solid #2a2a3e', borderRadius: 16 }}>
                  <p style={{ fontSize: 36, marginBottom: 10 }}>🥗</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>No meals logged yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Tap "Log a meal" to add your first meal.</p>
                </div>
              )}
              {todayMeals.map(meal => (
                <MealCard key={meal.id} meal={meal} onDelete={() => { deleteMeal(meal.id); showToast('Meal deleted', 'info') }} />
              ))}

              {showForm ? (
                <Card>
                  <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Log a Meal</h3>
                  <form onSubmit={handleLogMeal} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input placeholder="Meal name *" value={mealForm.name} onChange={e => setMealForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                      <input placeholder="Time (e.g. 7:30 AM)" value={mealForm.time} onChange={e => setMealForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
                    </div>

                    {/* Food search */}
                    <div style={{ position: 'relative' }}>
                      <input placeholder="Search food database..." value={foodSearch} onChange={e => setFoodSearch(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 36 }} />
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', fontSize: 14 }}>🔍</span>
                      {searchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid #2a2a3e', borderRadius: 8, zIndex: 50, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                          {searchResults.map(food => (
                            <button key={food.id} type="button" onClick={() => addFoodToMeal(food)}
                              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid #1e1e2e', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}>
                              <span>{food.name}{food.isCustom ? ' ★' : ''}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{food.calories} kcal/100g</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected food items */}
                    {selectedItems.length > 0 && (
                      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedItems.map(({ food, grams, mode, serves }, idx) => {
                          const effectiveGrams = mode === 'srv' ? Math.round(serves * food.servingSize) : grams
                          const kcal = Math.round(food.calories * effectiveGrams / 100)
                          return (
                            <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', minWidth: 100 }}>{food.name}</span>
                              <input type="number" min={mode === 'srv' ? 0.25 : 1} step={mode === 'srv' ? 0.25 : 1}
                                value={mode === 'srv' ? serves : grams}
                                onChange={e => setSelectedItems(prev => prev.map((item, i) => {
                                  if (i !== idx) return item
                                  const val = Number(e.target.value)
                                  return mode === 'srv' ? { ...item, serves: val } : { ...item, grams: val }
                                }))}
                                style={{ ...inputStyle, width: 64, padding: '6px 8px', fontSize: 13, textAlign: 'center' }} />
                              {/* g / srv toggle */}
                              <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #2a2a3e', fontSize: 12 }}>
                                {(['g', 'srv'] as const).map(m => (
                                  <button key={m} type="button"
                                    onClick={() => setSelectedItems(prev => prev.map((item, i) => i !== idx ? item : {
                                      ...item, mode: m,
                                      grams: m === 'g' ? item.food.servingSize : item.grams,
                                      serves: m === 'srv' ? 1 : item.serves,
                                    }))}
                                    style={{ padding: '4px 8px', background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                    {m === 'srv' ? 'srv' : 'g'}
                                  </button>
                                ))}
                              </div>
                              {mode === 'srv' && (
                                <span style={{ fontSize: 11, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>~{effectiveGrams}g</span>
                              )}
                              <span style={{ fontSize: 13, color: 'var(--accent)', width: 56, textAlign: 'right', flexShrink: 0 }}>{kcal} kcal</span>
                              <button type="button" onClick={() => setSelectedItems(prev => prev.filter((_, i) => i !== idx))}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>
                            </div>
                          )
                        })}
                        <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Total</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{itemCalories} kcal · P:{itemProtein}g C:{itemCarbs}g F:{itemFat}g</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Save Meal</button>
                      <button type="button" onClick={() => { setShowForm(false); setSelectedItems([]); setFoodSearch('') }}
                        style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                    </div>
                  </form>
                </Card>
              ) : (
                <button onClick={() => setShowForm(true)} style={{ background: 'transparent', border: '2px dashed #2a2a3e', borderRadius: 14, padding: 18, color: 'var(--text-subtle)', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>
                  + Log a meal
                </button>
              )}
            </div>
            {!isMobile && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{summaryCard}{waterCard}</div>}
          </div>
        </>
      )}

      {/* FOOD DATABASE TAB */}
      {tab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 2 }}>
                <input placeholder="Search foods..." value={dbSearch} onChange={e => setDbSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>🔍</span>
              </div>
              <select value={dbCategory} onChange={e => setDbCategory(e.target.value)}
                style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '6px 10px', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                <span>Food</span><span style={{ textAlign: 'right' }}>Cal</span><span style={{ textAlign: 'right' }}>P</span><span style={{ textAlign: 'right' }}>C</span><span style={{ textAlign: 'right' }}>F</span>
              </div>
              {filteredDb.map(food => (
                <div key={food.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 10px', background: 'var(--bg)', borderRadius: 8, fontSize: 14 }}>
                  <div>
                    <p style={{ color: 'var(--text)', fontWeight: 500 }}>{food.name}</p>
                    <p style={{ color: 'var(--text-subtle)', fontSize: 11 }}>per 100g · serving: {food.servingSize}g</p>
                  </div>
                  <span style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>{food.calories}</span>
                  <span style={{ textAlign: 'right', color: '#22c55e' }}>{food.protein}g</span>
                  <span style={{ textAlign: 'right', color: 'var(--accent)' }}>{food.carbs}g</span>
                  <span style={{ textAlign: 'right', color: '#a855f7' }}>{food.fat}g</span>
                </div>
              ))}
              {filteredDb.length === 0 && <p style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: '24px 0' }}>No foods found</p>}
            </div>
          </Card>
        </div>
      )}

      {/* MY FOODS TAB */}
      {tab === 'myfoods' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {customFoods.length === 0 && !showCustomFoodForm && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card)', border: '1px solid #2a2a3e', borderRadius: 16 }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🍽️</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 }}>No custom foods yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Create your own foods with exact macros.</p>
            </div>
          )}

          {customFoods.map(food => (
            <Card key={food.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{food.name} <span style={{ fontSize: 12, color: 'var(--accent)' }}>★ custom</span></p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>per 100g — {food.calories} kcal · P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                  <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 1 }}>Default serving: {food.servingSize}g · {food.category}</p>
                </div>
                <button onClick={() => { deleteCustomFood(food.id); showToast('Food deleted', 'info') }}
                  style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '6px 10px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </Card>
          ))}

          {showCustomFoodForm ? (
            <Card>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Create Custom Food</h3>
              <form onSubmit={handleAddCustomFood} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Food name *" value={customFoodForm.name} onChange={e => setCustomFoodForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Calories (per 100g) *</p>
                    <input type="number" min={0} value={customFoodForm.calories} onChange={e => setCustomFoodForm(f => ({ ...f, calories: e.target.value }))} style={inputStyle} placeholder="e.g. 165" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Protein g</p>
                    <input type="number" min={0} step={0.1} value={customFoodForm.protein} onChange={e => setCustomFoodForm(f => ({ ...f, protein: e.target.value }))} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Carbs g</p>
                    <input type="number" min={0} step={0.1} value={customFoodForm.carbs} onChange={e => setCustomFoodForm(f => ({ ...f, carbs: e.target.value }))} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Fat g</p>
                    <input type="number" min={0} step={0.1} value={customFoodForm.fat} onChange={e => setCustomFoodForm(f => ({ ...f, fat: e.target.value }))} style={inputStyle} placeholder="0" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Default serving (g)</p>
                    <input type="number" min={1} value={customFoodForm.servingSize} onChange={e => setCustomFoodForm(f => ({ ...f, servingSize: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Category</p>
                    <select value={customFoodForm.category} onChange={e => setCustomFoodForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['Protein', 'Carbs', 'Fruit', 'Vegetables', 'Dairy', 'Fats', 'Legumes', 'Snacks', 'Beverages', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Save Food</button>
                  <button type="button" onClick={() => setShowCustomFoodForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                </div>
              </form>
            </Card>
          ) : (
            <button onClick={() => setShowCustomFoodForm(true)} style={{ background: 'transparent', border: '2px dashed #2a2a3e', borderRadius: 14, padding: 18, color: 'var(--text-subtle)', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>
              + Create custom food
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function MealCard({ meal, onDelete }: { meal: { id: string; name: string; time: string; items: string[]; calories: number; protein: number; carbs: number; fat: number }; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 2 }}>{meal.time}</p>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>{meal.name}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{meal.calories}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>kcal</p>
          </div>
          {confirming ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={onDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
              <button onClick={() => setConfirming(false)} style={{ background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>x</button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} style={{ background: 'transparent', border: 'none', color: '#334155', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>...</button>
          )}
        </div>
      </div>
      {meal.items.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {meal.items.map(item => (
            <p key={item} style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>* {item}</p>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #1e1e2e' }}>
        <span style={{ fontSize: 13, color: '#22c55e' }}>P: {meal.protein}g</span>
        <span style={{ fontSize: 13, color: 'var(--accent)' }}>C: {meal.carbs}g</span>
        <span style={{ fontSize: 13, color: '#a855f7' }}>F: {meal.fat}g</span>
      </div>
    </Card>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid #2a2a3e', borderRadius: 8,
  padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
