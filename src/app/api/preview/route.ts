import { auth } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const releaseNotes = await redis.get<string>(sessionId)
  if (!releaseNotes) {
    return NextResponse.json({ error: 'Session expired' }, { status: 404 })
  }

  return NextResponse.json({ releaseNotes })
}
