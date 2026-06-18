'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../lib/cartContext'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useClientOnly } from '../lib/useClientOnly'
import { products } from '../data/products'
import { formatUSD } from '../lib/format'

export default function Navbar() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, loading: cartLoading, fetchCart } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const pathname = usePathname()
  const isClient = useClientOnly()

  useEffect(() => {
    if (!isClient) return
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }
    
    checkAuth()
    
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [pathname, isClient])

  const handleLogout = () => {
    if (!isClient) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    fetchCart() // clear cart on logout
  }

  if (!isClient) return null

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 shadow-lg"
      aria-label="Primary"
    >
      <div className="container flex items-center justify-between h-20">
        <Link href="/" className="font-heading text-2xl md:text-3xl text-yellow-300 font-bold tracking-wide hover:scale-105 transition-transform" aria-label="Royal Organics home">
          🌿 Royal Organics
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-white hover:text-yellow-300 font-medium transition-colors">Shop</Link>
          <Link href="/about" className="text-white hover:text-yellow-300 font-medium transition-colors">About</Link>
          <Link href="/science-quality" className="text-white hover:text-yellow-300 font-medium transition-colors">Science & Quality</Link>
          <Link href="/faq" className="text-white hover:text-yellow-300 font-medium transition-colors">FAQ</Link>
          <Link href="/contact" className="text-white hover:text-yellow-300 font-medium transition-colors">Contact Us</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowMiniCart(!showMiniCart)}
              className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-5 py-2 rounded-full font-semibold flex items-center gap-2 shadow-md hover:shadow-xl transition-all"
            >
              🛒 Cart 
              {totalItems > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showMiniCart && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Your Cart</h3>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-4xl mb-2">🛒</p>
                        <p>Your cart is empty!</p>
                      </div>
                    ) : (
                      cart.map((item) => {
                        const product = products.find(p => p.id === item.productId)
                        return (
                          <div key={item.productId} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex gap-4 items-start">
                              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-2xl">
                                🌱
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{product?.name}</p>
                                <p className="text-sm text-gray-500">{formatUSD(item.pricePerUnit)} per unit</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={async () => {
                                      if (item.quantity > 1) {
                                        setProcessing(item.productId)
                                        try {
                                          await updateQuantity(item.productId, item.quantity - 1)
                                        } finally {
                                          setProcessing(null)
                                        }
                                      }
                                    }}
                                    disabled={item.quantity <= 1 || processing === item.productId}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
                                  >
                                    -
                                  </button>
                                  <span className="font-semibold text-gray-800 w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={async () => {
                                      setProcessing(item.productId)
                                      try {
                                        await updateQuantity(item.productId, item.quantity + 1)
                                      } finally {
                                        setProcessing(null)
                                      }
                                    }}
                                    disabled={processing === item.productId}
                                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-800">{formatUSD(item.quantity * item.pricePerUnit)}</p>
                                <button
                                  onClick={async () => {
                                    setProcessing(item.productId)
                                    try {
                                      await removeFromCart(item.productId)
                                    } finally {
                                      setProcessing(null)
                                    }
                                  }}
                                  disabled={processing === item.productId}
                                  className="text-red-500 hover:text-red-700 text-xs mt-1 disabled:opacity-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  
                  {cart.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-b-xl">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700 font-semibold">Total:</span>
                        <span className="text-xl font-bold text-emerald-800">{formatUSD(totalPrice)}</span>
                      </div>
                      <Link href="/cart" onClick={() => setShowMiniCart(false)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-center block transition-colors">
                        View Cart & Checkout
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {isLoggedIn ? (
            <>
              <Link href="/my-orders" className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                My Orders
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-5 py-2 rounded-lg font-bold transition-colors">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
