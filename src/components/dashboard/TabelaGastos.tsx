'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

export function TabelaGastos({ initialGastos, userId }: { initialGastos: any[], userId: string }) {
  const [gastos, setGastos] = useState(initialGastos)
  const supabase = createClient()

  useEffect(() => {
    setGastos(initialGastos)
  }, [initialGastos])

  useEffect(() => {
    if (!userId) return

    console.log('Configurando Realtime para TabelaGastos, userId:', userId)

    // Realtime para gastos
    const gastosChannel = supabase
      .channel('realtime-gastos-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime event recebido no TabelaGastos (gastos):', payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('INSERT recebido:', payload.new)
            setGastos((prev) => {
              const novos = [payload.new as any, ...prev].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
              console.log('Novos gastos após INSERT:', novos)
              return novos
            })
          } else if (payload.eventType === 'UPDATE') {
            console.log('UPDATE recebido:', payload.new)
            setGastos((prev) => {
              const atualizados = prev.map(g => g.id === payload.new.id ? payload.new as any : g)
              console.log('Gastos após UPDATE:', atualizados)
              return atualizados
            })
          } else if (payload.eventType === 'DELETE') {
            console.log('DELETE recebido:', payload.old)
            setGastos((prev) => {
              const filtrados = prev.filter(g => g.id !== payload.old.id)
              console.log('Gastos após DELETE:', filtrados)
              return filtrados
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Status do subscription Realtime TabelaGastos (gastos):', status)
      })

    // Realtime para receitas
    const receitasChannel = supabase
      .channel('realtime-receitas-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'receitas',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime event recebido no TabelaGastos (receitas):', payload)
          
          // Para TabelaGastos, vamos adicionar receitas como se fossem gastos
          // com um tipo diferente para diferenciar visualmente
          if (payload.eventType === 'INSERT') {
            const receitaComoGasto = {
              ...payload.new,
              tipo: 'receita',
              fonte: payload.new.fonte || 'manual'
            }
            console.log('INSERT receita convertido:', receitaComoGasto)
            setGastos((prev) => {
              const novos = [receitaComoGasto, ...prev].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
              console.log('Novos gastos após INSERT receita:', novos)
              return novos
            })
          } else if (payload.eventType === 'UPDATE') {
            const receitaComoGasto = {
              ...payload.new,
              tipo: 'receita',
              fonte: payload.new.fonte || 'manual'
            }
            console.log('UPDATE receita convertido:', receitaComoGasto)
            setGastos((prev) => {
              const atualizados = prev.map(g => g.id === payload.new.id ? receitaComoGasto : g)
              console.log('Gastos após UPDATE receita:', atualizados)
              return atualizados
            })
          } else if (payload.eventType === 'DELETE') {
            console.log('DELETE receita recebido:', payload.old)
            setGastos((prev) => {
              const filtrados = prev.filter(g => g.id !== payload.old.id)
              console.log('Gastos após DELETE receita:', filtrados)
              return filtrados
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Status do subscription Realtime TabelaGastos (receitas):', status)
      })

    return () => {
      console.log('Removendo canal Realtime TabelaGastos')
      supabase.removeChannel(gastosChannel)
      supabase.removeChannel(receitasChannel)
    }
  }, [supabase, userId])

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Últimas Transações (Tempo Real)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">Data</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoria</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fonte</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Nenhuma transação registrada ainda.</td>
                </tr>
              ) : (
                gastos.slice(0, 10).map((gasto) => (
                  <tr key={gasto.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle text-gray-500">
                      {new Date(gasto.data_gasto || gasto.data_receita || gasto.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 align-middle font-medium">{gasto.descricao}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="secondary">
                        {gasto.categoria_nome || gasto.categoria || 'Sem Categoria'}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-gray-400">
                      {gasto.fonte === 'whatsapp' ? '📱 WhatsApp' : '💻 Manual'}
                    </td>
                    <td className="p-4 align-middle text-right font-medium">
                      <span className={(gasto as any).tipo === 'receita' ? 'text-green-500' : 'text-gray-300'}>
                        {(gasto as any).tipo === 'receita' ? '+ R$ ' : 'R$ '}
                        {Number(gasto.valor || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
