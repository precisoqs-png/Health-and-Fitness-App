import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '📊' },
  { to: '/workouts', label: 'Cardio', icon: '🏃' },
  { to: '/programs', label: 'Training', icon: '🏋️' },
  { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { to: '/vision-board', label: 'Vision', icon: '✨' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--card)',
      borderTop: '1px solid #2a2a3e',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 4px',
            textDecoration: 'none',
            color: isActive ? 'var(--accent)' : 'var(--text-subtle)',
            fontSize: 10,
            fontWeight: 500,
            gap: 4,
            transition: 'color 0.15s',
          })}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
