'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createCheckoutSession, selectFreePlan } from '@/app/onboarding/actions'
import { Check } from 'lucide-react'

export default function PlanosPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleFreePlan() {
    setIsLoading(true)
    const res = await selectFreePlan()
    if (res?.success) {
      window.location.href = '/dashboard'
    } else {
      alert(res?.error || 'Erro ao selecionar plano')
      setIsLoading(false)
    }
  }

  async function handleProPlan() {
    setIsLoading(true)
    const res = await createCheckoutSession()
    if (res?.url) {
      window.location.href = res.url
    } else {
      alert(res?.error || 'Erro ao criar sessão de pagamento')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4 pt-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Encontre o plano ideal para você</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Simplifique o controle dos seus gastos e pare de anotar em planilhas chatas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plano Free */}
        <Card className="flex flex-col border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Free</CardTitle>
            <CardDescription className="text-base">Para começar a se organizar</CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              R$ 0
              <span className="ml-1 text-xl font-medium text-gray-500">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 mt-4">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Lançamento manual de gastos (Painel)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Histórico simplificado</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center">-</span>
                <span>Sem integração com WhatsApp</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center">-</span>
                <span>Sem resumos semanais de IA</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" size="lg" disabled={isLoading} onClick={handleFreePlan}>
              Continuar no Grátis
            </Button>
          </CardFooter>
        </Card>
        
        {/* Plano PRO */}
        <Card className="flex flex-col border-primary shadow-lg relative bg-primary/10">
          <div className="absolute top-0 right-0 left-0 bg-primary text-white text-center text-sm font-bold py-1 rounded-t-lg">
            MAIS POPULAR
          </div>
          <CardHeader className="mt-6">
            <CardTitle className="text-2xl font-bold text-primary">Pro Automático</CardTitle>
            <CardDescription className="text-base text-gray-300">Controle completo direto do seu WhatsApp</CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
              R$ 29,90
              <span className="ml-1 text-xl font-medium text-primary/70">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 mt-4">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium text-white">Inteligência Artificial no WhatsApp 24/7</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Lançamento por texto ("gastei 20 em café")</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Modo Sobrevivência (Orçamento Diário)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Alertas automáticos de limite excedido</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Resumos narrativos semanais</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-secondary text-white shadow-xl" size="lg" disabled={isLoading} onClick={handleProPlan}>
              Assinar Pro Agora
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
