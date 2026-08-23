'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Product } from '../types/product'
import { formatINR } from '../lib/format'
import { useCart } from '../lib/cartContext'
import { useClientOnly } from '../lib/useClientOnly'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, updateQuantity, loading: cartLoading, error: cartError } = useCart()
  const existingItem = cart.find(item => item.productId === product.id)
  const [processing, setProcessing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isClient = useClientOnly()
  const router = useRouter()

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  useEffect(() => {
    if (isClient) {
      setIsLoggedIn(!!localStorage.getItem('token'))
    }
  }, [isClient])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.inStock) return
    
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart!')
      router.push('/login')
      return
    }

    setProcessing(true)
    try {
      await addToCart(product.id, 1, product.price)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        window.dispatchEvent(new CustomEvent('royal:openCart'))
      }
    } catch (err: any) {
      alert(`Failed to add to cart: ${err.message || 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setProcessing(true)
    try {
      await updateQuantity(productId, newQuantity)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('royal:openCart'))
      }
    } catch (err: any) {
      alert(`Failed to update quantity: ${err.message || 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <motion.article
      whileHover={product.inStock ? { y: -8, scale: 1.02 } : {}}
      whileTap={product.inStock ? { scale: 0.98 } : {}}
      className={`rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg transition-all relative ${product.inStock ? 'hover:shadow-2xl' : 'opacity-75'}`}
    >
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block">
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-transform ${product.inStock ? 'hover:scale-110' : ''}`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-xl font-bold shadow-lg">
                OUT OF STOCK
              </span>
            </div>
          )}
          {product.category === 'powder' && (
            <span className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">
              100% Pure
            </span>
          )}
          {product.category === 'capsules' && (
            <span className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">
              Easy to Use
            </span>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            {[1,2,3,4,5].map(star => (
              <span key={star} className="text-yellow-400 text-base sm:text-lg">★</span>
            ))}
            <span className="text-xs sm:text-sm text-gray-500">(128)</span>
          </div>
          <div className="font-heading text-lg sm:text-xl text-gray-800 mb-1 sm:mb-2">{product.name}</div>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
          
          <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-4 flex-wrap">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{formatINR(product.price)}</div>
            <div className="text-gray-400 line-through text-xs sm:text-sm">{formatINR(product.originalPrice)}</div>
            <span className="text-green-600 text-xs sm:text-sm font-bold">{discountPercent}% OFF</span>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
            <span className="text-gray-400">per unit</span> • <span className="text-emerald-600 font-semibold">Free delivery</span> on orders over {formatINR(499)}
          </p>
        </div>
      </Link>
      
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        {existingItem && product.inStock ? (
          <div className="flex items-center justify-between gap-2 sm:gap-3 flex-col sm:flex-row">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full w-full sm:w-auto justify-center">
              <button
                onClick={(e) => { 
                  e.preventDefault()
                  if (existingItem.quantity > 1) {
                    handleUpdateQuantity(product.id, existingItem.quantity - 1)
                  }
                }}
                disabled={processing}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                -
              </button>
              <span className="w-10 sm:w-12 text-center font-bold text-gray-800 text-sm sm:text-base">{existingItem.quantity}</span>
              <button
                onClick={(e) => { 
                  e.preventDefault()
                  handleUpdateQuantity(product.id, existingItem.quantity + 1)
                }}
                disabled={processing}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
              <p className="font-bold text-gray-800 text-sm sm:text-base">{formatINR(existingItem.quantity * existingItem.pricePerUnit)}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={processing || !product.inStock}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all ${
              product.inStock
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 hover:shadow-xl disabled:opacity-50'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? (processing ? 'Adding...' : '🛒 Add to Cart (1 unit)') : 'Out of Stock'}
          </button>
        )}
        {cartError && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {cartError}
          </div>
        )}
      </div>
    </motion.article>
  )
}
