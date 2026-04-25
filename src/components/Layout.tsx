import { NavLink, Outlet } from 'react-router-dom'
import { UtensilsCrossed, ShoppingCart, Gift, FileSpreadsheet, Settings, Flame } from 'lucide-react'
import { useDishes } from '../hooks/useSupabase'

export default function Layout() {
  const { dishes } = useDishes()
  
  // Verifica se existe algum prato que dá direito ao bingo
  const hasBingoDishes = dishes.some(dish => dish.givesBingoEntry && dish.available)

  const navItems = [
    { to: '/', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/cardapio', icon: UtensilsCrossed, label: 'Cardápio' },
    ...(hasBingoDishes ? [{ to: '/bingo', icon: Gift, label: 'Bingo' }] : []),
    { to: '/relatorios', icon: FileSpreadsheet, label: 'Relatórios' },
    { to: '/config', icon: Settings, label: 'Config' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header compacto no mobile */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-explosion opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,transparent_30%,#1A0A0A_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 py-3 md:px-4 md:py-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <Flame className="w-8 h-8 md:w-12 md:h-12 text-xtreme-yellow animate-pulse" />
              <Flame className="w-8 h-8 md:w-12 md:h-12 text-xtreme-red absolute top-0 left-0 opacity-50 animate-ping" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-5xl tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                CONEXÃO <span className="text-gradient">XTREME</span>
              </h1>
              <p className="text-xtreme-yellow/80 text-xs md:text-sm font-medium tracking-widest uppercase hidden sm:block">
                Sistema de Vendas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação Desktop - topo */}
      <nav className="hidden md:block bg-xtreme-black/95 backdrop-blur-sm sticky top-0 z-50 border-b border-xtreme-red/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-lg my-1 ${
                    isActive
                      ? 'btn-fire text-xtreme-black shadow-lg'
                      : 'text-xtreme-cream/80 hover:text-xtreme-yellow hover:bg-white/5'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-3 py-4 md:px-4 md:py-8">
        <Outlet />
      </main>

      {/* Navegação Mobile - bottom bar fixa */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-xtreme-black/98 backdrop-blur-lg border-t border-xtreme-red/30 z-50 safe-area-bottom">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-xtreme-yellow'
                    : 'text-xtreme-cream/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-fire' : ''}`}>
                    <Icon size={20} className={isActive ? 'text-xtreme-black' : ''} />
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer - apenas desktop */}
      <footer className="hidden md:block text-center py-4 text-xtreme-cream/30 text-sm">
        🔥 Conexão Xtreme • Sistema de Vendas
      </footer>
    </div>
  )
}
