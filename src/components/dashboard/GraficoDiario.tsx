'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function GraficoDiario({ data }: { data: { day: string, gasto: number }[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Visão Diária de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[300px]">
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
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2).replace('.', ',')}`, 'Gasto']}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="gasto"
                  stroke="#8B2BE2"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#0D0618' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#C084FC' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
            Nenhum gasto registrado neste mês.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
