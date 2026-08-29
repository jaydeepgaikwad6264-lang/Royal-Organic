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
  const { addToCart, cart, updateQuantity, error: cartError } = useCart()
  const existingItem = cart.find(item => item.productId === product.id)
  const [processing, setProcessing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isClient = useClientOnly()
  const router = useRouter()

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  )

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
      whileTap={product.inStock ? { scale: 0.98 } : {}}
      className={`rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md sm:shadow-lg transition-all relative flex flex-col justify-between ${
        product.inStock ? 'hover:shadow-xl' : 'opacity-75'
      }`}
    >
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority={false}
          />
          
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 p-2">
              <span className="bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md uppercase tracking-wider text-center">
                Out of Stock
              </span>
            </div>
          )}

          {product.category === 'powder' && (
            <span className="absolute top-2.5 left-2.5 bg-green-600 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm">
              100% Pure
            </span>
          )}
          {product.category === 'capsules' && (
            <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm">
              Easy to Use
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3.5 sm:p-5">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex text-yellow-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">(128)</span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
            {product.description}
          </p>

          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap mb-2">
            <span className="text-lg sm:text-xl font-bold text-emerald-700">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-gray-400 line-through text-xs">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-gray-500">
            <span className="text-gray-400">per unit</span> •{' '}
            <span className="text-emerald-600 font-medium">Free delivery</span> over {formatINR(499)}
          </p>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 pt-0">
        {existingItem && product.inStock ? (
          <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-xl">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleUpdateQuantity(product.id, existingItem.quantity - 1)
                }}
                disabled={processing}
                aria-label="Decrease quantity"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 text-sm"
              >
                {existingItem.quantity === 1 ? '🗑' : '-'}
              </button>

              <span className="w-7 sm:w-8 text-center font-semibold text-gray-900 text-xs sm:text-sm">
                {existingItem.quantity}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleUpdateQuantity(product.id, existingItem.quantity + 1)
                }}
                disabled={processing}
                aria-label="Increase quantity"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center justify-center transition-colors disabled:opacity-50 text-sm"
              >
                +
              </button>
            </div>

            <div className="text-right pr-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total</p>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">
                {formatINR(existingItem.quantity * existingItem.pricePerUnit)}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={processing || !product.inStock}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] ${
              product.inStock
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-gray-950 disabled:opacity-50'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.inStock ? (processing ? 'Adding...' : '🛒 Add to Cart') : 'Out of Stock'}
          </button>
        )}

        {cartError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] sm:text-xs">
            {cartError}
          </div>
        )}
      </div>
    </motion.article>
  )
}