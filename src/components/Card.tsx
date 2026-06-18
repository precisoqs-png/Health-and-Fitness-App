import type { CSSProperties, ReactNode } from 'react'

export default function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  )
}
