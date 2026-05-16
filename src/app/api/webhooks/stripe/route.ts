import { prisma } from '../../../../../src/lib/db'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: session.customer as string },
        })
        if (user) {
          await prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stripeSubId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status,
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
            update: {
              status: subscription.status,
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
          })
        }
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await prisma.subscription.update({
        where: { stripeSubId: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
