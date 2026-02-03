"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (menuItem: MenuItem) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (menuItem: MenuItem) => {
        const items = get().items
        const existingItem = items.find(item => item.menuItem.id === menuItem.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.menuItem.id === menuItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({ items: [...items, { menuItem, quantity: 1 }] })
        }
      },
      
      removeItem: (menuItemId: string) => {
        set({ items: get().items.filter(item => item.menuItem.id !== menuItemId) })
      },
      
      updateQuantity: (menuItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map(item =>
            item.menuItem.id === menuItemId ? { ...item, quantity } : item
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    }),
    {
      name: 'canteen-cart',
    }
  )
)
