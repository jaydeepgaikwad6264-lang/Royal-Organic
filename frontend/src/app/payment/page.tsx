'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useCart } from '../../lib/cartContext'
import { api, OrderItem } from '../../lib/api'
import { formatUSD } from '../../lib/format'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'
import { products } from '../../data/products'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/my-orders`,
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
    } else {
      onSuccess()
    }
    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-gray-900 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}

function PaymentPageContent() {
  const { cart, totalPrice, clearCart } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayProducts, setDisplayProducts] = useState<OrderItem[]>(cart)
  const searchParams = useSearchParams()
  const router = useRouter()
  const isClient = useClientOnly()

  const initPayment = useCallback(async () => {
    try {
      const order = await api.createOrder(cart)
      const payment = await api.createPaymentIntent(order._id)
      setOrderId(order._id)
      setClientSecret(payment.clientSecret)
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }, [cart])

  useEffect(() => {
    if (isClient) {
      const orderIdFromQuery = searchParams.get('orderId')
      if (orderIdFromQuery) {
        // If we have an orderId, use the temp products from localStorage
        const tempProducts = localStorage.getItem('temp_order_products')
        if (tempProducts) {
          const parsedProducts = JSON.parse(tempProducts) as OrderItem[]
          setDisplayProducts(parsedProducts)
          setOrderId(orderIdFromQuery)
          // Create payment intent for the existing order
          api.createPaymentIntent(orderIdFromQuery)
            .then((data) => {
              setClientSecret(data.clientSecret)
              setLoading(false)
            })
            .catch((err) => {
              setError(err.message || 'Failed to initialize payment')
              setLoading(false)
            })
          return
        }
      }

      // Regular flow with cart
      if (cart.length > 0) {
        initPayment()
      } else {
        setLoading(false)
      }
    }
  }, [isClient, searchParams, cart, initPayment])

  async function handlePaymentSuccess() {
    try {
      if (orderId) {
        await api.getOrderById(orderId)
        clearCart()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('temp_order_products')
        }
        router.push('/my-orders')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment')
    }
  }

  if (!isClient) return null

  if (displayProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your cart is empty!</h1>
          <p className="text-gray-600 text-lg mb-8">Add products to cart before checkout.</p>
          <Link href="/shop" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-emerald-200 transition-all inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const displayTotal = displayProducts.reduce((acc, item) => acc + item.quantity * item.pricePerUnit, 0)
  const savings = displayProducts.reduce((acc, item) => acc + item.pricePerUnit * 0.3 * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Order</h1>

              {loading ? (
                <div className="text-center py-16 text-gray-500 text-xl">Initializing payment...</div>
              ) : error ? (
                <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6">
                  {error}
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
                </Elements>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sticky top-28">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {displayProducts.map((item, index) => {
                  const product = products.find(p => p.id === item.productId)
                  return (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-2xl">
                        🌱
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{product?.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} units</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatUSD(item.quantity * item.pricePerUnit)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({displayProducts.length} items)</span>
                  <span className="font-semibold">{formatUSD(displayTotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Your Savings</span>
                  <span className="font-semibold">- {formatUSD(Math.round(savings))}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-3xl font-bold text-emerald-700">{formatUSD(displayTotal)}</span>
                </div>
              </div>

              <Link href="/cart" className="w-full text-center text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  )
}
