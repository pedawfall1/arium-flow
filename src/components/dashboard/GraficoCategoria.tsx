'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#8B2BE2', '#C084FC', '#4A1A8A', '#a855f7', '#7e22ce', '#3b0764', '#d8b4fe']

export function GraficoCategoria({ data }: { data: { name: string, value: number }[] }) {
  // If no data, show empty state
  const chartData = data && data.length > 0 ? data : [{ name: 'Sem dados', value: 1 }]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {data && data.length > 0 && <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`} />}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
