import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Current Month String YYYY-MM
    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    const elapsedDays = date.getDate()
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const remainingDays = daysInMonth - elapsedDays

    // Buscar perfil, gastos e receitas do mês
    const [
      { data: profile },
      { data: gastos },
      { data: receitas }
    ] = await Promise.all([
      supabase.from('profiles').select('limite_mensal').eq('id', user.id).single(),
      supabase.from('gastos').select('valor, data_gasto, criado_em').eq('user_id', user.id),
      supabase.from('receitas').select('valor, data_receita, criado_em').eq('user_id', user.id)
    ])

    // Calcular totais do mês
    const totalGastos = gastos?.reduce((acc, curr) => {
      const isCurrentMonth = curr.data_gasto?.startsWith(currentMonth) || curr.criado_em?.startsWith(currentMonth)
      return isCurrentMonth ? acc + Number(curr.valor || 0) : acc
    }, 0) || 0

    const totalReceitas = receitas?.reduce((acc, curr) => {
      const isCurrentMonth = curr.data_receita?.startsWith(currentMonth) || curr.criado_em?.startsWith(currentMonth)
      return isCurrentMonth ? acc + Number(curr.valor || 0) : acc
    }, 0) || 0

    // Orçamento diário restante: (receitas - gastos) / dias restantes
    // Se não tiver receitas, usa o limite mensal do perfil
    const baseDisponivel = totalReceitas > 0 ? totalReceitas : (profile?.limite_mensal || 0)
    const orcamentoDiarioRestante = remainingDays > 0 ? (baseDisponivel - totalGastos) / remainingDays : 0

    return NextResponse.json({
      orcamentoDiarioRestante: Math.max(0, orcamentoDiarioRestante), // Não permite negativo
      totalGastos,
      totalReceitas,
      baseDisponivel,
      remainingDays,
      elapsedDays,
      daysInMonth
    })
  } catch (error) {
    console.error('Erro ao calcular orçamento diário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
