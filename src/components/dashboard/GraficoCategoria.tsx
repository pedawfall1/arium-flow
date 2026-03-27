'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS_GASTOS = ['#8B2BE2', '#C084FC', '#4A1A8A', '#a855f7', '#7e22ce', '#3b0764', '#d8b4fe']
const COLORS_RECEITAS = ['#22C55E', '#4ADE80', '#16A34A', '#86EFAC', '#15803D', '#14532D', '#BBF7D0']

export function GraficoCategoria({ gastosData, receitasData }: { 
  gastosData: { name: string, value: number }[], 
  receitasData: { name: string, value: number }[] 
}) {
  const [tipo, setTipo] = useState<'gastos' | 'receitas'>('gastos')
  
  const dataAtual = tipo === 'gastos' ? gastosData : receitasData
  const colors = tipo === 'gastos' ? COLORS_GASTOS : COLORS_RECEITAS
  
  // Filter out zero values and apply default if empty
  const hasData = dataAtual && dataAtual.length > 0 && dataAtual.some(d => d.value > 0)
  const chartData = hasData ? dataAtual.filter(d => d.value > 0) : [{ name: 'Sem dados', value: 1 }]

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          {tipo === 'gastos' ? 'Gastos por Categoria' : 'Receitas por Categoria'}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={tipo === 'gastos' ? 'default' : 'outline'}
            onClick={() => setTipo('gastos')}
            className="text-xs"
          >
            Gastos
          </Button>
          <Button
            size="sm"
            variant={tipo === 'receitas' ? 'default' : 'outline'}
            onClick={() => setTipo('receitas')}
            className="text-xs"
          >
            Receitas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[300px]">
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
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {dataAtual && dataAtual.length > 0 && <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`} />}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
