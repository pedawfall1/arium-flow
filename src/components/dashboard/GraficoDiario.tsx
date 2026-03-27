'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'

export function GraficoDiario({ data }: { data: { day: string, gasto: number, receita: number }[] }) {
  const formatarMoeda = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[200px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="day" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
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
                  labelFormatter={(label) => `Dia ${label}`}
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
