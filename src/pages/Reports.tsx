import { useState } from 'react'
import { FileSpreadsheet, Download, TrendingUp, DollarSign, ShoppingBag, Receipt, X, CreditCard, Banknote, Smartphone, Image } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useOrders, useDishes, useCategories } from '../hooks/useSupabase'
import type { Order, PaymentMethod } from '../types'

const paymentLabels: Record<PaymentMethod, { label: string; icon: typeof Banknote }> = {
  cash: { label: 'Dinheiro', icon: Banknote },
  pix: { label: 'PIX', icon: Smartphone },
  credit: { label: 'Crédito', icon: CreditCard },
  debit: { label: 'Débito', icon: CreditCard },
}

export default function Reports() {
  const { orders } = useOrders()
  const { dishes } = useDishes()
  const { categories } = useCategories()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const completedOrders = orders.filter(o => o.status === 'completed')
  
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = completedOrders.length
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const dishSales: Record<string, { name: string; quantity: number; revenue: number; categoryId: string }> = {}
  
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!dishSales[item.dishId]) {
        dishSales[item.dishId] = {
          name: item.dishName,
          quantity: 0,
          revenue: 0,
          categoryId: dishes.find(d => d.id === item.dishId)?.categoryId || ''
        }
      }
      dishSales[item.dishId].quantity += item.quantity
      dishSales[item.dishId].revenue += item.unitPrice * item.quantity
    })
  })

  const sortedDishSales = Object.values(dishSales).sort((a, b) => b.revenue - a.revenue)

  const categorySales: Record<string, { name: string; quantity: number; revenue: number }> = {}
  
  sortedDishSales.forEach(dish => {
    const category = categories.find(c => c.id === dish.categoryId)
    const categoryName = category?.name || 'Sem Categoria'
    
    if (!categorySales[categoryName]) {
      categorySales[categoryName] = { name: categoryName, quantity: 0, revenue: 0 }
    }
    categorySales[categoryName].quantity += dish.quantity
    categorySales[categoryName].revenue += dish.revenue
  })

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ['Relatório de Vendas - Conexão Xtreme'],
      [''],
      ['Resumo Geral'],
      ['Total de Pedidos', totalOrders],
      ['Receita Total', `R$ ${totalRevenue.toFixed(2)}`],
      ['Ticket Médio', `R$ ${averageTicket.toFixed(2)}`],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo')

    // Sales by Dish Sheet
    const dishData = [
      ['Vendas por Prato'],
      [''],
      ['Prato', 'Quantidade', 'Receita'],
      ...sortedDishSales.map(d => [d.name, d.quantity, `R$ ${d.revenue.toFixed(2)}`])
    ]
    const dishSheet = XLSX.utils.aoa_to_sheet(dishData)
    XLSX.utils.book_append_sheet(wb, dishSheet, 'Vendas por Prato')

    // Sales by Category Sheet
    const categoryData = [
      ['Vendas por Categoria'],
      [''],
      ['Categoria', 'Quantidade', 'Receita'],
      ...Object.values(categorySales).map(c => [c.name, c.quantity, `R$ ${c.revenue.toFixed(2)}`])
    ]
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Vendas por Categoria')

    // Orders Detail Sheet
    const ordersData = [
      ['Detalhamento de Pedidos'],
      [''],
      ['ID', 'Data/Hora', 'Cliente', 'Itens', 'Total'],
      ...completedOrders.map(o => [
        o.id.slice(0, 8),
        o.createdAt.toLocaleString('pt-BR'),
        o.customerName || '-',
        o.items.map(i => `${i.quantity}x ${i.dishName}`).join(', '),
        `R$ ${o.total.toFixed(2)}`
      ])
    ]
    const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
    XLSX.utils.book_append_sheet(wb, ordersSheet, 'Pedidos')

    // Download
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `conexao-xtreme-vendas-${date}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-display text-3xl text-gradient tracking-wide flex items-center gap-3">
          <FileSpreadsheet className="text-xtreme-yellow" />
          RELATÓRIOS
        </h2>
        <button
          onClick={exportToExcel}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-green-700 font-bold shadow-lg transition-all"
        >
          <Download size={20} />
          Exportar Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-xtreme-blue/80 to-xtreme-black rounded-xl p-5 border border-xtreme-blue/30 card-glow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-xtreme-cream/10 rounded-xl">
              <ShoppingBag className="text-xtreme-cream" size={28} />
            </div>
            <div>
              <p className="text-sm text-xtreme-cream/60 font-medium">Total de Pedidos</p>
              <p className="text-3xl font-bold text-xtreme-cream">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-xtreme-red/80 to-xtreme-black rounded-xl p-5 border border-xtreme-red/30 card-glow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-xtreme-cream/10 rounded-xl">
              <DollarSign className="text-xtreme-cream" size={28} />
            </div>
            <div>
              <p className="text-sm text-xtreme-cream/60 font-medium">Receita Total</p>
              <p className="text-3xl font-bold text-xtreme-yellow">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-xtreme-orange/80 to-xtreme-black rounded-xl p-5 border border-xtreme-orange/30 card-glow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-xtreme-cream/10 rounded-xl">
              <TrendingUp className="text-xtreme-cream" size={28} />
            </div>
            <div>
              <p className="text-sm text-xtreme-cream/60 font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold text-xtreme-cream">R$ {averageTicket.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Dish */}
        <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-blue/30 rounded-xl overflow-hidden border border-xtreme-blue/30">
          <div className="p-4 bg-gradient-to-r from-xtreme-blue to-xtreme-blue/50">
            <h3 className="font-display text-lg text-xtreme-cream tracking-wide">VENDAS POR PRATO</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {sortedDishSales.length === 0 ? (
              <p className="text-xtreme-cream/40 text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <table className="w-full">
                <thead className="bg-xtreme-black/50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-xtreme-cream/60">Prato</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-xtreme-cream/60">Qtd</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-xtreme-cream/60">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDishSales.map((dish, index) => (
                    <tr key={index} className="border-t border-xtreme-cream/10">
                      <td className="px-4 py-3 text-xtreme-cream">{dish.name}</td>
                      <td className="px-4 py-3 text-center text-xtreme-cream/80">{dish.quantity}</td>
                      <td className="px-4 py-3 text-right font-bold text-xtreme-yellow">
                        R$ {dish.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-orange/20 rounded-xl overflow-hidden border border-xtreme-orange/30">
          <div className="p-4 bg-gradient-to-r from-xtreme-orange to-xtreme-orange/50">
            <h3 className="font-display text-lg text-xtreme-black tracking-wide">VENDAS POR CATEGORIA</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {Object.keys(categorySales).length === 0 ? (
              <p className="text-xtreme-cream/40 text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <table className="w-full">
                <thead className="bg-xtreme-black/50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-xtreme-cream/60">Categoria</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-xtreme-cream/60">Qtd</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-xtreme-cream/60">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(categorySales).map((cat, index) => (
                    <tr key={index} className="border-t border-xtreme-cream/10">
                      <td className="px-4 py-3 text-xtreme-cream">{cat.name}</td>
                      <td className="px-4 py-3 text-center text-xtreme-cream/80">{cat.quantity}</td>
                      <td className="px-4 py-3 text-right font-bold text-xtreme-yellow">
                        R$ {cat.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gradient-to-br from-xtreme-black/80 to-xtreme-red/20 rounded-xl overflow-hidden border border-xtreme-red/30">
        <div className="p-4 bg-gradient-to-r from-xtreme-red to-xtreme-red/50">
          <h3 className="font-display text-lg text-xtreme-cream tracking-wide">ÚLTIMOS PEDIDOS</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {completedOrders.length === 0 ? (
            <p className="text-xtreme-cream/40 text-center py-8">Nenhum pedido registrado</p>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="w-full hidden md:table">
                <thead className="bg-xtreme-black/50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-xtreme-cream/60">Hora</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-xtreme-cream/60">Cliente</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-xtreme-cream/60">Itens</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-xtreme-cream/60">Pagamento</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-xtreme-cream/60">Comprov.</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-xtreme-cream/60">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.slice(0, 20).map(order => {
                    const payment = order.paymentMethod ? paymentLabels[order.paymentMethod] : null
                    const PaymentIcon = payment?.icon
                    return (
                      <tr key={order.id} className="border-t border-xtreme-cream/10 hover:bg-xtreme-cream/5">
                        <td className="px-4 py-3 text-sm text-xtreme-cream/80">
                          {order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-xtreme-cream">{order.customerName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-xtreme-cream/60 max-w-48 truncate">
                          {order.items.map(i => `${i.quantity}x ${i.dishName}`).join(', ')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {payment && PaymentIcon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-xtreme-blue/20 text-xtreme-blue rounded text-xs">
                              <PaymentIcon size={12} />
                              {payment.label}
                            </span>
                          ) : (
                            <span className="text-xtreme-cream/40 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {order.receiptImage ? (
                            <button
                              onClick={() => { setSelectedOrder(order); setShowReceiptModal(true) }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30"
                            >
                              <Receipt size={12} />
                              Ver
                            </button>
                          ) : (
                            <span className="text-xtreme-cream/40 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-xtreme-yellow">
                          R$ {order.total.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-2 p-2">
                {completedOrders.slice(0, 20).map(order => {
                  const payment = order.paymentMethod ? paymentLabels[order.paymentMethod] : null
                  const PaymentIcon = payment?.icon
                  return (
                    <div 
                      key={order.id} 
                      className="bg-xtreme-black/40 rounded-xl p-3 border border-xtreme-cream/10"
                      onClick={() => { if (order.receiptImage) { setSelectedOrder(order); setShowReceiptModal(true) }}}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xtreme-cream font-medium">{order.customerName || 'Cliente'}</p>
                          <p className="text-xs text-xtreme-cream/50">
                            {order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-xtreme-yellow">R$ {order.total.toFixed(2)}</p>
                      </div>
                      
                      <p className="text-xs text-xtreme-cream/60 mb-2 line-clamp-1">
                        {order.items.map(i => `${i.quantity}x ${i.dishName}`).join(', ')}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {payment && PaymentIcon && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-xtreme-blue/20 text-xtreme-blue rounded text-xs">
                            <PaymentIcon size={12} />
                            {payment.label}
                          </span>
                        )}
                        {order.receiptImage && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            <Image size={12} />
                            Comprovante
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-xtreme-black to-xtreme-blue/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-xtreme-orange/30">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-xtreme-cream/10">
              <div>
                <h3 className="font-display text-lg text-gradient">COMPROVANTE</h3>
                <p className="text-xs text-xtreme-cream/50">
                  {selectedOrder.createdAt.toLocaleString('pt-BR')}
                </p>
              </div>
              <button 
                onClick={() => { setShowReceiptModal(false); setSelectedOrder(null) }}
                className="p-2 text-xtreme-cream/60 hover:text-xtreme-red"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Order Info */}
            <div className="p-4 border-b border-xtreme-cream/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xtreme-cream/60 text-sm">Cliente:</span>
                <span className="text-xtreme-cream font-medium">{selectedOrder.customerName || '-'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xtreme-cream/60 text-sm">Total:</span>
                <span className="text-xtreme-yellow font-bold text-lg">R$ {selectedOrder.total.toFixed(2)}</span>
              </div>
              {selectedOrder.paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-xtreme-cream/60 text-sm">Pagamento:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-xtreme-blue/20 text-xtreme-blue rounded text-sm">
                    {(() => {
                      const p = paymentLabels[selectedOrder.paymentMethod!]
                      const Icon = p.icon
                      return <><Icon size={14} /> {p.label}</>
                    })()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Receipt Image */}
            <div className="p-4">
              <p className="text-sm text-xtreme-cream/60 mb-3">📷 Imagem do Comprovante:</p>
              {selectedOrder.receiptImage && (
                <img 
                  src={selectedOrder.receiptImage} 
                  alt="Comprovante" 
                  className="w-full rounded-lg border border-xtreme-cream/20"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
