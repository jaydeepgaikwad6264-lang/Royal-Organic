'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatINR } from '../lib/format'
import { useCart } from '../lib/cartContext'
import { useClientOnly } from '../lib/useClientOnly'
import { products } from '../data/products'

export default function BulkPurchaseBox({
  productSlug,
  unitPrice,
}: {
  productSlug: string
  unitPrice?: number
}) {
  const [qty, setQty] = useState<number>(1)
  const [processing, setProcessing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { addToCart } = useCart()
  const product = products.find(p => p.slug === productSlug)
  const variants = product?.variants || []
  const defaultVariantId =
    product?.defaultVariantId || (variants.length > 0 ? variants[0].id : undefined)
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    defaultVariantId,
  )
  const selectedVariant = variants.find(v => v.id === selectedVariantId)
  const activePrice = selectedVariant?.price ?? product?.price ?? unitPrice ?? 0
  const isClient = useClientOnly()
  const router = useRouter()

  useEffect(() => {
    if (isClient) {
      setIsLoggedIn(!!localStorage.getItem('token'))
    }
  }, [isClient])

  function changeQty(delta: number) {
    const next = Math.max(0, qty + delta)
    setQty(next)
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10)
    if (isNaN(val)) return
    setQty(val)
  }

  const total = activePrice * qty
  const isValid = qty >= 1 && product && product.inStock && !!selectedVariant

  async function handleAddToCart() {
    if (!isValid) return

    if (!isLoggedIn) {
      alert('Please log in to add items to your cart!')
      router.push('/login')
      return
    }

    setProcessing(true)
    try {
      await addToCart(product!.id, qty, selectedVariantId)
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

  return (
    <div className="mt-6 rounded-xl border border-royal-sand p-4 sm:p-5 bg-white shadow-sm">
      {variants.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <div className="font-heading text-lg sm:text-xl">Select Package Size</div>
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-3">
            {variants.map(v => {
              const isSelected = selectedVariantId === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center px-3 sm:px-4 py-2.5 rounded-xl border-2 text-center transition-all min-w-[74px] sm:min-w-[84px] ${
                    isSelected
                      ? 'border-royal-green bg-emerald-50 ring-2 ring-royal-green/30'
                      : 'border-royal-sand bg-white hover:border-royal-green/60'
                  }`}
                >
                  <span className={`font-semibold text-sm sm:text-base ${isSelected ? 'text-royal-green' : 'text-gray-800'}`}>{v.label}</span>
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold mt-0.5">{formatINR(v.price)}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs sm:text-sm text-royal-muted">Price updates automatically as you change the package size.</p>
        </div>
      )}
      <div className="font-heading text-lg sm:text-xl">Quantity</div>
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Quantity selector">
        <button className="btn-outline px-3 sm:px-4 py-2.5 min-w-[48px] min-h-[48px] text-sm sm:text-base font-semibold rounded-lg" onClick={() => changeQty(-1)} aria-label="Decrease 1">-1</button>
        <button className="btn-outline px-3 sm:px-4 py-2.5 min-w-[48px] min-h-[48px] text-sm sm:text-base font-semibold rounded-lg" onClick={() => changeQty(+1)} aria-label="Increase 1">+1</button>
        <button className="btn-outline px-3 sm:px-4 py-2.5 min-w-[48px] min-h-[48px] text-sm sm:text-base font-semibold rounded-lg" onClick={() => changeQty(+5)} aria-label="Increase 5">+5</button>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={onInput}
          className="w-20 sm:w-24 border border-royal-sand rounded-lg px-3 sm:px-4 py-2.5 text-center text-base font-semibold min-h-[48px]"
          aria-describedby="bulk-help"
        />
      </div>
      <p id="bulk-help" className="mt-2 text-xs sm:text-sm text-royal-muted">Adjust quantity as needed.</p>
      <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-lg bg-emerald-50/70 border border-emerald-100">
        <div className="text-base sm:text-lg flex flex-wrap items-baseline gap-2">
          <span className="text-royal-green/80 font-medium">Total:</span>
          <span className="font-heading text-xl sm:text-2xl text-emerald-800">{formatINR(total)}</span>
        </div>
        <div className="text-royal-muted text-xs sm:text-sm mt-1">
          {formatINR(activePrice)} per unit{selectedVariant ? ` • ${selectedVariant.label}` : ''}
        </div>
      </div>
      {product && !product.inStock ? (
        <button
          className="mt-4 sm:mt-5 px-4 sm:px-6 py-3 bg-gray-300 text-gray-500 cursor-not-allowed rounded-xl w-full text-sm sm:text-base min-h-[52px] font-semibold"
          disabled
        >
          Out of Stock
        </button>
      ) : (
        <button
          className={`btn-primary mt-4 sm:mt-5 px-4 sm:px-6 py-3 w-full ${!isValid || processing ? 'opacity-60 cursor-not-allowed' : ''} text-sm sm:text-base min-h-[52px] font-semibold rounded-xl shadow-lg`}
          onClick={handleAddToCart}
          aria-disabled={!isValid || processing}
          disabled={!isValid || processing}
        >
          {processing ? 'Adding to cart…' : 'Add to Cart'}
        </button>
      )}
    </div>
  )
}
