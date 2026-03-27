'use client'

import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-[#0D0618] px-4 md:px-6 border-zinc-800">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-gray-400" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="md:hidden flex items-center gap-2">
          <Image src="/logo.png" alt="Arium Logo" width={32} height={32} className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-lg font-semibold tracking-tight text-white">
            Arium Flow
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/alertas">
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
        </Link>
        <Link href="/configuracoes">
          <div className="h-9 w-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-medium cursor-pointer hover:bg-purple-600/30 hover:border-purple-400/50 transition-all text-sm">
            AF
          </div>
        </Link>
      </div>
    </header>
  )
}
