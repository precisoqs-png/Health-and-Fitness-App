import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 40 }}>⚡</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f97316', letterSpacing: '-1px', marginTop: 8 }}>Velocity Fitness</h1>
          <p style={{ color: '#64748b', marginTop: 6 }}>Track. Train. Transform.</p>
        </div>

        <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 32 }}>
          <div style={{ display: 'flex', marginBottom: 28, background: '#0f0f1a', borderRadius: 10, padding: 4 }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  background: mode === m ? '#f97316' : 'transparent',
                  color: mode === m ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />

            {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
            {message && <p style={{ color: '#22c55e', fontSize: 13 }}>{message}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#7c3614' : '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '13px',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0f0f1a',
  border: '1px solid #2a2a3e',
  borderRadius: 8,
  padding: '12px 14px',
  color: '#e2e8f0',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
