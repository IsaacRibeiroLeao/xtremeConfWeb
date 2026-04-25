import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, Check } from 'lucide-react'
import { useDishes, useCategories, useOrders, useBingo } from '../hooks/useSupabase'
import type { OrderItem } from '../types'

export default function Orders() {
  const { dishes } = useDishes()
  const { categories } = useCategories()
  const { addOrder } = useOrders()
  const { addMultipleParticipants } = useBingo()
  
  const [cart, setCart] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  // Vibração de feedback (mobile)
  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  // Som simples de feedback
  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.1
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch {}
  }

  // Feedback visual ao adicionar
  useEffect(() => {
    if (lastAdded) {
      const timer = setTimeout(() => setLastAdded(null), 500)
      return () => clearTimeout(timer)
    }
  }, [lastAdded])

  const filteredDishes = selectedCategory
    ? dishes.filter(d => d.categoryId === selectedCategory && d.available)
    : dishes.filter(d => d.available)

  const addToCart = (dish: typeof dishes[0]) => {
    setLastAdded(dish.id)
    vibrate()
    playSound()
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dish.id)
      if (existing) {
        return prev.map(item =>
          item.dishId === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        dishId: dish.id,
        dishName: dish.name,
        quantity: 1,
        unitPrice: dish.price,
        givesBingoEntry: dish.givesBingoEntry
      }]
    })
  }

  const updateQuantity = (dishId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.dishId === dishId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as OrderItem[]
    })
  }

  const removeFromCart = (dishId: string) => {
    setCart(prev => prev.filter(item => item.dishId !== dishId))
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  
  const bingoEntries = cart
    .filter(item => item.givesBingoEntry)
    .reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return
    
    setIsSubmitting(true)
    try {
      const bingoNames: string[] = []
      if (bingoEntries > 0 && customerName.trim()) {
        for (let i = 0; i < bingoEntries; i++) {
          bingoNames.push(customerName.trim())
        }
      }

      await addOrder({
        items: cart,
        total,
        customerName: customerName.trim() || undefined,
        bingoEntries: bingoNames,
        status: 'completed'
      })

      if (bingoNames.length > 0) {
        await addMultipleParticipants(bingoNames)
      }

      setCart([])
      setCustomerName('')
      playSound()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Erro ao registrar pedido:', error)
      alert('Erro ao registrar pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const [showCart, setShowCart] = useState(false)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-3">
      {/* Toast de Sucesso */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-bold">
            <Check size={24} />
            PEDIDO REGISTRADO!
          </div>
        </div>
      )}

      {/* Header com total flutuante mobile */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl md:text-3xl text-gradient tracking-wide">PEDIDOS</h2>
        
        {/* Total flutuante + carrinho mobile */}
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <div className="bg-xtreme-black/80 border border-xtreme-orange/50 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-xtreme-cream/70 text-sm">{cartItemsCount}x</span>
              <span className="text-xtreme-yellow font-bold">R$ {total.toFixed(2)}</span>
            </div>
          )}
          <button
            onClick={() => setShowCart(true)}
            className="lg:hidden relative p-3 btn-fire rounded-xl"
          >
            <ShoppingCart size={22} className="text-xtreme-black" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-xtreme-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Category Filter - botões maiores para toque */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
            !selectedCategory
              ? 'btn-fire text-xtreme-black shadow-lg scale-105'
              : 'bg-xtreme-black/70 text-xtreme-cream border-2 border-xtreme-red/40'
          }`}
        >
          🔥 Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedCategory === cat.id
                ? 'btn-fire text-xtreme-black shadow-lg scale-105'
                : 'bg-xtreme-black/70 text-xtreme-cream border-2 border-xtreme-red/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3 lg:gap-6">
        {/* Menu - Cards grandes e clicáveis */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
            {filteredDishes.map(dish => {
              const cartItem = cart.find(item => item.dishId === dish.id)
              const isJustAdded = lastAdded === dish.id
              return (
                <button
                  key={dish.id}
                  onClick={() => addToCart(dish)}
                  className={`relative bg-gradient-to-br from-xtreme-black/90 to-xtreme-blue/40 rounded-xl p-3 md:p-4 border-2 text-left transition-all duration-200 active:scale-95 ${
                    cartItem 
                      ? 'border-xtreme-orange shadow-lg shadow-xtreme-orange/20' 
                      : 'border-xtreme-orange/30'
                  } ${isJustAdded ? 'ring-4 ring-green-500 scale-95' : ''}`}
                >
                  {/* Badge quantidade */}
                  {cartItem && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-xtreme-orange text-xtreme-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {cartItem.quantity}
                    </div>
                  )}
                  
                  {/* Badge Bingo */}
                  {dish.givesBingoEntry && (
                    <span className="absolute top-2 left-2 bg-fire text-xtreme-black text-[9px] px-1.5 py-0.5 rounded font-bold">
                      🎯
                    </span>
                  )}
                  
                  <div className="pt-1">
                    <h3 className="font-bold text-xtreme-cream text-sm md:text-base line-clamp-2 leading-tight mb-2">
                      {dish.name}
                    </h3>
                    <div className="text-lg md:text-xl font-bold text-gradient">
                      R$ {dish.price.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Controles de quantidade */}
                  {cartItem && (
                    <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-xtreme-orange/30">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuantity(dish.id, -1) }}
                        className="w-10 h-10 rounded-full bg-xtreme-red text-white flex items-center justify-center active:scale-90 font-bold text-xl"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-xl text-xtreme-yellow">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuantity(dish.id, 1) }}
                        className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center active:scale-90 font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {filteredDishes.length === 0 && (
            <div className="text-center py-8 text-xtreme-cream/50 bg-xtreme-black/30 rounded-xl border border-xtreme-red/20">
              <p>Nenhum prato disponível</p>
            </div>
          )}
        </div>

        {/* Cart Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-gradient-to-br from-xtreme-black/90 to-xtreme-blue/40 rounded-xl p-5 sticky top-20 border border-xtreme-orange/30 card-glow">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-xtreme-orange/20">
              <div className="p-2 bg-fire rounded-lg">
                <ShoppingCart className="text-xtreme-black" size={24} />
              </div>
              <h2 className="font-display text-2xl text-xtreme-cream tracking-wide">CARRINHO</h2>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto text-xtreme-cream/20 mb-3" size={48} />
                <p className="text-xtreme-cream/50">Carrinho vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.dishId} className="flex items-center justify-between py-3 border-b border-xtreme-cream/10">
                      <div className="flex-1">
                        <p className="font-semibold text-xtreme-cream">{item.dishName}</p>
                        <p className="text-xs text-xtreme-cream/50">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xtreme-yellow">
                          R$ {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.dishId)}
                          className="text-xtreme-cream/40 hover:text-xtreme-red transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {bingoEntries > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-xtreme-yellow/20 to-xtreme-orange/20 rounded-lg border border-xtreme-yellow/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🎯</span>
                      <span className="text-sm font-bold text-xtreme-yellow">
                        {bingoEntries} entrada(s) no Bingo!
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Nome para o Bingo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40 focus:ring-2 focus:ring-xtreme-orange focus:border-transparent"
                    />
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-xtreme-orange/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-xtreme-cream">Total:</span>
                    <span className="text-3xl font-bold text-gradient">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-4 btn-fire text-xtreme-black rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-fire"
                  >
                    {isSubmitting ? '🔥 Registrando...' : '🔥 FINALIZAR PEDIDO'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal Mobile */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          
          <div className="relative mt-auto bg-gradient-to-br from-xtreme-black to-xtreme-blue/50 rounded-t-3xl p-4 pb-24 max-h-[85vh] overflow-y-auto border-t border-xtreme-orange/30">
            <div className="w-12 h-1 bg-xtreme-cream/30 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-xtreme-orange/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-fire rounded-lg">
                  <ShoppingCart className="text-xtreme-black" size={20} />
                </div>
                <h2 className="font-display text-xl text-xtreme-cream tracking-wide">CARRINHO</h2>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 text-xtreme-cream/60">
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto text-xtreme-cream/20 mb-3" size={40} />
                <p className="text-xtreme-cream/50">Carrinho vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.dishId} className="flex items-center justify-between py-3 border-b border-xtreme-cream/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xtreme-cream truncate">{item.dishName}</p>
                        <p className="text-xs text-xtreme-cream/50">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xtreme-yellow text-sm">
                          R$ {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.dishId)}
                          className="text-xtreme-cream/40 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {bingoEntries > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-xtreme-yellow/20 to-xtreme-orange/20 rounded-lg border border-xtreme-yellow/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="text-sm font-bold text-xtreme-yellow">
                        {bingoEntries} entrada(s) no Bingo!
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Nome para o Bingo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40 text-sm"
                    />
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-xtreme-orange/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-bold text-xtreme-cream">Total:</span>
                    <span className="text-2xl font-bold text-gradient">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => { handleSubmit(); setShowCart(false); }}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-4 btn-fire text-xtreme-black rounded-xl font-bold text-base disabled:opacity-50"
                  >
                    {isSubmitting ? '🔥 Registrando...' : '🔥 FINALIZAR PEDIDO'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
