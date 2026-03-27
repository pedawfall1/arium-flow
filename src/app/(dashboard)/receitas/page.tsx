'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Plus, Filter, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Receita {
  id: string
  descricao: string
  valor: number
  categoria?: string
  data_receita?: string
  criado_em: string
  fonte: 'whatsapp' | 'manual'
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadReceitas = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let query = supabase
          .from('receitas')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false })

        // Aplicar filtros de período
        if (filtroPeriodo === 'mes') {
          const currentMonth = new Date().toISOString().slice(0, 7)
          query = query.or(`data_receita.like.${currentMonth}%,criado_em.like.${currentMonth}%`)
        } else if (filtroPeriodo === 'semana') {
          const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          query = query.gte('criado_em', umaSemanaAtras)
        }

        const { data, error } = await query

        if (error) throw error
        setReceitas(data || [])
      } catch (error) {
        console.error('Erro ao carregar receitas:', error)
        toast.error('Erro ao carregar receitas')
      } finally {
        setIsLoading(false)
      }
    }

    loadReceitas()
  }, [supabase, filtroPeriodo])

  // Realtime para receitas
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let channel: any;
      try {
        channel = supabase
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
                setReceitas((prev) => [payload.new as Receita, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setReceitas((prev) => prev.map(r => r.id === payload.new.id ? payload.new as Receita : r))
              } else if (payload.eventType === 'DELETE') {
                setReceitas((prev) => prev.filter(r => r.id !== payload.old.id))
              }
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Erro ao configurar realtime receitas:', error)
      }

      return () => {
        try {
          if (channel) supabase.removeChannel(channel)
        } catch (error) {
          console.error('Erro ao remover canal:', error)
        }
      }
    }

    setupRealtime()
  }, [supabase])

  // Obter categorias únicas para filtro
  const categorias = Array.from(new Set(receitas.map(r => r.categoria || 'Sem Categoria').filter(Boolean)))

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(receita => {
    const matchBusca = receita.descricao.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = !filtroCategoria || receita.categoria === filtroCategoria
    return matchBusca && matchCategoria
  })

  // Calcular totais
  const totalReceitas = receitasFiltradas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-gray-500">Gerencie suas fontes de renda.</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Carregando receitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-gray-500">Gerencie suas fontes de renda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button className="flex items-center gap-2 bg-primary hover:bg-secondary text-white">
            <Plus className="h-4 w-4" />
            Adicionar Receita
          </Button>
        </div>
      </div>

      {/* Card de resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Resumo de Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Recebido</p>
              <p className="text-2xl font-bold text-green-500">
                + R$ {totalReceitas.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantidade</p>
              <p className="text-2xl font-bold">
                {receitasFiltradas.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Média por Receita</p>
              <p className="text-2xl font-bold">
                R$ {receitasFiltradas.length > 0 ? (totalReceitas / receitasFiltradas.length).toFixed(2).replace('.', ',') : '0,00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex gap-4 flex-1">
            <Input 
              placeholder="Buscar receita por nome..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="todos">Todos os períodos</option>
              <option value="mes">Este mês</option>
              <option value="semana">Última semana</option>
            </select>
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fonte</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {receitasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      {busca || filtroCategoria || filtroPeriodo !== 'todos' ? 'Nenhuma receita encontrada para estes filtros.' : 'Nenhuma receita registrada ainda.'}
                    </td>
                  </tr>
                ) : (
                  receitasFiltradas.map((receita) => (
                    <tr key={receita.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle text-gray-500">
                        {new Date(receita.data_receita || receita.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 align-middle font-medium">{receita.descricao}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="default" className="font-normal bg-green-100 text-green-800">
                          {receita.categoria || 'Sem Categoria'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-gray-400">
                        {receita.fonte === 'whatsapp' ? '📱 WhatsApp' : '💻 Manual'}
                      </td>
                      <td className="p-4 align-middle text-right font-medium text-green-500">
                        + R$ {Number(receita.valor || 0).toFixed(2).replace('.', ',')}
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
