import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResumoCards } from '@/components/dashboard/ResumoCards'
import { GraficoCategoria } from '@/components/dashboard/GraficoCategoria'
import { GraficoDiario } from '@/components/dashboard/GraficoDiario'
import { TabelaGastos } from '@/components/dashboard/TabelaGastos'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Current Month String YYYY-MM
  const date = new Date()
  const currentMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`

  const [
    { data: profile },
    { data: gastos },
    { data: receitas },
    { data: resumoData },
    { data: diarioData }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('gastos').select('*').eq('user_id', user.id).order('criado_em', { ascending: false }).limit(50),
    supabase.from('receitas').select('*').eq('user_id', user.id).order('criado_em', { ascending: false }).limit(50),
    supabase.from('resumo_mensal').select('*').eq('user_id', user.id) /* Adjust if view has 'mes' column: .eq('mes', currentMonth) */,
    supabase.from('gasto_diario').select('*').eq('user_id', user.id) /* Adjust if view has 'mes' column */
  ])

  const limiteMensal = profile?.limite_mensal || 0
  
  // ResumoCards aggregations
  const totalMes = gastos?.reduce((acc, curr) => {
    // Basic JS logic to filter current month assuming 'data_gasto' is 'YYYY-MM-DD'
    const isCurrentMonth = curr.data_gasto?.startsWith(currentMonth) || curr.criado_em?.startsWith(currentMonth);
    return isCurrentMonth ? acc + Number(curr.valor || 0) : acc;
  }, 0) || 0

  const totalReceitas = receitas?.reduce((acc, curr) => {
    // Basic JS logic to filter current month assuming 'data_receita' is 'YYYY-MM-DD'
    const isCurrentMonth = curr.data_receita?.startsWith(currentMonth) || curr.criado_em?.startsWith(currentMonth);
    return isCurrentMonth ? acc + Number(curr.valor || 0) : acc;
  }, 0) || 0

  const saldoLiquido = totalReceitas - totalMes
  
  // Cálculo do percentual comprometido
  const baseCalculo = totalReceitas > 0 ? totalReceitas : limiteMensal
  const percentualComprometido = baseCalculo > 0 ? (totalMes / baseCalculo) * 100 : 0
  
  // Previsão de fim de mês
  const elapsedDays = date.getDate()
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const remainingDays = daysInMonth - elapsedDays
  const mediaDiaria = elapsedDays > 0 ? totalMes / elapsedDays : 0
  const previsaoFimMes = mediaDiaria * daysInMonth
  
  // Orçamento diário restante (para Modo Sobrevivência)
  const baseDisponivel = totalReceitas > 0 ? totalReceitas : limiteMensal
  const orcamentoDiarioRestante = remainingDays > 0 ? (baseDisponivel - totalMes) / remainingDays : 0

  // Category aggregations from View or fallback mapping
  let chartCatData = []
  let chartReceitasData = []
  let maiorCategoriaNome = 'Sem gastos'
  
  if (resumoData && resumoData.length > 0) {
    // Suppose view columns: categoria_nome, total
    chartCatData = resumoData.map((row: any) => ({
      name: row.categoria_nome || 'Outros',
      value: Number(row.total || 0)
    }))
    const maxCat = chartCatData.reduce((prev: any, current: any) => (prev.value > current.value) ? prev : current, { name: 'Sem gastos', value: 0 })
    maiorCategoriaNome = maxCat.name
  } else {
    // Fallback if view doesn't return data (e.g. not created yet or empty)
    const grouped = gastos?.reduce((acc: any, curr) => {
      const cat = curr.categoria_nome || 'Sem Categoria'
      acc[cat] = (acc[cat] || 0) + Number(curr.valor)
      return acc
    }, {}) || {}
    chartCatData = Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }))
    if (chartCatData.length > 0) {
      const maxCat = chartCatData.reduce((prev: any, current: any) => (prev.value > current.value) ? prev : current, { name: 'Sem gastos', value: 0 })
      maiorCategoriaNome = maxCat.name
    }
  }

  // Calculate receitas by category
  const receitasGrouped = receitas?.reduce((acc: any, curr) => {
    const cat = curr.categoria || 'Sem Categoria'
    acc[cat] = (acc[cat] || 0) + Number(curr.valor)
    return acc
  }, {}) || {}
  chartReceitasData = Object.keys(receitasGrouped).map(key => ({ name: key, value: receitasGrouped[key] }))

  // Daily Chart from View or fallback
  let chartDiarioData = []
  if (diarioData && diarioData.length > 0) {
    // Suppose view columns: dia (YYYY-MM-DD), total
    chartDiarioData = diarioData.map((row: any) => ({
      day: row.dia?.slice(-2) || '00',  // get 'DD'
      gasto: Number(row.total || 0)
    }))
  } else {
    // Fallback: Group current month expenses by day
    const groupedDiario = gastos?.reduce((acc: any, curr) => {
      const gDate = curr.data_gasto || (curr.criado_em && curr.criado_em.split('T')[0])
      if (gDate && gDate.startsWith(currentMonth)) {
        const day = gDate.slice(-2)
        acc[day] = (acc[day] || 0) + Number(curr.valor)
      }
      return acc
    }, {}) || {}
    chartDiarioData = Object.keys(groupedDiario).sort().map(key => ({ day: key, gasto: groupedDiario[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Acompanhe seus gastos e metas em tempo real.</p>
      </div>

      <ResumoCards 
        totalMes={totalMes} 
        mediaDiaria={mediaDiaria} 
        maiorCategoria={maiorCategoriaNome} 
        percentualComprometido={percentualComprometido}
        baseCalculo={baseCalculo}
        totalReceitas={totalReceitas}
        saldoLiquido={saldoLiquido}
        previsaoFimMes={previsaoFimMes}
        orcamentoDiarioRestante={orcamentoDiarioRestante}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GraficoDiario data={chartDiarioData} />
        <GraficoCategoria gastosData={chartCatData} receitasData={chartReceitasData} />
      </div>

      <div className="grid gap-4">
        <TabelaGastos initialGastos={gastos || []} userId={user.id} />
      </div>
    </div>
  )
}
