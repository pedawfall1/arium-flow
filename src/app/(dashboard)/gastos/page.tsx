'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Plus, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Transacao {
  id: string
  descricao: string
  valor: number
  categoria_nome?: string
  data_gasto?: string
  data_receita?: string
  criado_em: string
  fonte: 'whatsapp' | 'manual'
  tipo: 'gasto' | 'receita'
}

export default function GastosPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [busca, setBusca] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadTransacoes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [gastosResponse, receitasResponse] = await Promise.all([
          supabase
            .from('gastos')
            .select('*')
            .eq('user_id', user.id)
            .order('criado_em', { ascending: false }),
          supabase
            .from('receitas')
            .select('*')
            .eq('user_id', user.id)
            .order('criado_em', { ascending: false })
        ])

        if (gastosResponse.error) throw gastosResponse.error
        if (receitasResponse.error) throw receitasResponse.error

        // Combinar gastos e receitas
        const gastosFormatados = (gastosResponse.data || []).map(g => ({
          ...g,
          tipo: 'gasto' as const
        }))

        const receitasFormatadas = (receitasResponse.data || []).map(r => ({
          ...r,
          tipo: 'receita' as const
        }))

        // Combinar e ordenar por data
        const todasTransacoes = [...gastosFormatados, ...receitasFormatadas].sort((a, b) => {
          const dataA = new Date(a.data_gasto || a.data_receita || a.criado_em).getTime()
          const dataB = new Date(b.data_gasto || b.data_receita || b.criado_em).getTime()
          return dataB - dataA
        })

        setTransacoes(todasTransacoes)
      } catch (error) {
        console.error('Erro ao carregar transações:', error)
        toast.error('Erro ao carregar transações')
      } finally {
        setIsLoading(false)
      }
    }

    loadTransacoes()
  }, [supabase])

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Realtime para gastos
      const gastosChannel = supabase
        .channel('realtime-gastos-page')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'gastos',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTransacoes((prev) => {
                const novaTransacao = { ...payload.new as any, tipo: 'gasto' as const }
                return [novaTransacao, ...prev].sort((a, b) => new Date(b.data_gasto || b.data_receita || b.criado_em).getTime() - new Date(a.data_gasto || a.data_receita || a.criado_em).getTime())
              })
            } else if (payload.eventType === 'UPDATE') {
              setTransacoes((prev) => prev.map(t => t.id === payload.new.id ? { ...payload.new as any, tipo: 'gasto' as const } : t))
            } else if (payload.eventType === 'DELETE') {
              setTransacoes((prev) => prev.filter(t => t.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      // Realtime para receitas
      const receitasChannel = supabase
        .channel('realtime-receitas-page')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'receitas',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTransacoes((prev) => {
                const novaTransacao = { ...payload.new as any, tipo: 'receita' as const }
                return [novaTransacao, ...prev].sort((a, b) => new Date(b.data_gasto || b.data_receita || b.criado_em).getTime() - new Date(a.data_gasto || a.data_receita || a.criado_em).getTime())
              })
            } else if (payload.eventType === 'UPDATE') {
              setTransacoes((prev) => prev.map(t => t.id === payload.new.id ? { ...payload.new as any, tipo: 'receita' as const } : t))
            } else if (payload.eventType === 'DELETE') {
              setTransacoes((prev) => prev.filter(t => t.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(gastosChannel)
        supabase.removeChannel(receitasChannel)
      }
    }

    setupRealtime()
  }, [supabase])

  const transacoesFiltradas = transacoes.filter(t => 
    t.descricao.toLowerCase().includes(busca.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Gastos</h1>
          <p className="text-gray-500">Veja e filtre todas as suas transações.</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Carregando gastos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Transações</h1>
          <p className="text-gray-500">Veja e filtre todas as suas transações de gastos e receitas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button className="flex items-center gap-2 bg-primary hover:bg-secondary text-white">
            <Plus className="h-4 w-4" />
            Adicionar Manual
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex gap-4 flex-1">
            <Input 
              placeholder="Buscar transação por nome..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-gray-50/50 dark:bg-zinc-900/50 rounded-t-lg">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Data</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoria</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fonte</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {transacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      {busca ? 'Nenhuma transação encontrada para esta busca.' : 'Nenhuma transação registrada ainda.'}
                    </td>
                  </tr>
                ) : (
                  transacoesFiltradas.map((transacao) => (
                    <tr key={transacao.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle text-gray-500">
                        {new Date(transacao.data_gasto || transacao.data_receita || transacao.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 align-middle font-medium">{transacao.descricao}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="secondary" className="font-normal">
                          {transacao.categoria_nome || 'Sem Categoria'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge 
                          variant={transacao.tipo === 'gasto' ? 'destructive' : 'default'} 
                          className="font-normal"
                        >
                          {transacao.tipo === 'gasto' ? 'Gasto' : 'Receita'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-gray-400">
                        {transacao.fonte === 'whatsapp' ? '📱 WhatsApp' : '💻 Manual'}
                      </td>
                      <td className="p-4 align-middle text-right font-medium">
                        <span className={transacao.tipo === 'gasto' ? 'text-red-500' : 'text-green-500'}>
                          {transacao.tipo === 'gasto' ? '- R$ ' : '+ R$ '}
                          {Number(transacao.valor || 0).toFixed(2).replace('.', ',')}
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
    </div>
  )
}
