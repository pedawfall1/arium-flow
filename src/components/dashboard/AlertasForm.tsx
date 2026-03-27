'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AlertaConfig {
  id?: string
  tipo: string
  notificar_em?: number | null
  ativo: boolean
}

interface AlertasFormProps {
  userId: string
  limiteMensal: number
  initialAlertas: AlertaConfig[]
}

export function AlertasForm({ userId, limiteMensal, initialAlertas }: AlertasFormProps) {
  const supabase = createClient()

  // State initialization matching logic
  const [alertas, setAlertas] = useState<AlertaConfig[]>(initialAlertas)

  // Find toggle status directly from active alerts
  const isAtivo = (tipo: string, notificar_em?: number) => {
    return alertas.some(a => 
      a.tipo === tipo && 
      (notificar_em === undefined || a.notificar_em === notificar_em) && 
      a.ativo === true
    )
  }

  const handleToggle = async (tipo: string, ativo: boolean, notificar_em?: number) => {
    const updatingToast = toast.loading('Salvando preferência...')
    
    // Optimistic UI updates (Local state)
    let newAlertas = [...alertas]
    const index = newAlertas.findIndex(a => 
      a.tipo === tipo && (notificar_em === undefined || a.notificar_em === notificar_em)
    )

    if (index >= 0) {
      newAlertas[index].ativo = ativo
    } else {
      newAlertas.push({ tipo, ativo, notificar_em })
    }
    setAlertas(newAlertas)

    try {
      const payload: any = {
        user_id: userId,
        tipo,
        ativo
      }
      
      if (tipo === 'limite_mensal') {
        payload.valor_limite = limiteMensal
        payload.notificar_em = notificar_em || null
      } else {
        payload.notificar_em = null
      }

      console.log('Enviando payload para Supabase:', payload)

      // Verificar se já existe um registro
      const query = supabase
        .from('alertas')
        .select('*')
        .eq('user_id', userId)
        .eq('tipo', tipo)

      // Para limite_mensal, filtrar também por notificar_em
      // Para outros tipos, filtrar por notificar_em IS NULL
      if (tipo === 'limite_mensal') {
        query.eq('notificar_em', payload.notificar_em)
      } else {
        query.is('notificar_em', null)
      }

      const { data: existing, error: checkError } = await query.single()

      console.log('Verificação de existência:', { existing, checkError, tipo, notificar_em: payload.notificar_em })

      let result
      if (existing) {
        // Update existing record
        result = await supabase
          .from('alertas')
          .update({ ativo })
          .eq('id', existing.id)
      } else {
        // Insert new record
        result = await supabase
          .from('alertas')
          .insert(payload)
      }

      console.log('Resultado da operação:', result)

      if (result.error) {
        console.error('Erro detalhado do Supabase:', result.error)
        throw result.error
      }

      toast.success('Configuração de alerta salva com sucesso!', { id: updatingToast })
    } catch (error) {
      console.error('Erro ao salvar configuração:', error, (error as any)?.message || 'Sem mensagem', (error as any)?.stack || 'Sem stack')
      toast.error('Ocorreu um erro ao salvar sua configuração.', { id: updatingToast })
      // Revert optimistic update to previous state
      setAlertas(prev => {
        const reverted = [...prev]
        const index = reverted.findIndex(a => 
          a.tipo === tipo && (notificar_em === undefined || a.notificar_em === notificar_em)
        )
        if (index >= 0) {
          reverted[index].ativo = !ativo
        }
        return reverted
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="bg-[#0D0618]/50 border-white/5 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Limite Mensal</CardTitle>
          <CardDescription className="text-gray-400">Avisos globais sobre o uso do seu orçamento do mês.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-purple-400">Notificar aos 80% do Limite</Label>
              <p className="text-sm text-gray-400">Receba um alerta preventivo antes de acabar o dinheiro.</p>
            </div>
            <Switch 
              checked={isAtivo('limite_mensal', 80)}
              onCheckedChange={(checked) => handleToggle('limite_mensal', checked, 80)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-red-400">Notificar Limite Excedido</Label>
              <p className="text-sm text-gray-400">Alerta imediato quando você gastar mais do que ganha.</p>
            </div>
            <Switch 
              checked={isAtivo('limite_mensal', 100)}
              onCheckedChange={(checked) => handleToggle('limite_mensal', checked, 100)}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0D0618]/50 border-white/5 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Modo Sobrevivência</CardTitle>
          <CardDescription className="text-gray-400">O painel de conselhos anti-quebradeira da Arium Flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-gray-200">Lembrete Diário do Orçamento</Label>
              <p className="text-sm text-gray-400">Mandar mensagem toda manhã dizendo quanto posso gastar hoje.</p>
            </div>
            <Switch 
              checked={isAtivo('lembrete_diario')}
              onCheckedChange={(checked) => handleToggle('lembrete_diario', checked)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-gray-200">Resumo Semanal (Domingos)</Label>
              <p className="text-sm text-gray-400">Um resumo narrativo e gentil na sua tarde de domingo.</p>
            </div>
            <Switch 
              checked={isAtivo('resumo_semanal')}
              onCheckedChange={(checked) => handleToggle('resumo_semanal', checked)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
