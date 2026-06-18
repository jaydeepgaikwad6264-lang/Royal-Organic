'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, CartItem } from './api'
import { useClientOnly } from './useClientOnly'

type CartContextType = {
  cart: CartItem[]
  addToCart: (productId: string, quantity: number, pricePerUnit: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  loading: boolean
  error: string | null
  fetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isClient = useClientOnly()

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const cartData = await api.getCart()
      setCart(cartData.items)
    } catch (err: any) {
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem('token')
      if (token) {
        fetchCart()
      } else {
        setLoading(false)
      }
    }
  }, [isClient])

  // Also listen for storage events (in case user logs in in another tab)
  useEffect(() => {
    if (isClient) {
      const handleStorageChange = () => {
        const token = localStorage.getItem('token')
        if (token) {
          fetchCart()
        } else {
          setCart([])
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      // Also, periodically check if token exists
      const interval = setInterval(() => {
        const token = localStorage.getItem('token')
        if (token && cart.length === 0) {
          fetchCart()
        }
      }, 1000)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        clearInterval(interval)
      }
    }
  }, [isClient, cart.length])

  const addToCart = async (productId: string, quantity: number, pricePerUnit: number) => {
    try {
      const cartData = await api.addToCart(productId, quantity, pricePerUnit)
      setCart(cartData.items)
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart')
      throw err
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const cartData = await api.removeFromCart(productId)
      setCart(cartData.items)
    } catch (err: any) {
      setError(err.message || 'Failed to remove from cart')
      throw err
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const cartData = await api.updateQuantity(productId, quantity)
      setCart(cartData.items)
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity')
      throw err
    }
  }

  const clearCart = async () => {
    try {
      const cartData = await api.clearCart()
      setCart(cartData.items)
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart')
      throw err
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading, error, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
