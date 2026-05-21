import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { callLLM } from '@/lib/llm'
import { ratelimit } from '@/lib/rate-limit'
import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const FREE_MONTHLY_LIMIT = 3
const PREVIEW_TTL = 600 // 10 minutes

async function generateNotes(rawNotes: string, tone: string): Promise<string> {
  const toneGuide: Record<string, string> = {
    casual: 'Friendly and approachable. Use contractions, light humor, and conversational language.',
    professional: 'Clear and business-appropriate. Confident but not stuffy. Focus on value.',
    technical: 'Precise and detailed. Can include technical terms. Audience is developers.',
  }

  const selectedTone = toneGuide[tone] || toneGuide.professional

  return callLLM(
    `Brand voice: ${selectedTone}\n\nRaw notes:\n${rawNotes}\n\nWrite the release notes:`
  )
}

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json()
  const { rawNotes, tone } = body

  if (!rawNotes || typeof rawNotes !== 'string') {
    return NextResponse.json({ error: 'rawNotes is required' }, { status: 400 })
  }

  // --- Signed-in user flow ---
  if (session?.user?.email) {
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

    const { success } = await ratelimit.limit(session.user.email)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const releaseNotes = await generateNotes(rawNotes, tone)

    if (!hasActiveSub) {
      await prisma.user.update({
        where: { id: user.id },
        data: { freeUses: { increment: 1 } },
      })
    }

    // Store in Redis so the user can retrieve after page refresh
    const sessionId = `user:${user.id}:${Date.now()}`
    await redis.set(sessionId, releaseNotes, { ex: PREVIEW_TTL })

    return NextResponse.json({
      releaseNotes,
      remaining: hasActiveSub ? null : FREE_MONTHLY_LIMIT - user.freeUses - 1,
      sessionId,
    })
  }

  // --- Anonymous preview flow ---
  // Rate-limit by IP-ish identifier (use a generous limit)
  const anonId = req.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await ratelimit.limit(`anon:${anonId}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment or sign in.' },
      { status: 429 }
    )
  }

  const releaseNotes = await generateNotes(rawNotes, tone)

  // Store in Redis with short TTL so user can retrieve after sign-in
  const sessionId = `preview:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`
  await redis.set(sessionId, releaseNotes, { ex: PREVIEW_TTL })

  return NextResponse.json({
    releaseNotes,
    preview: true,
    sessionId,
  })
}
