'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function updateProfile(nome: string, whatsapp: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Format WhatsApp number to keep only digits
  const cleanWhatsapp = whatsapp.replace(/\D/g, '')

  const { error } = await supabase
    .from('profiles')
    .update({ nome, whatsapp: cleanWhatsapp })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function selectFreePlan() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ plano: 'free', assinatura_ativa: false })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function createCheckoutSession() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Arium Flow Pro',
            description: 'Controle de gastos ilimitado com assistente Inteligente no WhatsApp',
          },
          unit_amount: 2990, // R$ 29,90
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
    },
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
  })

  return { url: session.url }
}
