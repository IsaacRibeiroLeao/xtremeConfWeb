import { useState } from 'react'
import { Gift, Plus, Trash2, Users, Shuffle, X, Sparkles } from 'lucide-react'
import { useBingo } from '../hooks/useSupabase'

export default function Bingo() {
  const { participants, addParticipant, deleteParticipant, clearAllParticipants } = useBingo()
  const [newName, setNewName] = useState('')
  const [bulkNames, setBulkNames] = useState('')
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [drawnName, setDrawnName] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleAddSingle = async () => {
    if (!newName.trim()) return
    await addParticipant({
      name: newName.trim(),
      addedManually: true
    })
    setNewName('')
  }

  const handleAddBulk = async () => {
    const names = bulkNames
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0)
    
    if (names.length === 0) return
    
    for (const name of names) {
      await addParticipant({
        name,
        addedManually: true
      })
    }
    setBulkNames('')
    setShowBulkAdd(false)
  }

  const handleDraw = () => {
    if (participants.length === 0) return
    
    setIsDrawing(true)
    setDrawnName(null)
    
    let iterations = 0
    const maxIterations = 20
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length)
      setDrawnName(participants[randomIndex].name)
      iterations++
      
      if (iterations >= maxIterations) {
        clearInterval(interval)
        setIsDrawing(false)
      }
    }, 100)
  }

  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja remover TODOS os participantes do bingo?')) {
      await clearAllParticipants()
    }
  }

  const manualParticipants = participants.filter(p => p.addedManually)
  const orderParticipants = participants.filter(p => !p.addedManually)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-2xl md:text-3xl text-gradient tracking-wide flex items-center gap-2">
          <Gift className="text-xtreme-yellow w-6 h-6 md:w-8 md:h-8" />
          BINGO
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkAdd(true)}
            className="p-2 md:px-4 md:py-2 bg-xtreme-black/50 text-xtreme-cream border border-xtreme-orange/30 rounded-lg flex items-center gap-2 font-semibold"
          >
            <Users size={18} />
            <span className="hidden md:inline">Adicionar Vários</span>
          </button>
          {participants.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 md:px-4 md:py-2 bg-xtreme-red/20 text-xtreme-red border border-xtreme-red/30 rounded-lg flex items-center gap-2 font-semibold"
            >
              <Trash2 size={18} />
              <span className="hidden md:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Draw Section - EXPLOSIVO */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
        <div className="absolute inset-0 bg-explosion"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,transparent_20%,#1A0A0A_80%)]"></div>
        
        <div className="relative p-5 md:p-8 text-center">
          <div className="flex justify-center mb-3 md:mb-4">
            <Sparkles className="text-xtreme-yellow w-6 h-6 md:w-8 md:h-8 animate-pulse" />
          </div>
          <h3 className="font-display text-xl md:text-2xl text-xtreme-cream tracking-wider mb-4 md:mb-6">SORTEIO</h3>
          
          {drawnName && (
            <div className={`mb-4 md:mb-6 ${isDrawing ? 'animate-pulse' : ''}`}>
              <div className="text-3xl sm:text-4xl md:text-6xl font-display text-gradient tracking-wider drop-shadow-[0_0_30px_rgba(249,214,72,0.5)] break-words px-2">
                🎉 {drawnName} 🎉
              </div>
            </div>
          )}
          
          <button
            onClick={handleDraw}
            disabled={participants.length === 0 || isDrawing}
            className="px-6 py-3 md:px-8 md:py-4 btn-fire text-xtreme-black rounded-xl font-bold text-base md:text-lg flex items-center gap-2 md:gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-fire active:scale-95 transition-transform"
          >
            <Shuffle size={20} />
            {isDrawing ? 'SORTEANDO...' : '🔥 SORTEAR'}
          </button>
          
          <p className="mt-4 md:mt-6 text-xtreme-cream/60 font-medium text-sm md:text-base">
            <span className="text-xtreme-yellow font-bold text-lg md:text-xl">{participants.length}</span> participante(s)
          </p>
        </div>
      </div>

      {/* Add Single Participant */}
      <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/30 rounded-xl p-4 md:p-5 border border-xtreme-orange/30">
        <h3 className="font-semibold mb-3 md:mb-4 text-xtreme-cream flex items-center gap-2 text-sm md:text-base">
          <Plus className="text-xtreme-orange" size={18} />
          Adicionar Participante
        </h3>
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            placeholder="Nome do participante"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSingle()}
            className="flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40 focus:ring-2 focus:ring-xtreme-orange focus:border-transparent text-sm md:text-base"
          />
          <button
            onClick={handleAddSingle}
            disabled={!newName.trim()}
            className="px-4 py-2.5 md:px-5 md:py-3 btn-fire text-xtreme-black rounded-lg font-bold disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Participants Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* From Orders */}
        <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/30 rounded-xl p-4 md:p-5 border border-xtreme-orange/30">
          <h3 className="font-semibold mb-3 md:mb-4 text-xtreme-orange flex items-center gap-2 text-sm md:text-base">
            🍽️ Via Pedidos <span className="bg-xtreme-orange/20 px-2 py-0.5 rounded-full text-xs md:text-sm">{orderParticipants.length}</span>
          </h3>
          {orderParticipants.length === 0 ? (
            <p className="text-xtreme-cream/40 text-center py-4 md:py-6 text-sm">
              Nenhum participante via pedidos
            </p>
          ) : (
            <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
              {orderParticipants.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 md:p-3 bg-xtreme-black/30 rounded-lg border border-xtreme-cream/10">
                  <span className="text-xtreme-cream font-medium text-sm md:text-base truncate flex-1 mr-2">{p.name}</span>
                  <button
                    onClick={() => deleteParticipant(p.id)}
                    className="text-xtreme-cream/30 active:text-xtreme-red p-1 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual */}
        <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/30 rounded-xl p-4 md:p-5 border border-xtreme-yellow/30">
          <h3 className="font-semibold mb-3 md:mb-4 text-xtreme-yellow flex items-center gap-2 text-sm md:text-base">
            ✋ Manuais <span className="bg-xtreme-yellow/20 px-2 py-0.5 rounded-full text-xs md:text-sm">{manualParticipants.length}</span>
          </h3>
          {manualParticipants.length === 0 ? (
            <p className="text-xtreme-cream/40 text-center py-4 md:py-6 text-sm">
              Nenhum participante manual
            </p>
          ) : (
            <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
              {manualParticipants.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 md:p-3 bg-xtreme-black/30 rounded-lg border border-xtreme-cream/10">
                  <span className="text-xtreme-cream font-medium text-sm md:text-base truncate flex-1 mr-2">{p.name}</span>
                  <button
                    onClick={() => deleteParticipant(p.id)}
                    className="text-xtreme-cream/30 active:text-xtreme-red p-1 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-gradient-to-br from-xtreme-black to-xtreme-blue/50 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-md md:mx-4 border-t md:border border-xtreme-orange/30 card-glow max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-5 border-b border-xtreme-orange/20 flex justify-between items-center sticky top-0 bg-xtreme-black/90 backdrop-blur-sm">
              <h3 className="font-display text-lg md:text-xl text-gradient tracking-wide">ADICIONAR VÁRIOS</h3>
              <button onClick={() => setShowBulkAdd(false)} className="text-xtreme-cream/50 p-1">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 md:p-5 space-y-4">
              <p className="text-sm text-xtreme-cream/60">
                Digite um nome por linha:
              </p>
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder="João Silva&#10;Maria Santos&#10;Pedro Oliveira"
                rows={6}
                className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/30 focus:ring-2 focus:ring-xtreme-orange focus:border-transparent text-sm md:text-base"
              />
              <button
                onClick={handleAddBulk}
                disabled={!bulkNames.trim()}
                className="w-full py-3 md:py-4 btn-fire text-xtreme-black rounded-xl font-bold disabled:opacity-50 text-sm md:text-base"
              >
                🔥 Adicionar {bulkNames.split('\n').filter(n => n.trim()).length} Participante(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
