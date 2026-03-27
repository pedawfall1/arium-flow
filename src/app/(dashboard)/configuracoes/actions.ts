'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(nome: string, whatsapp: string, limite_mensal: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Format WhatsApp number to keep only digits
  const cleanWhatsapp = whatsapp.replace(/\D/g, '')

  const { error } = await supabase
    .from('profiles')
    .update({ 
      nome, 
      whatsapp: cleanWhatsapp, 
      limite_mensal 
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
