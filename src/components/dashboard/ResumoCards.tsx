'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Activity, TrendingUp, AlertCircle, TrendingDown, Wallet } from 'lucide-react'
import Link from 'next/link'

// Custom Hook for counting up
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing out quad
      const easeOutQuad = progress * (2 - progress)
      
      setCount(end * easeOutQuad)
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }
    
    window.requestAnimationFrame(step)
  }, [end, duration])

  return count
}

interface ResumoCardsProps {
  totalMes: number
  totalReceitas: number
  saldoLiquido: number
  maiorCategoria: string
}

export function ResumoCards({ 
  totalMes, 
  totalReceitas, 
  saldoLiquido,
  maiorCategoria
}: ResumoCardsProps) {
  
  // Animated values
  const animatedTotal = useCountUp(totalMes)
  const animatedReceitas = useCountUp(totalReceitas)
  const animatedSaldo = useCountUp(Math.abs(saldoLiquido))

  // Card styles glassmorphism
  const cardStyle = {
    background: 'rgba(139, 43, 226, 0.08)',
    border: '1px solid rgba(139, 43, 226, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(139,43,226,0.25)'
    e.currentTarget.style.transform = 'translateY(-4px)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.transform = 'translateY(0)'
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 xl:grid-cols-4">
      {/* Gasto no Mês */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
        <Link href="/gastos" className="block h-full">
          <Card 
            style={cardStyle} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="h-full rounded-xl sm:rounded-2xl p-3 sm:p-4"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-[11px] sm:text-xs font-medium text-gray-300">Gasto no Mês</CardTitle>
              <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="text-[1.25rem] sm:text-xl sm:text-3xl font-semibold text-white tracking-tight mb-1">
                R$ {animatedTotal.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[10px] sm:text-xs text-purple-400/80">Mês atual</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Total de Receitas */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <Link href="/gastos" className="block h-full">
          <Card 
            style={cardStyle} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="h-full rounded-xl sm:rounded-2xl p-3 sm:p-4"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-[11px] sm:text-xs font-medium text-gray-300">Total de Receitas</CardTitle>
              <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="text-[1.25rem] sm:text-xl sm:text-3xl font-semibold text-white tracking-tight mb-1">
                R$ {animatedReceitas.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[10px] sm:text-xs text-green-400/80">Mês atual</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Saldo Líquido */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
        <Link href="/gastos" className="block h-full">
          <Card 
            style={cardStyle} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="h-full rounded-xl sm:rounded-2xl p-3 sm:p-4"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-[11px] sm:text-xs font-medium text-gray-300">Saldo Líquido</CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg ${saldoLiquido >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Wallet className={`h-3 w-3 sm:h-4 sm:w-4 ${saldoLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-[1.25rem] sm:text-xl sm:text-3xl font-semibold tracking-tight mb-1 ${saldoLiquido >= 0 ? 'text-white' : 'text-red-400'}`}>
                {saldoLiquido >= 0 ? '+' : '-'} R$ {animatedSaldo.toFixed(2).replace('.', ',')}
              </div>
              <p className={`text-[10px] sm:text-xs ${saldoLiquido >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                Receitas - Gastos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Maior Categoria */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '400ms' }}>
        <Link href="/gastos" className="block h-full">
          <Card 
            style={cardStyle} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            className="h-full rounded-xl sm:rounded-2xl p-3 sm:p-4"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-[11px] sm:text-xs font-medium text-gray-300">Maior Categoria</CardTitle>
              <div className="p-1.5 sm:p-2 bg-teal-500/10 rounded-lg">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400" />
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="text-[1.25rem] sm:text-xl sm:text-3xl font-semibold text-white tracking-tight mb-1 truncate" title={maiorCategoria}>
                {maiorCategoria}
              </div>
              <p className="text-[10px] sm:text-xs text-teal-400/80">Mais consumida</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
