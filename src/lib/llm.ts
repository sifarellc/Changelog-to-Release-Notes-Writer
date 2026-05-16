const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001'

export const SYSTEM_PROMPT = `You are a release notes writer. Transform raw development notes into polished, user-facing release notes.

Rules:
- Focus on user impact, not technical implementation details
- Use the specified brand voice/tone
- Group related changes under clear headings
- Use bullet points for individual items
- Keep it concise — if something isn't user-facing, omit it
- Never mention internal details like commit hashes, PR numbers, or Jira IDs`

export async function callLLM(userMessage: string): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'ReleaseNotes.ai',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
