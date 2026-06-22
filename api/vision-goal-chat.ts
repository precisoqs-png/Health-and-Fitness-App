import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `You are an encouraging personal life coach helping the user develop and achieve their goal.

Your role:
- Ask thoughtful, open-ended questions to help the user clarify their vision, motivations, and concrete steps.
- After the user provides enough detail, extract specific, measurable action items they can check off.
- When you identify measurable action items, list them in a special block at the END of your message (after your conversational reply), using this EXACT format — nothing else after this block:
\`\`\`measurables
["Action item 1", "Action item 2"]
\`\`\`
Only include this block when you have identified new, concrete action items not already listed. Keep action items short (under 10 words each) and specific.

Tone rules:
- Always be warm, encouraging, and constructive. Never use language that implies failure, inadequacy, or judgment.
- Frame challenges as opportunities and setbacks as learning experiences.
- Celebrate progress, however small.
- Keep replies concise — 2 to 4 short paragraphs.

Scope guardrails (IMPORTANT):
- If the user asks for specific medical advice (dosages, diagnoses, treatment plans, medication recommendations), gently acknowledge their question, explain you are not a medical professional, and redirect: "That's worth discussing with a healthcare provider — let's focus on the lifestyle and goal-setting side that I can really support you with."
- Apply the same redirection for specific legal advice (contracts, liability, legal strategy) and specific financial advice (investment picks, tax strategies, specific portfolio allocations). Always redirect constructively, never dismissively.
- You may discuss general wellness principles, goal-setting frameworks, habit building, motivation, and planning strategies freely.`

function buildSystemPrompt(goalTitle: string, category: string): string {
  return `${SYSTEM_PROMPT}\n\nThe user's current goal is: "${goalTitle}" (category: ${category}).`
}

function extractMeasurables(text: string): { reply: string; measurables: string[] | null } {
  const blockMatch = text.match(/```measurables\s*\n([\s\S]*?)```/)
  if (!blockMatch) return { reply: text.trim(), measurables: null }

  const jsonStr = blockMatch[1].trim()
  let measurables: string[] | null = null
  try {
    measurables = JSON.parse(jsonStr)
  } catch { /* ignore parse errors */ }

  const reply = text.slice(0, blockMatch.index).trim()
  return { reply, measurables }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { goalTitle, category, history, userMessage } = req.body as {
    goalTitle?: string
    category?: string
    history?: { role: 'user' | 'assistant'; content: string }[]
    userMessage?: string
  }

  if (!goalTitle || !userMessage) {
    res.status(400).json({ error: 'goalTitle and userMessage are required' })
    return
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...(history ?? []),
      { role: 'user', content: userMessage.trim() },
    ]

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystemPrompt(goalTitle, category ?? 'General'),
      messages,
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const { reply, measurables } = extractMeasurables(rawText)

    res.status(200).json({
      reply,
      ...(measurables ? { extractedMeasurables: measurables } : {}),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: msg })
  }
}
