'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MessageCircle, BarChart3, ShieldAlert, Check, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0618] text-gray-100 font-sans selection:bg-purple-500/30">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0D0618]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Arium Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">Arium Flow</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium border-0 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                Começar Agora
              </Button>
            </Link>
          </nav>

          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0D0618] p-4 flex flex-col gap-4">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white font-medium border-0">
                Começar Agora
              </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 pt-24">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden">
          {/* subtle animated glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              A revolução no controle financeiro
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Financeiro impecável via <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">WhatsApp</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Esqueça planilhas complexas. Mande um áudio ou texto para nosso assistente inteligente e veja seu dashboard atualizar instantaneamente. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-base bg-white text-[#0D0618] hover:bg-gray-100 border-0">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 border-t border-white/5 bg-[#0a0413]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Projetado para Velocidade</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Três pilares fundamentais para transformar sua relação com o dinheiro.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
                  <MessageCircle className="text-green-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Registro via WhatsApp</h3>
                <p className="text-gray-400 leading-relaxed">
                  Sem apps novos. Envie um recibo, áudio ou texto. Nossa IA categoriza e registra tudo em segundos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                  <BarChart3 className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Dashboard em Tempo Real</h3>
                <p className="text-gray-400 leading-relaxed">
                  Acompanhe seus gastos, metas e saldo com gráficos lindos e atualizações instantâneas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-6">
                  <ShieldAlert className="text-red-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Modo Sobrevivência</h3>
                <p className="text-gray-400 leading-relaxed">
                  Gasto acima da meta? Receba alertas severos e bloqueios simulados para proteger seu orçamento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-24 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Assinatura Simples</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Um plano único, sem surpresas, com acesso total a todas as funcionalidades.</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative rounded-3xl bg-gradient-to-b from-purple-500/20 to-transparent p-[1px]">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais Popular
                  </span>
                </div>
                <div className="bg-[#0D0618] rounded-3xl p-8 pt-10">
                  <h3 className="text-2xl font-bold text-white mb-2">Plano Pro</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-extrabold text-white">R$ 29,90</span>
                    <span className="text-gray-400 font-medium">/ mês</span>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      'Assistente financeiro no WhatsApp',
                      'Dashboard completo e interativo',
                      'Modo Sobrevivência ativo',
                      'Categorização Inteligente via IA',
                      'Suporte prioritário',
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-purple-400" />
                        </div>
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="https://buy.stripe.com/test_aFa5kF3Wu8AZaQZ0S79IQ03" target="_blank">
                    <Button className="w-full h-12 bg-white text-[#0D0618] hover:bg-gray-200 font-semibold text-base transition-colors">
                      Assinar Agora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Arium Logo" width={24} height={24} className="opacity-50 grayscale" />
            <span>© {new Date().getFullYear()} Arium Flow. Todos os direitos reservados.</span>
          </div>
          <div>
            Design Premium inspirado na excelência.
          </div>
        </div>
      </footer>
    </div>
  )
}
