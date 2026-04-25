import { useState } from 'react'
import { Settings, Database, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Config() {
  const [isClearing, setIsClearing] = useState(false)

  const clearTable = async (tableName: string) => {
    const { error } = await supabase.from(tableName).delete().gte('created_at', '1970-01-01')
    if (error) throw error
  }

  const handleClearOrders = async () => {
    if (!confirm('Tem certeza que deseja limpar TODOS os pedidos? Esta ação não pode ser desfeita.')) return
    setIsClearing(true)
    try {
      await clearTable('orders')
      alert('Pedidos limpos com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar pedidos:', error)
      alert('Erro ao limpar pedidos')
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearBingo = async () => {
    if (!confirm('Tem certeza que deseja limpar TODOS os participantes do bingo? Esta ação não pode ser desfeita.')) return
    setIsClearing(true)
    try {
      await clearTable('bingo')
      alert('Participantes do bingo limpos com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar bingo:', error)
      alert('Erro ao limpar bingo')
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso vai limpar TODOS os dados (pedidos, bingo, pratos e categorias). Tem certeza?')) return
    if (!confirm('Esta é sua última chance. Realmente deseja apagar TUDO?')) return
    
    setIsClearing(true)
    try {
      await clearTable('orders')
      await clearTable('bingo')
      await clearTable('dishes')
      await clearTable('categories')
      alert('Todos os dados foram limpos!')
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
      alert('Erro ao limpar dados')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl">
      <h2 className="font-display text-2xl md:text-3xl text-gradient tracking-wide flex items-center gap-2 md:gap-3">
        <Settings className="text-xtreme-yellow w-6 h-6 md:w-8 md:h-8" />
        CONFIGURAÇÕES
      </h2>

      {/* Supabase Info */}
      <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/30 rounded-xl p-4 md:p-5 border border-xtreme-blue/30">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="p-1.5 md:p-2 bg-xtreme-orange/20 rounded-lg">
            <Database className="text-xtreme-orange w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="font-bold text-xtreme-cream text-base md:text-lg">Supabase</h3>
        </div>
        <p className="text-xs md:text-sm text-xtreme-cream/60 mb-3 md:mb-4">
          Configure suas credenciais no arquivo <code className="bg-xtreme-black/50 px-1.5 py-0.5 rounded text-xtreme-yellow text-xs">.env</code>
        </p>
        <pre className="bg-xtreme-black rounded-lg md:rounded-xl p-3 md:p-4 text-xs md:text-sm overflow-x-auto border border-xtreme-cream/10">
          <code className="text-green-400">{`VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...`}</code>
        </pre>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-xtreme-red/20 to-xtreme-black/80 rounded-xl p-4 md:p-5 border border-xtreme-red/40">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
          <div className="p-1.5 md:p-2 bg-xtreme-red/20 rounded-lg">
            <AlertTriangle className="text-xtreme-red w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="font-bold text-xtreme-red text-base md:text-lg">Zona de Perigo</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-xtreme-black/30 rounded-xl border border-xtreme-cream/10">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xtreme-cream text-sm md:text-base">Limpar Pedidos</p>
              <p className="text-xs md:text-sm text-xtreme-cream/50 truncate">Remove todos os pedidos</p>
            </div>
            <button
              onClick={handleClearOrders}
              disabled={isClearing}
              className="px-3 py-2 md:px-5 md:py-2 bg-xtreme-orange text-white rounded-lg flex items-center gap-1.5 md:gap-2 disabled:opacity-50 font-semibold transition-colors text-sm flex-shrink-0 active:scale-95"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-xtreme-black/30 rounded-xl border border-xtreme-cream/10">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xtreme-cream text-sm md:text-base">Limpar Bingo</p>
              <p className="text-xs md:text-sm text-xtreme-cream/50 truncate">Remove participantes do bingo</p>
            </div>
            <button
              onClick={handleClearBingo}
              disabled={isClearing}
              className="px-3 py-2 md:px-5 md:py-2 bg-xtreme-orange text-white rounded-lg flex items-center gap-1.5 md:gap-2 disabled:opacity-50 font-semibold transition-colors text-sm flex-shrink-0 active:scale-95"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-xtreme-red/10 rounded-xl border border-xtreme-red/30">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xtreme-red text-sm md:text-base">⚠️ Limpar TUDO</p>
              <p className="text-xs md:text-sm text-xtreme-cream/50 truncate">Remove todos os dados</p>
            </div>
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="px-3 py-2 md:px-5 md:py-2 bg-xtreme-red text-white rounded-lg flex items-center gap-1.5 md:gap-2 disabled:opacity-50 font-bold transition-colors text-sm flex-shrink-0 active:scale-95"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/20 rounded-xl p-4 md:p-5 border border-xtreme-cream/10">
        <h3 className="font-bold text-xtreme-cream mb-2 md:mb-3 text-sm md:text-base">Sobre</h3>
        <p className="text-xtreme-cream/80 text-sm md:text-base">
          <span className="text-gradient font-bold">Conexão Xtreme</span> - Sistema de Vendas
        </p>
        <p className="text-xs md:text-sm text-xtreme-cream/50 mt-2">
          🔥 Gerenciamento de vendas e bingo para eventos.
        </p>
      </div>
    </div>
  )
}
