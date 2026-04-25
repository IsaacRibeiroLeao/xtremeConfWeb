export interface Category {
  id: string
  name: string
  order: number
}

export interface Dish {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  givesBingoEntry: boolean
  available: boolean
}

export interface OrderItem {
  dishId: string
  dishName: string
  quantity: number
  unitPrice: number
  givesBingoEntry: boolean
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  customerName?: string
  bingoEntries: string[]
  createdAt: Date
  status: 'pending' | 'completed' | 'cancelled'
}

export interface BingoParticipant {
  id: string
  name: string
  orderId?: string
  addedManually: boolean
  createdAt: Date
}
