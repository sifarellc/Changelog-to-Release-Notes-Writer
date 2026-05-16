import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { callLLM } from '@/lib/llm'
import { ratelimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

const FREE_MONTHLY_LIMIT = 3

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const hasActiveSub = user.subscription?.status === 'active'
  if (!hasActiveSub && user.freeUses >= FREE_MONTHLY_LIMIT) {
    return NextResponse.json(
      { error: 'Free limit reached. Upgrade to continue.', upgrade: true },
      { status: 402 }
    )
  }

  // Rate limiting
  const { success, limit, remaining: rlRemaining, reset } = await ratelimit.limit(session.user.email)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': rlRemaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  const { rawNotes, tone } = await req.json()

  if (!rawNotes || typeof rawNotes !== 'string') {
    return NextResponse.json({ error: 'rawNotes is required' }, { status: 400 })
  }

  const toneGuide: Record<string, string> = {
    casual: 'Friendly and approachable. Use contractions, light humor, and conversational language.',
    professional: 'Clear and business-appropriate. Confident but not stuffy. Focus on value.',
    technical: 'Precise and detailed. Can include technical terms. Audience is developers.',
  }

  const selectedTone = toneGuide[tone] || toneGuide.professional

  const releaseNotes = await callLLM(
    `Brand voice: ${selectedTone}\n\nRaw notes:\n${rawNotes}\n\nWrite the release notes:`
  )

  // Increment usage
  if (!hasActiveSub) {
    await prisma.user.update({
      where: { id: user.id },
      data: { freeUses: { increment: 1 } },
    })
  }

  return NextResponse.json({
    releaseNotes,
    remaining: hasActiveSub ? null : FREE_MONTHLY_LIMIT - user.freeUses - 1,
  })
}
