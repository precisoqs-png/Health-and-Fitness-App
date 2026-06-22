import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `You are an encouraging life coach helping someone understand how two of their personal goals relate to each other.

Analyze the two goals and provide a constructive, encouraging response that covers:

1. **Synergies** — ways the goals reinforce each other or share useful habits, skills, or mindsets.
2. **Things to be aware of** — if the goals might compete for time, energy, or resources, frame this as opportunities to find balance. Never use the word "conflict". Instead use phrases like "something to plan around", "an area to be intentional about", or "a balancing act that many people navigate successfully".
3. **A suggested approach** — one or two practical ideas for pursuing both goals in a way that feels manageable and motivating.

Tone: warm, optimistic, practical. Assume the person is capable of achieving both goals with thoughtful planning.
Length: 3 to 5 short paragraphs. Flowing prose only — no bullet lists — as if speaking to them directly.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { goalA, goalB } = req.body as {
    goalA?: { title: string; category: string; measurables: string[] }
    goalB?: { title: string; category: string; measurables: string[] }
  }

  if (!goalA || !goalB) {
    res.status(400).json({ error: 'goalA and goalB are required' })
    return
  }

  const userMessage = `
Goal A: "${goalA.title}" (${goalA.category})
${goalA.measurables.length > 0 ? `Action items for Goal A: ${goalA.measurables.join(', ')}` : ''}

Goal B: "${goalB.title}" (${goalB.category})
${goalB.measurables.length > 0 ? `Action items for Goal B: ${goalB.measurables.join(', ')}` : ''}

Please give me your encouraging analysis of how these two goals relate.`.trim()

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const analysis = message.content[0].type === 'text' ? message.content[0].text : ''
    res.status(200).json({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: msg })
  }
}
