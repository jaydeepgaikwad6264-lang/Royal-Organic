'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatUSD } from '../lib/format'
import { useCart } from '../lib/cartContext'
import { products } from '../data/products'
import { useClientOnly } from '../lib/useClientOnly'

export default function BulkPurchaseBox({
  productSlug,
  unitPrice,
}: {
  productSlug: string
  unitPrice: number
}) {
  const [qty, setQty] = useState<number>(1)
  const [processing, setProcessing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { addToCart } = useCart()
  const product = products.find(p => p.slug === productSlug)
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

  const total = unitPrice * qty
  const isValid = qty >= 1 && product

  async function handleAddToCart() {
    if (!isValid) return

    if (!isLoggedIn) {
      alert('Please log in to add items to your cart!')
      router.push('/login')
      return
    }

    setProcessing(true)
    try {
      await addToCart(product!.id, qty, unitPrice)
    } catch (err: any) {
      alert(`Failed to add to cart: ${err.message || 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-royal-sand p-4 bg-white">
      <div className="font-heading text-xl">Quantity</div>
      <div className="mt-4 flex items-center gap-3" aria-label="Quantity selector">
        <button className="btn-outline px-3 py-2" onClick={() => changeQty(-1)} aria-label="Decrease 1">-1</button>
        <button className="btn-outline px-3 py-2" onClick={() => changeQty(+1)} aria-label="Increase 1">+1</button>
        <button className="btn-outline px-3 py-2" onClick={() => changeQty(+5)} aria-label="Increase 5">+5</button>
        <input
          type="number"
          min={0}
          value={qty}
          onChange={onInput}
          className="w-20 border border-royal-sand rounded-md px-3 py-2 text-center"
          aria-describedby="bulk-help"
        />
      </div>
      <p id="bulk-help" className="mt-2 text-sm text-royal-muted">Adjust quantity as needed.</p>
      <div className="mt-4">
        <div className="text-lg">
          Total: <span className="font-heading">{formatUSD(total)}</span> <span className="text-royal-muted">({formatUSD(unitPrice)} per unit)</span>
        </div>
      </div>
      <button
        className={`btn-primary mt-4 px-6 py-3 ${!isValid || processing ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={handleAddToCart}
        aria-disabled={!isValid || processing}
        disabled={!isValid || processing}
      >
        {processing ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  )
}
