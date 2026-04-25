import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Dish, Order, BingoParticipant } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true })
    
    if (!error && data) {
      setCategories(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
    const interval = setInterval(fetchCategories, 5000)
    return () => clearInterval(interval)
  }, [fetchCategories])

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const { error } = await supabase.from('categories').insert(category)
    if (error) throw error
    fetchCategories()
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id)
    if (error) throw error
    fetchCategories()
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    fetchCategories()
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory, refetch: fetchCategories }
}

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDishes = useCallback(async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
    
    if (!error && data) {
      setDishes(data.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: d.name as string,
        description: d.description as string,
        price: d.price as number,
        categoryId: d.category_id as string,
        givesBingoEntry: d.gives_bingo_entry as boolean,
        available: d.available as boolean
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDishes()
    const interval = setInterval(fetchDishes, 5000)
    return () => clearInterval(interval)
  }, [fetchDishes])

  const addDish = async (dish: Omit<Dish, 'id'>) => {
    const { error } = await supabase.from('dishes').insert({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category_id: dish.categoryId,
      gives_bingo_entry: dish.givesBingoEntry,
      available: dish.available
    })
    if (error) throw error
    fetchDishes()
  }

  const addMultipleDishes = async (dishesData: Omit<Dish, 'id'>[]) => {
    const { error } = await supabase.from('dishes').insert(
      dishesData.map(dish => ({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category_id: dish.categoryId,
        gives_bingo_entry: dish.givesBingoEntry,
        available: dish.available
      }))
    )
    if (error) throw error
    fetchDishes()
  }

  const updateDish = async (id: string, data: Partial<Dish>) => {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId
    if (data.givesBingoEntry !== undefined) updateData.gives_bingo_entry = data.givesBingoEntry
    if (data.available !== undefined) updateData.available = data.available

    const { error } = await supabase.from('dishes').update(updateData).eq('id', id)
    if (error) throw error
    fetchDishes()
  }

  const deleteDish = async (id: string) => {
    const { error } = await supabase.from('dishes').delete().eq('id', id)
    if (error) throw error
    fetchDishes()
  }

  return { dishes, loading, addDish, addMultipleDishes, updateDish, deleteDish, refetch: fetchDishes }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setOrders(data.map(o => ({
        ...o,
        customerName: o.customer_name,
        bingoEntries: o.bingo_entries || [],
        createdAt: new Date(o.created_at),
        paymentMethod: o.payment_method,
        receiptImage: o.receipt_image
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('orders').insert({
      items: order.items,
      total: order.total,
      customer_name: order.customerName || null,
      bingo_entries: order.bingoEntries,
      status: order.status,
      payment_method: order.paymentMethod || null,
      receipt_image: order.receiptImage || null
    })
    if (error) throw error
    fetchOrders()
  }

  const updateOrder = async (id: string, data: Partial<Order>) => {
    const updateData: Record<string, unknown> = {}
    if (data.items !== undefined) updateData.items = data.items
    if (data.total !== undefined) updateData.total = data.total
    if (data.customerName !== undefined) updateData.customer_name = data.customerName
    if (data.bingoEntries !== undefined) updateData.bingo_entries = data.bingoEntries
    if (data.status !== undefined) updateData.status = data.status
    if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod
    if (data.receiptImage !== undefined) updateData.receipt_image = data.receiptImage

    const { error } = await supabase.from('orders').update(updateData).eq('id', id)
    if (error) throw error
    fetchOrders()
  }

  return { orders, loading, addOrder, updateOrder, refetch: fetchOrders }
}

export function useBingo() {
  const [participants, setParticipants] = useState<BingoParticipant[]>([])
  const [loading, setLoading] = useState(true)

  const fetchParticipants = useCallback(async () => {
    const { data, error } = await supabase
      .from('bingo')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setParticipants(data.map(p => ({
        ...p,
        orderId: p.order_id,
        addedManually: p.added_manually,
        createdAt: new Date(p.created_at)
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchParticipants()
    const interval = setInterval(fetchParticipants, 5000)
    return () => clearInterval(interval)
  }, [fetchParticipants])

  const addParticipant = async (participant: Omit<BingoParticipant, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('bingo').insert({
      name: participant.name,
      order_id: participant.orderId || null,
      added_manually: participant.addedManually
    })
    if (error) throw error
    fetchParticipants()
  }

  const addMultipleParticipants = async (names: string[], orderId?: string) => {
    const { error } = await supabase.from('bingo').insert(
      names.map(name => ({
        name,
        order_id: orderId || null,
        added_manually: !orderId
      }))
    )
    if (error) throw error
    fetchParticipants()
  }

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('bingo').delete().eq('id', id)
    if (error) throw error
    fetchParticipants()
  }

  const clearAllParticipants = async () => {
    const { error } = await supabase.from('bingo').delete().gte('created_at', '1970-01-01')
    if (error) throw error
    fetchParticipants()
  }

  return { participants, loading, addParticipant, addMultipleParticipants, deleteParticipant, clearAllParticipants, refetch: fetchParticipants }
}
