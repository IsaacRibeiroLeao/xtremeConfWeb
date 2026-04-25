import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useCategories, useDishes } from '../hooks/useSupabase'
import type { Dish } from '../types'

export default function Menu() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const { dishes, addDish, addMultipleDishes, updateDish, deleteDish } = useDishes()
  
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  
  const [showAddDish, setShowAddDish] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedCategoryForDish, setSelectedCategoryForDish] = useState('')
  
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    givesBingoEntry: false
  })
  
  const [bulkDishes, setBulkDishes] = useState<Array<{
    name: string
    description: string
    price: string
    givesBingoEntry: boolean
  }>>([{ name: '', description: '', price: '', givesBingoEntry: false }])

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await addCategory({
      name: newCategoryName.trim(),
      order: categories.length
    })
    setNewCategoryName('')
  }

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return
    await updateCategory(id, { name: editCategoryName.trim() })
    setEditingCategory(null)
  }

  const handleDeleteCategory = async (id: string) => {
    const categoryDishes = dishes.filter(d => d.categoryId === id)
    if (categoryDishes.length > 0) {
      alert('Remova todos os pratos desta categoria antes de excluí-la')
      return
    }
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id)
    }
  }

  const handleAddSingleDish = async () => {
    if (!newDish.name.trim() || !selectedCategoryForDish || !newDish.price) return
    
    await addDish({
      name: newDish.name.trim(),
      description: newDish.description.trim(),
      price: parseFloat(newDish.price),
      categoryId: selectedCategoryForDish,
      givesBingoEntry: newDish.givesBingoEntry,
      available: true
    })
    
    setNewDish({ name: '', description: '', price: '', givesBingoEntry: false })
    setShowAddDish(false)
  }

  const handleAddBulkDishes = async () => {
    if (!selectedCategoryForDish) return
    
    const validDishes = bulkDishes.filter(d => d.name.trim() && d.price)
    if (validDishes.length === 0) return
    
    const dishesToAdd: Omit<Dish, 'id'>[] = validDishes.map(d => ({
      name: d.name.trim(),
      description: d.description.trim(),
      price: parseFloat(d.price),
      categoryId: selectedCategoryForDish,
      givesBingoEntry: d.givesBingoEntry,
      available: true
    }))
    
    await addMultipleDishes(dishesToAdd)
    setBulkDishes([{ name: '', description: '', price: '', givesBingoEntry: false }])
    setShowAddDish(false)
  }

  const addBulkRow = () => {
    setBulkDishes([...bulkDishes, { name: '', description: '', price: '', givesBingoEntry: false }])
  }

  const removeBulkRow = (index: number) => {
    if (bulkDishes.length > 1) {
      setBulkDishes(bulkDishes.filter((_, i) => i !== index))
    }
  }

  const updateBulkRow = (index: number, field: string, value: string | boolean) => {
    setBulkDishes(bulkDishes.map((d, i) => 
      i === index ? { ...d, [field]: value } : d
    ))
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleDishAvailability = async (dish: Dish) => {
    await updateDish(dish.id, { available: !dish.available })
  }

  const handleDeleteDish = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prato?')) {
      await deleteDish(id)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl md:text-3xl text-gradient tracking-wide">CARDÁPIO</h2>
        <button
          onClick={() => setShowAddDish(true)}
          className="px-4 py-2 md:px-6 md:py-3 btn-fire text-xtreme-black rounded-xl flex items-center gap-2 font-bold text-sm md:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Adicionar</span> Pratos
        </button>
      </div>

      {/* Add Category - Compacto no mobile */}
      <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/30 rounded-xl p-3 md:p-5 border border-xtreme-blue/30">
        <h3 className="font-semibold mb-3 text-xtreme-cream flex items-center gap-2 text-sm md:text-base">
          <Plus className="text-xtreme-blue" size={18} />
          Nova Categoria
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            className="flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-xtreme-black/50 border border-xtreme-blue/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40 focus:ring-2 focus:ring-xtreme-orange focus:border-transparent text-sm md:text-base"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            className="px-4 py-2.5 md:px-6 md:py-3 bg-xtreme-blue text-white rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm md:text-base"
          >
            <span className="hidden sm:inline">Adicionar</span>
            <Plus size={20} className="sm:hidden" />
          </button>
        </div>
      </div>

      {/* Categories and Dishes */}
      <div className="space-y-3">
        {categories.map(category => {
          const categoryDishes = dishes.filter(d => d.categoryId === category.id)
          const isExpanded = expandedCategories.has(category.id)
          
          return (
            <div key={category.id} className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/20 rounded-xl overflow-hidden border border-xtreme-orange/30">
              <div 
                className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-xtreme-orange/20 to-transparent cursor-pointer active:bg-xtreme-orange/30 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  {isExpanded ? <ChevronUp size={18} className="text-xtreme-orange flex-shrink-0" /> : <ChevronDown size={18} className="text-xtreme-orange flex-shrink-0" />}
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream text-sm flex-1"
                    />
                  ) : (
                    <span className="font-bold text-xtreme-cream text-base md:text-lg truncate">{category.name}</span>
                  )}
                  <span className="text-xs text-xtreme-cream/50 bg-xtreme-black/30 px-2 py-0.5 rounded-full flex-shrink-0">{categoryDishes.length}</span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {editingCategory === category.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        className="p-2 text-green-400 rounded-lg"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-2 text-xtreme-cream/50 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingCategory(category.id)
                          setEditCategoryName(category.name)
                        }}
                        className="p-2 text-xtreme-blue rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-xtreme-red rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-2 md:p-4 space-y-2 border-t border-xtreme-cream/10">
                  {categoryDishes.length === 0 ? (
                    <p className="text-xtreme-cream/40 text-center py-4 text-sm">Nenhum prato nesta categoria</p>
                  ) : (
                    categoryDishes.map(dish => (
                      <div 
                        key={dish.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all gap-2 ${
                          dish.available 
                            ? 'bg-xtreme-black/30 border-xtreme-cream/10' 
                            : 'bg-xtreme-black/50 border-xtreme-red/20 opacity-60'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xtreme-cream text-sm md:text-base">{dish.name}</span>
                            {dish.givesBingoEntry && (
                              <span className="bg-fire text-xtreme-black text-[10px] px-1.5 py-0.5 rounded font-bold">
                                🎯
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-xtreme-yellow text-sm">
                              R$ {dish.price.toFixed(2)}
                            </span>
                            {!dish.available && (
                              <span className="text-xtreme-red text-xs">• Indisponível</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleDishAvailability(dish)}
                            className={`p-2 rounded-lg text-xs font-semibold ${
                              dish.available 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-xtreme-orange/20 text-xtreme-orange'
                            }`}
                          >
                            {dish.available ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish.id)}
                            className="p-2 text-xtreme-red/60 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="text-center py-8 md:py-12 text-xtreme-cream/40 bg-xtreme-black/30 rounded-xl border border-xtreme-cream/10">
            <p className="text-base md:text-lg">Nenhuma categoria cadastrada.</p>
            <p className="text-sm mt-1">Adicione uma categoria acima.</p>
          </div>
        )}
      </div>

      {/* Add Dish Modal */}
      {showAddDish && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="bg-gradient-to-br from-xtreme-black to-xtreme-blue/50 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-y-auto border-t md:border border-xtreme-orange/30 card-glow">
            <div className="p-4 md:p-5 border-b border-xtreme-orange/20 flex justify-between items-center sticky top-0 bg-xtreme-black/95 backdrop-blur-sm z-10">
              <h3 className="font-display text-lg md:text-2xl text-gradient tracking-wide">ADICIONAR PRATOS</h3>
              <button onClick={() => setShowAddDish(false)} className="text-xtreme-cream/50 hover:text-xtreme-red transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 md:p-5 space-y-4 pb-24 md:pb-5">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-xtreme-cream/80">Categoria *</label>
                <select
                  value={selectedCategoryForDish}
                  onChange={(e) => setSelectedCategoryForDish(e.target.value)}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 bg-xtreme-black/50 border rounded-lg text-xtreme-cream focus:ring-2 focus:ring-xtreme-orange text-sm md:text-base ${
                    !selectedCategoryForDish ? 'border-xtreme-red/50' : 'border-xtreme-orange/30'
                  }`}
                >
                  <option value="">⚠️ Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {!selectedCategoryForDish && categories.length === 0 && (
                  <p className="text-xs text-xtreme-red mt-1">Crie uma categoria primeiro!</p>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm ${
                    !bulkMode ? 'btn-fire text-xtreme-black' : 'bg-xtreme-black/50 text-xtreme-cream/60 border border-xtreme-cream/20'
                  }`}
                >
                  Único
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm ${
                    bulkMode ? 'btn-fire text-xtreme-black' : 'bg-xtreme-black/50 text-xtreme-cream/60 border border-xtreme-cream/20'
                  }`}
                >
                  Múltiplos
                </button>
              </div>

              {!bulkMode ? (
                /* Single Dish Form */
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome do prato"
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    className="w-full px-4 py-3 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40"
                  />
                  <input
                    type="text"
                    placeholder="Descrição (opcional)"
                    value={newDish.description}
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                    className="w-full px-4 py-3 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40"
                  />
                  <input
                    type="number"
                    placeholder="Preço"
                    step="0.01"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    className="w-full px-4 py-3 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream placeholder-xtreme-cream/40"
                  />
                  <label className="flex items-center gap-3 p-3 bg-xtreme-yellow/10 rounded-lg border border-xtreme-yellow/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDish.givesBingoEntry}
                      onChange={(e) => setNewDish({ ...newDish, givesBingoEntry: e.target.checked })}
                      className="w-5 h-5 text-xtreme-orange rounded"
                    />
                    <span className="text-xtreme-cream font-medium">🎯 Dá direito a participar do Bingo</span>
                  </label>
                  <button
                    onClick={handleAddSingleDish}
                    disabled={!newDish.name || !selectedCategoryForDish || !newDish.price}
                    className="w-full py-4 btn-fire text-xtreme-black rounded-xl font-bold text-lg disabled:opacity-50"
                  >
                    🔥 Adicionar Prato
                  </button>
                </div>
              ) : (
                /* Bulk Dishes Form */
                <div className="space-y-4">
                  {bulkDishes.map((dish, index) => (
                    <div key={index} className="p-4 bg-xtreme-black/30 border border-xtreme-cream/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-xtreme-orange">Prato {index + 1}</span>
                        {bulkDishes.length > 1 && (
                          <button
                            onClick={() => removeBulkRow(index)}
                            className="text-xtreme-red/60 hover:text-xtreme-red p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nome"
                          value={dish.name}
                          onChange={(e) => updateBulkRow(index, 'name', e.target.value)}
                          className="px-3 py-2 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream text-sm placeholder-xtreme-cream/40"
                        />
                        <input
                          type="number"
                          placeholder="Preço"
                          step="0.01"
                          value={dish.price}
                          onChange={(e) => updateBulkRow(index, 'price', e.target.value)}
                          className="px-3 py-2 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream text-sm placeholder-xtreme-cream/40"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Descrição (opcional)"
                        value={dish.description}
                        onChange={(e) => updateBulkRow(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-xtreme-black/50 border border-xtreme-orange/30 rounded-lg text-xtreme-cream text-sm placeholder-xtreme-cream/40"
                      />
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dish.givesBingoEntry}
                          onChange={(e) => updateBulkRow(index, 'givesBingoEntry', e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xtreme-yellow font-medium">🎯 Bingo</span>
                      </label>
                    </div>
                  ))}
                  <button
                    onClick={addBulkRow}
                    className="w-full py-3 border-2 border-dashed border-xtreme-orange/30 rounded-xl text-xtreme-cream/50 hover:border-xtreme-orange hover:text-xtreme-orange transition-colors font-medium"
                  >
                    + Adicionar mais um prato
                  </button>
                  <button
                    onClick={handleAddBulkDishes}
                    disabled={!selectedCategoryForDish || bulkDishes.every(d => !d.name || !d.price)}
                    className="w-full py-4 btn-fire text-xtreme-black rounded-xl font-bold text-lg disabled:opacity-50"
                  >
                    🔥 Adicionar {bulkDishes.filter(d => d.name && d.price).length} Prato(s)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
