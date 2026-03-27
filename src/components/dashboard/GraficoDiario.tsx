'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'

export function GraficoDiario({ data }: { data: { data: string, gasto: number, receita: number }[] }) {
  const formatarMoeda = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatarData = (dateStr: string) => {
    try {
      // Verificar se a string é válida
      if (!dateStr || typeof dateStr !== 'string') {
        return '--'
      }
      
      // Tentar criar objeto Date
      const date = new Date(dateStr)
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        // Tentar formatos alternativos
        const formats = [
          dateStr, // Original
          dateStr.replace(/\//g, '-'), // Trocar / por -
          dateStr + 'T00:00:00', // Adicionar tempo
          `${dateStr.split('-')[0]}-${dateStr.split('-')[1].padStart(2, '0')}-${dateStr.split('-')[2].padStart(2, '0')}` // Padronizar
        ]
        
        for (const format of formats) {
          const testDate = new Date(format)
          if (!isNaN(testDate.getTime())) {
            return testDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          }
        }
        
        return '--'
      }
      
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    } catch (error) {
      console.warn('Erro ao formatar data:', dateStr, error)
      return '--'
    }
  }

  // Filtrar dados inválidos
  const dadosValidos = data.filter(item => {
    return item && 
           typeof item.data === 'string' && 
           item.data.length > 0 &&
           !isNaN(Number(item.gasto)) && 
           !isNaN(Number(item.receita))
  })

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        {dadosValidos && dadosValidos.length > 0 ? (
          <div className="h-[200px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosValidos}>
                <XAxis 
                  dataKey="data" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => formatarData(value as string)}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatarMoeda(Number(value))}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    formatarMoeda(Number(value)), 
                    name === 'gasto' ? 'Gasto' : 'Receita'
                  ]}
                  labelFormatter={(label) => formatarData(label as string)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gasto"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, fill: '#0D0618' }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#EF4444' }}
                  name="gasto"
                />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, fill: '#0D0618' }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#22C55E' }}
                  name="receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-gray-500 text-sm">
            Nenhuma transação registrada neste mês.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
