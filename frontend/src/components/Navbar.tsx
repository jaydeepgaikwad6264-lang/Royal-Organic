'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../lib/cartContext'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useClientOnly } from '../lib/useClientOnly'
import { products } from '../data/products'
import { formatINR } from '../lib/format'
import { FaShoppingCart, FaTimes, FaUserCircle } from 'react-icons/fa'
import Image from 'next/image'
import logoImg from '../lib/logo.jpeg'

// Helper function to extract and format a readable name from email
function extractNameFromEmail(email: string): string {
  if (!email || typeof email !== 'string') return 'User'
  const username = email.split('@')[0]
  if (!username) return 'User'

  // Replace dots, underscores, dashes, and numbers with spaces
  const cleaned = username.replace(/[._\-0-9]+/g, ' ').trim()
  if (!cleaned) return username

  // Capitalize each word (e.g. "john doe" -> "John Doe")
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function Navbar() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, loading: cartLoading, fetchCart } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [displayName, setDisplayName] = useState<string>('')
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const pathname = usePathname()
  const isClient = useClientOnly()

  useEffect(() => {
    if (!isClient) return
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const valid = !!token && token !== 'undefined' && token !== 'null'
      setIsLoggedIn(valid)

      if (valid) {
        // Retrieve email from any standard localStorage key
        let email = localStorage.getItem('email') || localStorage.getItem('userEmail') || ''

        if (!email) {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser)
              email = parsed.email || ''
            } catch {
              // fallback if stored as a plain string
              if (storedUser.includes('@')) email = storedUser
            }
          }
        }

        setDisplayName(email ? extractNameFromEmail(email) : 'User')
      } else {
        setDisplayName('')
      }
    }
    
    checkAuth()
    
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [pathname, isClient])

  useEffect(() => {
    if (!isClient) return
    const onOpenCart = () => {
      setShowMiniCart(true)
      setShowMobileMenu(false)
    }
    window.addEventListener('royal:openCart', onOpenCart)
    return () => window.removeEventListener('royal:openCart', onOpenCart)
  }, [isClient])

  if (!isClient) return null

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/science-quality', label: 'Science & Quality' },
    { href: '/faq', label: 'FAQ' },
    { href: '/feedback', label: 'Feedback' },
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
      <div className="container flex items-center justify-between h-16 md:h-20 px-3 md:px-8 w-full">
        <Link href="/" className="font-heading text-base sm:text-lg md:text-2xl lg:text-3xl text-yellow-300 font-bold tracking-wide hover:scale-105 transition-transform flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-1" aria-label="Royal Organics home">
          <Image
            src={logoImg}
            alt="Royal Organics Logo"
            width={40}
            height={40}
            className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] rounded-md object-cover"
            priority
          />
          <span className="truncate">Royal Organics</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-white hover:text-yellow-300 font-medium transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 justify-end">
          <div className="relative sm:static">
            <button
              onClick={() => { setShowMiniCart(!showMiniCart); setShowMobileMenu(false) }}
              className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 rounded-full font-semibold flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-xl transition-all text-xs sm:text-sm md:text-base max-w-[calc(100vw-7rem)] sm:max-w-none"
              aria-label={totalItems > 0 ? `Cart with ${totalItems} items` : 'Cart'}
            >
              <FaShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden />
              <span className="hidden sm:inline whitespace-nowrap">Cart</span>
              {totalItems > 0 && (
                <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center shadow-sm flex-shrink-0">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showMiniCart && (
                <>
                  <motion.div
                    key="minicart-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMiniCart(false)}
                    className="fixed inset-0 z-40 bg-black/40 sm:bg-black/30 backdrop-blur-sm sm:backdrop-blur-[1px]"
                    aria-hidden
                  />
                  <motion.div
                    key="minicart-panel"
                    initial={{ opacity: 0, y: 20, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-0 bottom-0 sm:bottom-auto sm:top-full z-50 sm:mt-2 w-full sm:w-[min(26rem,calc(100vw-1.5rem))] max-h-[85dvh] sm:max-h-[70vh] bg-white sm:rounded-xl rounded-t-2xl sm:shadow-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.2)] border-t sm:border border-gray-200 flex flex-col pb-[env(safe-area-inset-bottom)] sm:pb-0 overflow-hidden"
                  >
                    <div className="sm:hidden flex justify-center pt-2.5 pb-1.5">
                      <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>
                    <div className="p-4 sm:p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <FaShoppingCart className="w-5 h-5 text-emerald-700" aria-hidden />
                        <h3 className="text-lg font-bold text-gray-800">Your Cart</h3>
                        {totalItems > 0 && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowMiniCart(false)}
                        className="sm:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Close cart"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                      {cart.length === 0 ? (
                        <div className="p-10 sm:p-8 text-center text-gray-500">
                          <p className="flex justify-center mb-3"><FaShoppingCart className="w-14 h-14 sm:w-10 sm:h-10 text-gray-300" aria-hidden /></p>
                          <p className="text-base sm:text-sm font-medium text-gray-600">Your cart is empty!</p>
                          <p className="text-sm text-gray-400 mt-1">Add some organic goodness to get started.</p>
                        </div>
                      ) : (
                        cart.map((item) => {
                          const product = products.find(p => p.id === item.productId)
                          return (
                            <div key={item.productId} className="p-4 sm:p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 sm:active:bg-transparent">
                              <div className="flex gap-3 sm:gap-3 items-start">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-2xl sm:text-2xl flex-shrink-0">
                                  🌱
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 text-sm sm:text-sm truncate">{product?.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{formatINR(item.pricePerUnit)} per unit</p>
                                  <div className="flex items-center gap-2 mt-3">
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
                                      className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold disabled:opacity-50 transition-colors text-lg sm:text-base flex items-center justify-center"
                                      aria-label={`Decrease quantity of ${product?.name}`}
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-gray-800 w-8 sm:w-8 text-center text-base sm:text-sm">{item.quantity}</span>
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
                                      className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold disabled:opacity-50 transition-colors text-lg sm:text-base flex items-center justify-center"
                                      aria-label={`Increase quantity of ${product?.name}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                  <p className="font-bold text-gray-800 text-sm sm:text-sm whitespace-nowrap">{formatINR(item.quantity * item.pricePerUnit)}</p>
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
                                    className="text-red-500 hover:text-red-700 active:text-red-800 text-xs sm:text-xs mt-0 disabled:opacity-50 transition-colors min-h-[44px] px-3 py-2 -mr-3 rounded-md sm:min-h-0 sm:px-0 sm:py-0 sm:rounded-none"
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
                      <div className="p-4 sm:p-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-700 font-semibold text-base sm:text-base">Total:</span>
                          <span className="text-xl sm:text-xl font-bold text-emerald-800">{formatINR(totalPrice)}</span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setShowMiniCart(false)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3.5 sm:py-3 rounded-xl sm:rounded-lg font-semibold text-center block transition-colors text-base sm:text-base shadow-lg shadow-emerald-600/25 min-h-[52px] flex items-center justify-center"
                        >
                          View Cart &amp; Checkout
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2 md:gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/my-orders" className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base whitespace-nowrap">
                  My Orders
                </Link>
                <div className="flex items-center gap-2 bg-emerald-700/60 border border-emerald-600/40 text-yellow-300 px-3 md:px-4 py-2 rounded-lg font-semibold text-sm md:text-base max-w-[160px] lg:max-w-[200px]">
                  <FaUserCircle className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">{displayName}</span>
                </div>
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

      {/* Mobile Drawer */}
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
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-800/80 text-yellow-300 rounded-lg font-semibold text-center">
                      <FaUserCircle className="w-5 h-5" />
                      <span className="truncate">{displayName}</span>
                    </div>
                    <Link
                      href="/my-orders"
                      onClick={() => setShowMobileMenu(false)}
                      className="block px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium text-center transition-colors"
                    >
                      My Orders
                    </Link>
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