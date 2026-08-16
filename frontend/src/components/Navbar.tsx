'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../lib/cartContext'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useClientOnly } from '../lib/useClientOnly'
import { products } from '../data/products'
import { formatINR } from '../lib/format'

export default function Navbar() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, loading: cartLoading, fetchCart } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
    setShowMobileMenu(false)
    fetchCart()
  }

  if (!isClient) return null

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/science-quality', label: 'Science & Quality' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 shadow-lg"
      aria-label="Primary"
    >
      <div className="container flex items-center justify-between h-16 md:h-20 px-3 md:px-8">
        <Link href="/" className="font-heading text-lg sm:text-2xl md:text-3xl text-yellow-300 font-bold tracking-wide hover:scale-105 transition-transform" aria-label="Royal Organics home">
          🌿 Royal Organics
        </Link>
        
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-white hover:text-yellow-300 font-medium transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="relative">
            <button
              onClick={() => { setShowMiniCart(!showMiniCart); setShowMobileMenu(false) }}
              className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-2 sm:px-3 md:px-5 py-2 rounded-full font-semibold flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-xl transition-all text-sm md:text-base"
            >
              🛒
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shadow-sm">
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
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                  style={{ width: 'min(calc(100vw - 1.5rem), 24rem)' }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Your Cart</h3>
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto">
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
                            <div className="flex gap-3 items-start">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                                🌱
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{product?.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{formatINR(item.pricePerUnit)} per unit</p>
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
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
                                  >
                                    -
                                  </button>
                                  <span className="font-semibold text-gray-800 w-6 sm:w-8 text-center text-sm">{item.quantity}</span>
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
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-gray-800 text-sm">{formatINR(item.quantity * item.pricePerUnit)}</p>
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
                        <span className="text-gray-700 font-semibold text-sm sm:text-base">Total:</span>
                        <span className="text-lg sm:text-xl font-bold text-emerald-800">{formatINR(totalPrice)}</span>
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
          
          <div className="hidden md:flex items-center gap-2 md:gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/my-orders" className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base whitespace-nowrap">
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-3 md:px-5 py-2 rounded-lg font-bold transition-colors text-sm md:text-base whitespace-nowrap">
                Login / Sign Up
              </Link>
            )}
          </div>

          <button
            onClick={() => { setShowMobileMenu(!showMobileMenu); setShowMiniCart(false) }}
            className="md:hidden text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-emerald-900/95 backdrop-blur-sm overflow-hidden border-t border-emerald-700"
          >
            <div className="container px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-white hover:bg-emerald-800 hover:text-yellow-300 rounded-lg font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-emerald-700 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/my-orders"
                      onClick={() => setShowMobileMenu(false)}
                      className="block px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium text-center transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 rounded-lg font-bold text-center transition-colors"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
