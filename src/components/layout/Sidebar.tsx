'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Target, Bell, Settings, LogOut, X, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const routes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gastos', label: 'Gastos', icon: Receipt },
  { href: '/receitas', label: 'Receitas', icon: TrendingUp },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/alertas', label: 'Alertas', icon: Bell },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Base classes for the aside layout
  const asideClasses = `fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-white/10 md:flex transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  }`

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={asideClasses}
        style={{ background: 'linear-gradient(180deg, #0D0618 0%, #1A0A2E 100%)' }}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Arium Logo" width={32} height={32} className="object-contain" />
            <span className="text-lg font-medium tracking-tight text-white">
              Arium Flow
            </span>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <nav className="flex-1 space-y-2">
            {routes.map((route) => {
              const isActive = pathname === route.href
              
              // Base active and inactive classes
              const activeStyle = isActive 
                ? 'bg-purple-600/20 text-purple-400 shadow-[0_0_12px_rgba(139,43,226,0.4)] border border-purple-500/30' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => onClose && onClose()}
                  style={{ transition: 'all 0.2s ease' }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${activeStyle}`}
                >
                  <route.icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                  {route.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              style={{ transition: 'all 0.2s ease' }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent"
            >
              <LogOut className="h-5 w-5 opacity-70" />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
