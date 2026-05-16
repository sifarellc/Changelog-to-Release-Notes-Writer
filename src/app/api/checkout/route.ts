import { auth } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/db'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email })
    stripeCustomerId = customer.id
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
