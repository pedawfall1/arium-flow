import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // We need the admin client to bypass RLS in the webhook securely
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Or anon key + DB functions bypassing RLS. But typically service role is used for sensitive webhooks.
  )

  const session = event.data.object as Stripe.Checkout.Session

  // Verify and Process Webhook Event
  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    const userId = session.metadata?.userId

    if (userId) {
      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          assinatura_ativa: true,
          plano: 'pro',
        })
        .eq('id', userId)

      await supabase.from('stripe_eventos').insert({
        stripe_event_id: event.id,
        tipo: event.type,
        payload: event,
        processado: true,
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await supabase
      .from('profiles')
      .update({ assinatura_ativa: false, plano: 'free' })
      .eq('stripe_subscription_id', subscription.id)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any
    await supabase
      .from('profiles')
      .update({ assinatura_ativa: false })
      .eq('stripe_subscription_id', invoice.subscription as string)
      // The instruction mentions: n8n notifies user. n8n will probably query this table via cron or Supabase trigger.
  }

  return new NextResponse(null, { status: 200 })
}
