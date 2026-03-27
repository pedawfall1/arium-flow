'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { ReactNode } from 'react'

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0D0618]">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="p-3 md:p-8 max-w-7xl mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
