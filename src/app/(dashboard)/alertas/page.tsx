import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertasForm } from '@/components/dashboard/AlertasForm'

export const dynamic = 'force-dynamic'

export default async function AlertasPage() {
  const supabase = await createClient()

  // Get User
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get limits and configs
  const [
    { data: profile },
    { data: alertas }
  ] = await Promise.all([
    supabase.from('profiles').select('limite_mensal').eq('id', user.id).single(),
    supabase.from('alertas').select('*').eq('user_id', user.id)
  ])

  const limiteMensal = profile?.limite_mensal || 0
  const initialAlertas = alertas || []

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Alertas do WhatsApp</h1>
        <p className="text-gray-400">Configure quando nossa IA deve avisar você sobre seus gastos.</p>
      </div>

      <AlertasForm 
        userId={user.id} 
        limiteMensal={limiteMensal} 
        initialAlertas={initialAlertas} 
      />
    </div>
  )
}
