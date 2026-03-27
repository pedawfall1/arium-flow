'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateProfile, selectFreePlan, createCheckoutSession } from './actions'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleNextStep() {
    if (step === 1 && nome.trim()) setStep(2)
    if (step === 2 && whatsapp.trim()) {
      setIsLoading(true)
      const res = await updateProfile(nome, whatsapp)
      setIsLoading(false)
      if (res?.success) {
        toast.success('Perfil salvo com sucesso!')
        setStep(3)
      } else {
        toast.error(res?.error || 'Erro ao salvar perfil')
      }
    }
  }

  async function handleFreePlan() {
    setIsLoading(true)
    const res = await selectFreePlan()
    if (res?.success) {
      router.push('/dashboard')
    } else {
      toast.error(res?.error || 'Erro ao selecionar plano')
      setIsLoading(false)
    }
  }

  async function handleProPlan() {
    setIsLoading(true)
    const res = await createCheckoutSession()
    if (res?.url) {
      window.location.href = res.url
    } else {
      toast.error(res?.error || 'Erro ao criar sessão de pagamento')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {step === 1 && 'Qual é o seu nome?'}
            {step === 2 && 'Qual seu WhatsApp?'}
            {step === 3 && 'Escolha seu plano'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Como devemos chamar você?'}
            {step === 2 && 'O número que você vai usar para enviar os gastos'}
            {step === 3 && 'Selecione o plano ideal para suas necessidades'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input 
                placeholder="Seu nome" 
                value={nome} 
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNextStep()}
              />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input 
                placeholder="5547999999999" 
                value={whatsapp} 
                onChange={e => setWhatsapp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNextStep()}
              />
              <p className="text-xs text-gray-500">Coloque o código do país e DDD (ex: 5547...)</p>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-gray-200 shadow-none cursor-pointer hover:border-primary transition-colors" onClick={handleFreePlan}>
                <CardHeader className="p-4 text-center">
                  <CardTitle className="text-lg">Free</CardTitle>
                  <CardDescription>R$ 0/mês</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-center">
                  <p>Registro manual e histórico básico.</p>
                </CardContent>
              </Card>
              <Card className="border-primary bg-primary/10 cursor-pointer overflow-hidden relative transition-all" onClick={handleProPlan}>
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">PRO</div>
                <CardHeader className="p-4 text-center">
                  <CardTitle className="text-lg text-primary">Premium</CardTitle>
                  <CardDescription className="text-primary/80">R$ 29,90/mês</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-center text-primary/60">
                  <p>Integração total via WhatsApp e IA.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={isLoading}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button 
              className="ml-auto" 
              onClick={handleNextStep} 
              disabled={isLoading || (step === 1 && !nome) || (step === 2 && !whatsapp)}
            >
              Próximo
            </Button>
          ) : (
            <div className="w-full text-center text-xs text-gray-400 mt-2">
              Você pode alterar seu plano depois nas configurações.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
