import type { CSSProperties, ReactNode } from 'react'

export default function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  )
}
