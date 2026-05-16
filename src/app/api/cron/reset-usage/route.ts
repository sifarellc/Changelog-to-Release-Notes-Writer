import { prisma } from '../../../../../src/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await prisma.user.updateMany({
    where: { freeUses: { gt: 0 } },
    data: { freeUses: 0 },
  })

  return NextResponse.json({
    success: true,
    reset: result.count,
    timestamp: new Date().toISOString(),
  })
}
