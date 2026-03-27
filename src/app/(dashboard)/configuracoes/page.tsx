'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { updateProfile } from './actions'

export default function ConfiguracoesPage() {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [limiteMensal, setLimiteMensal] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome, whatsapp, limite_mensal')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setNome(profile.nome || '')
          setWhatsapp(profile.whatsapp || '')
          setLimiteMensal(profile.limite_mensal?.toString() || '')
        }
      }
    }

    loadProfile()
  }, [])

  async function handleSaveProfile() {
    if (!nome.trim() || !whatsapp.trim() || !limiteMensal.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    const result = await updateProfile(nome, whatsapp, parseFloat(limiteMensal))
    
    if (result?.success) {
      toast.success('Perfil atualizado com sucesso!')
    } else {
      toast.error(result?.error || 'Erro ao atualizar perfil')
    }
    
    setIsLoading(false)
  }

  async function handleUpdateLimit() {
    if (!limiteMensal.trim()) {
      toast.error('Informe um limite mensal')
      return
    }

    setIsLoading(true)
    const result = await updateProfile(nome, whatsapp, parseFloat(limiteMensal))
    
    if (result?.success) {
      toast.success('Limite mensal atualizado com sucesso!')
    } else {
      toast.error(result?.error || 'Erro ao atualizar limite')
    }
    
    setIsLoading(false)
  }

  async function handleManageStripe() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Erro ao acessar portal da Stripe')
      }
    } catch (error) {
      console.error('Erro ao acessar portal:', error)
      toast.error('Erro ao acessar portal da Stripe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-gray-500">Gerencie seu perfil, limites e WhatsApp.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil e WhatsApp</CardTitle>
            <CardDescription>
              Atualize as informações que a Arium Flow usará para conversar com você.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="nome">Nome de Tratamento</Label>
              <Input 
                id="nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="whatsapp">Número do WhatsApp (Ligado à IA)</Label>
              <Input 
                id="whatsapp" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5547999999999"
              />
              <p className="text-xs text-gray-500">
                Lembre de incluir DDI (55 para Brasil) e o código de área.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="bg-primary hover:bg-secondary text-white"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planos e Orçamento</CardTitle>
            <CardDescription>Configure limites para o Modo Sobrevivência e previsões do mês.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label>Limite Mensal de Gastos (R$)</Label>
              <Input 
                type="number" 
                value={limiteMensal}
                onChange={(e) => setLimiteMensal(e.target.value)}
                placeholder="5000"
              />
            </div>
            <div className="p-4 bg-muted border border-border rounded-lg max-w-md">
              <h4 className="font-semibold text-primary">Assinatura Ativa: Plano Premium</h4>
              <p className="text-sm text-gray-300 mt-1">Sua renovação está agendada para o próximo mês.</p>
              <Button 
                variant="link" 
                className="text-primary hover:text-white px-0 mt-2 h-auto"
                onClick={handleManageStripe}
                disabled={isLoading}
              >
                Gerenciar na Stripe &rarr;
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateLimit}
              disabled={isLoading}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Limite'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
