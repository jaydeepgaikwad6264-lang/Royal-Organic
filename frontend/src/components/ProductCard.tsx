'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Product } from '../types/product'
import { formatUSD } from '../lib/format'
import { useCart } from '../lib/cartContext'
import { useClientOnly } from '../lib/useClientOnly'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, updateQuantity, loading: cartLoading, error: cartError } = useCart()
  const existingItem = cart.find(item => item.productId === product.id)
  const [processing, setProcessing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isClient = useClientOnly()
  const router = useRouter()

  useEffect(() => {
    if (isClient) {
      setIsLoggedIn(!!localStorage.getItem('token'))
    }
  }, [isClient])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart!')
      router.push('/login')
      return
    }

    setProcessing(true)
    try {
      await addToCart(product.id, 1, product.price)
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
    } catch (err: any) {
      alert(`Failed to update quantity: ${err.message || 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all"
    >
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {product.category === 'powder' && (
            <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              100% Pure
            </span>
          )}
          {product.category === 'capsules' && (
            <span className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Easy to Use
            </span>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map(star => (
              <span key={star} className="text-yellow-400 text-lg">★</span>
            ))}
            <span className="text-sm text-gray-500">(128)</span>
          </div>
          <div className="font-heading text-xl text-gray-800 mb-2">{product.name}</div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          
          <div className="flex items-baseline gap-3 mb-4">
            <div className="text-3xl font-bold text-emerald-700">{formatUSD(product.price)}</div>
            <div className="text-gray-400 line-through text-sm">{formatUSD(Math.round(product.price * 1.3))}</div>
            <span className="text-green-600 text-sm font-bold">23% OFF</span>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            <span className="text-gray-400">per unit</span> • <span className="text-emerald-600 font-semibold">Free delivery</span> on orders over $50
          </p>
        </div>
      </Link>
      
      <div className="px-6 pb-6">
        {existingItem ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full">
              <button
                onClick={(e) => { 
                  e.preventDefault()
                  if (existingItem.quantity > 1) {
                    handleUpdateQuantity(product.id, existingItem.quantity - 1)
                  }
                }}
                disabled={processing}
                className="w-10 h-10 rounded-full bg-white shadow text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-gray-800">{existingItem.quantity}</span>
              <button
                onClick={(e) => { 
                  e.preventDefault()
                  handleUpdateQuantity(product.id, existingItem.quantity + 1)
                }}
                disabled={processing}
                className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-gray-800">{formatUSD(existingItem.quantity * existingItem.pricePerUnit)}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={processing}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-gray-900 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {processing ? 'Adding...' : '🛒 Add to Cart (1 unit)'}
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
