'use client'

import { useState } from 'react'
import { useCart } from '../../lib/cartContext'
import { products } from '../../data/products'
import { formatINR } from '../../lib/format'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice, loading: cartLoading } = useCart()
  const [processing, setProcessing] = useState<string | null>(null)
  const isClient = useClientOnly()

  if (!isClient) return null

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10 sm:py-16 px-4 flex items-center justify-center">
        <div className="container max-w-lg mx-auto text-center bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="text-5xl sm:text-7xl animate-bounce flex">
              <FaShoppingCart className="text-emerald-600 drop-shadow-md" aria-hidden />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            Looks like you haven&apos;t added anything to your cart yet!
          </p>
          <div className="flex justify-center">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-emerald-200 transition-all min-h-[48px]"
            >
              <span>🌿 Browse Products</span>
              <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const savings = cart.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId)
    const original = product ? product.originalPrice : item.pricePerUnit * 1.3
    return acc + (original - item.pricePerUnit) * item.quantity
  }, 0)
  const finalTotal = totalPrice

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-4 sm:py-10 px-3.5 sm:px-6">
      <div className="container max-w-6xl mx-auto w-full">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <FaShoppingCart className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-600 flex-shrink-0" aria-hidden />
          <span>Your Cart</span>
          <span className="text-emerald-600 text-base sm:text-2xl font-semibold">({totalItems} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
          
          {/* Cart Item Cards */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null
              const originalPrice = product.originalPrice || Math.round(item.pricePerUnit * 1.3)

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl shadow-md sm:shadow-lg border border-gray-100 p-3.5 sm:p-5 flex gap-3 sm:gap-5 hover:shadow-xl transition-shadow w-full relative"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <span className="text-3xl sm:text-4xl">🌱</span>
                  </div>

                  {/* Details & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 pr-6 sm:pr-0">
                        <h3 className="font-semibold text-sm sm:text-lg text-gray-800 truncate">
                          {product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={async () => {
                            setProcessing(item.productId)
                            try {
                              await removeFromCart(item.productId)
                            } finally {
                              setProcessing(null)
                            }
                          }}
                          disabled={processing === item.productId}
                          aria-label="Remove item"
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50 absolute top-3 right-3 sm:static sm:top-auto sm:right-auto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 my-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-xs sm:text-sm">★</span>
                      ))}
                      <span className="text-gray-400 text-xs">(128 reviews)</span>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 shadow-inner">
                        <button
                          type="button"
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
                          aria-label="Decrease quantity"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white shadow-sm text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-40 flex items-center justify-center text-sm"
                        >
                          -
                        </button>

                        <span className="w-7 sm:w-10 text-center font-bold text-gray-800 text-xs sm:text-sm">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={async () => {
                            setProcessing(item.productId)
                            try {
                              await updateQuantity(item.productId, item.quantity + 1)
                            } finally {
                              setProcessing(null)
                            }
                          }}
                          disabled={processing === item.productId}
                          aria-label="Increase quantity"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-xl font-bold text-emerald-700">
                          {formatINR(item.quantity * item.pricePerUnit)}
                        </span>
                        <span className="text-gray-400 line-through text-[11px] sm:text-xs">
                          {formatINR(item.quantity * originalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-1 w-full">
            <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-28">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-6">Order Summary</h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({totalItems} items)</span>
                  <span className="font-semibold text-gray-900">{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Your Savings</span>
                  <span className="font-semibold">- {formatINR(Math.round(savings))}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold flex items-center gap-1">🎁 FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-base sm:text-xl font-bold text-gray-800">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-700 whitespace-nowrap">
                    {formatINR(finalTotal)}
                  </span>
                </div>
                <p className="text-green-600 text-[11px] sm:text-xs mt-1 sm:mt-1.5 flex items-center gap-1">
                  ✅ Free delivery applied on all orders!
                </p>
              </div>

              <Link
                href="/address"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-gray-950 font-bold py-3.5 rounded-xl text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center min-h-[48px] text-sm sm:text-base mb-2.5"
              >
                Proceed to Checkout
              </Link>

              <button
                type="button"
                onClick={async () => {
                  setProcessing('clear')
                  try {
                    await clearCart()
                  } finally {
                    setProcessing(null)
                  }
                }}
                disabled={processing === 'clear' || cartLoading}
                className="w-full border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-xs sm:text-sm min-h-[40px]"
              >
                {processing === 'clear' ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}