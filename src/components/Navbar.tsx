import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/workouts', label: 'Workouts', icon: '💪' },
  { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { to: '/progress', label: 'Progress', icon: '📈' },
]

export default function Navbar() {
  return (
    <nav style={{ background: '#13131f', borderBottom: '1px solid #2a2a3e' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#f97316', letterSpacing: '-0.5px' }}>Velocity Fitness</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? '#f97316' : '#94a3b8',
                background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
