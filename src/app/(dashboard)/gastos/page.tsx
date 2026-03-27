'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Plus, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Gasto {
  id: string
  descricao: string
  valor: number
  categoria_nome?: string
  data_gasto?: string
  criado_em: string
  fonte: 'whatsapp' | 'manual'
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [busca, setBusca] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadGastos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: gastosData, error } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false })

        if (error) throw error
        setGastos(gastosData || [])
      } catch (error) {
        console.error('Erro ao carregar gastos:', error)
        toast.error('Erro ao carregar gastos')
      } finally {
        setIsLoading(false)
      }
    }

    loadGastos()
  }, [supabase])

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
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
              setGastos((prev) => [payload.new as Gasto, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setGastos((prev) => prev.map(g => g.id === payload.new.id ? payload.new as Gasto : g))
            } else if (payload.eventType === 'DELETE') {
              setGastos((prev) => prev.filter(g => g.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupRealtime()
  }, [supabase])

  const gastosFiltrados = gastos.filter(g => 
    g.descricao.toLowerCase().includes(busca.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Gastos</h1>
          <p className="text-gray-500">Veja e filtre todas as suas transações.</p>
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
              placeholder="Buscar gasto por nome..." 
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fonte</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {gastosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      {busca ? 'Nenhum gasto encontrado para esta busca.' : 'Nenhum gasto registrado ainda.'}
                    </td>
                  </tr>
                ) : (
                  gastosFiltrados.map((gasto) => (
                    <tr key={gasto.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle text-gray-500">
                        {new Date(gasto.data_gasto || gasto.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 align-middle font-medium">{gasto.descricao}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="secondary" className="font-normal">
                          {gasto.categoria_nome || 'Sem Categoria'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-gray-400">
                        {gasto.fonte === 'whatsapp' ? '📱 WhatsApp' : '💻 Manual'}
                      </td>
                      <td className="p-4 align-middle text-right font-medium">
                        R$ {Number(gasto.valor || 0).toFixed(2).replace('.', ',')}
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
