import { useState, useRef, useEffect } from 'react'
import { useVision } from '../context/VisionContext'

interface Props {
  goalId: string
  goalTitle: string
  category: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const OPENER = `Hey! I'm here to help you develop your goal into something clear and achievable. Tell me — what does achieving this goal mean to you? What excites you most about it?`

export default function GoalChat({ goalId, goalTitle, category }: Props) {
  const { conversations, addConversationMessage, addMeasurables } = useVision()

  const savedMsgs = conversations
    .filter(c => c.goal_id === goalId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(c => ({ role: c.role, content: c.content }))

  const [messages, setMessages] = useState<Message[]>(
    savedMsgs.length > 0 ? savedMsgs : [{ role: 'assistant', content: OPENER }]
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError('')

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    await addConversationMessage(goalId, 'user', text)

    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/vision-goal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalTitle, category, history, userMessage: text }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json() as { reply: string; extractedMeasurables?: string[] }

      const assistantMsg: Message = { role: 'assistant', content: data.reply }
      setMessages(prev => [...prev, assistantMsg])
      await addConversationMessage(goalId, 'assistant', data.reply)

      if (data.extractedMeasurables && data.extractedMeasurables.length > 0) {
        await addMeasurables(goalId, data.extractedMeasurables)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 14,
              lineHeight: 1.55,
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--text-subtle)',
                  animation: 'pulse 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 12,
        display: 'flex',
        gap: 8,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Share your thoughts… (Enter to send)"
          rows={2}
          style={{
            flex: 1,
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14,
            color: 'var(--text)',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 10,
            padding: '0 18px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            opacity: input.trim() && !loading ? 1 : 0.5,
            alignSelf: 'stretch',
            transition: 'opacity 0.15s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
