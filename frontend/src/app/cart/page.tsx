'use client'
import { useState } from 'react'
import { useCart } from '../../lib/cartContext'
import { products } from '../../data/products'
import { formatINR } from '../../lib/format'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice, loading: cartLoading } = useCart()
  const [processing, setProcessing] = useState<string | null>(null)
  const isClient = useClientOnly()

  if (!isClient) return null

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12 sm:py-16 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce">🛒</div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Your Shopping Cart is Empty</h1>
          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-10 px-2">Looks like you haven&apos;t added anything to your cart yet!</p>
          <Link href="/shop" className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-xl sm:shadow-2xl hover:shadow-emerald-200 transition-all">
            🌿 Browse Products
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  const savings = cart.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId)
    const original = product ? product.originalPrice : item.pricePerUnit * 1.3
    return acc + ((original - item.pricePerUnit) * item.quantity)
  }, 0)
  const finalTotal = totalPrice

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3 px-1">
          🛒 Your Cart <span className="text-emerald-600 text-lg sm:text-3xl">({totalItems} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            {cart.map((item) => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null
              return (
                <div key={item.productId} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-6 hover:shadow-xl transition-shadow">
                  <div className="w-full sm:w-24 h-24 sm:h-32 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <div className="text-4xl sm:text-5xl">🌱</div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 sm:mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-800 truncate">{product.name}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
                      </div>
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
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 sm:p-2 disabled:opacity-50 flex-shrink-0"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-2 mb-4">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400">★</span>
                      ))}
                      <span className="text-gray-400 text-sm">(128 reviews)</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-3">
                      <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-full p-1 w-fit">
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
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-8 sm:w-12 text-center font-bold text-gray-800 text-base sm:text-lg">{item.quantity}</span>
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
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl font-bold text-emerald-700">{formatINR(item.quantity * item.pricePerUnit)}</span>
                        <span className="text-gray-400 line-through text-xs sm:text-sm">
                          {formatINR(item.quantity * (products.find(p => p.id === item.productId)?.originalPrice || Math.round(item.pricePerUnit * 1.3)))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 sticky top-20 lg:top-28">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Order Summary</h3>
              
              <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                  <span>Price ({totalItems} items)</span>
                  <span className="font-semibold">{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm sm:text-base">
                  <span>Your Savings</span>
                  <span className="font-semibold">- {formatINR(Math.round(savings))}</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm sm:text-base">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    🎁 FREE
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-800">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-700">{formatINR(finalTotal)}</span>
                </div>
                <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1">
                  ✅ Free delivery applied on all orders!
                </p>
              </div>
              
              <Link href="/address" className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl text-center shadow-lg hover:shadow-xl transition-all block mb-3 sm:mb-4">
                Proceed to Checkout
              </Link>
              
              <button
                onClick={async () => {
                  setProcessing('clear')
                  try {
                    await clearCart()
                  } finally {
                    setProcessing(null)
                  }
                }}
                disabled={processing === 'clear'}
                className="w-full border-2 border-red-200 hover:bg-red-50 text-red-600 py-2 sm:py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
