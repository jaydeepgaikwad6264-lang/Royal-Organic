'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useCart } from '../../lib/cartContext'
import { api, OrderItem, Order } from '../../lib/api'
import { formatINR } from '../../lib/format'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'
import { products } from '../../data/products'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay?: any
  }
}

type RazorpayResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

function PaymentPageContent() {
  const { cart, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayProducts, setDisplayProducts] = useState<OrderItem[]>(cart)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const isClient = useClientOnly()

  const initOrderAndRazorpay = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      let finalOrderId: string | null = searchParams.get('orderId')
      const addressId = searchParams.get('address') || undefined

      if (finalOrderId) {
        const tempProducts = localStorage.getItem('temp_order_products')
        if (tempProducts) {
          setDisplayProducts(JSON.parse(tempProducts))
        }
        try {
          const existingOrder = await api.getOrderById(finalOrderId)
          setCurrentOrder(existingOrder)
          if (existingOrder.products && existingOrder.products.length > 0) {
            setDisplayProducts(existingOrder.products)
          }
        } catch {
          // ignore - proceed with retry flow
        }
      } else if (cart.length > 0) {
        const order = await api.createOrder(cart, addressId)
        finalOrderId = order._id
        setCurrentOrder(order)
      } else {
        setLoading(false)
        return
      }

      if (!finalOrderId) {
        setError('Order not found')
        setLoading(false)
        return
      }
      setOrderId(finalOrderId)

      if (typeof window !== 'undefined' && window.Razorpay) {
        setRazorpayLoaded(true)
      }

      setLoading(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to initialize payment')
      setLoading(false)
    }
  }, [cart, searchParams])

  useEffect(() => {
    if (isClient) {
      initOrderAndRazorpay()
    }
  }, [isClient, initOrderAndRazorpay])

  async function handlePayment() {
    if (processing) return
    if (!orderId) {
      setError('Order not ready. Please wait or refresh the page.')
      return
    }

    try {
      setProcessing(true)
      setError('')

      let activeOrderId = orderId

      if (!currentOrder) {
        try {
          const fetched = await api.getOrderById(activeOrderId)
          setCurrentOrder(fetched)
        } catch {
          // if order no longer valid and we have cart, recreate
          if (cart.length > 0) {
            const addressId = searchParams.get('address') || undefined
            const newOrder = await api.createOrder(cart, addressId)
            activeOrderId = newOrder._id
            setCurrentOrder(newOrder)
            setOrderId(newOrder._id)
            setDisplayProducts(newOrder.products || cart)
          }
        }
      }

      let rpOrder: any
      try {
        rpOrder = await api.createRazorpayOrder(activeOrderId)
      } catch (createErr: any) {
        const msg = createErr?.message || 'Failed to start payment session'
        console.error('[Payment] createRazorpayOrder failed:', msg)
        if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('login')) {
          router.push('/login?redirect=' + encodeURIComponent('/payment?orderId=' + activeOrderId))
          return
        }
        setError(msg + (msg.endsWith('.') ? '' : '.'))
        setProcessing(false)
        return
      }

      // Order is already paid — don't show checkout, jump directly to thank-you
      if (rpOrder?.alreadyPaid) {
        router.push(`/thank-you?orderId=${activeOrderId}`)
        return
      }

      if (!window.Razorpay) {
        setError('Razorpay SDK not loaded. Please try again.')
        setProcessing(false)
        return
      }

      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amountInPaise,
        currency: rpOrder.currency,
        name: 'Royal Organics',
        description: 'Moringa Wellness Products',
        order_id: rpOrder.razorpayOrderId,
        handler: async function (response: RazorpayResponse) {
          try {
            const result = await api.verifyRazorpayPayment({
              orderId: activeOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            if (result.success) {
              await clearCart()
              localStorage.removeItem('temp_order_products')
            }
            router.push(`/thank-you?orderId=${activeOrderId}&paymentId=${response.razorpay_payment_id}`)
          } catch (err: any) {
            console.error('[Payment] Razorpay verification error, redirecting to thank-you anyway:', err?.message || err)
            router.push(`/thank-you?orderId=${activeOrderId}&paymentId=${response.razorpay_payment_id}&verifyFailed=1`)
          }
        },
        prefill: {
          name: rpOrder.user?.name || '',
          email: rpOrder.user?.email || '',
          contact: rpOrder.address?.contact || '',
        },
        notes: {
          address: rpOrder.address ? `${rpOrder.address.line1}, ${rpOrder.address.city}, ${rpOrder.address.state} - ${rpOrder.address.postal_code}` : '',
        },
        theme: {
          color: '#047857',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (res: any) {
        const failReason = res?.error?.description || 'Payment failed'
        const failedPaymentId = res?.error?.metadata?.payment_id || ''
        console.error('[Payment] Razorpay payment.failed — redirecting to thank-you:', failReason)
        router.push(
          `/thank-you?orderId=${activeOrderId}` +
            (failedPaymentId ? `&paymentId=${failedPaymentId}` : '') +
            `&verifyFailed=1&payFailed=1` +
            `&msg=${encodeURIComponent(failReason)}`,
        )
      })
      rzp.open()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to start payment')
      setProcessing(false)
    }
  }

  if (!isClient) return null

  const displayTotal = displayProducts.reduce((acc, item) => acc + item.quantity * item.pricePerUnit, 0)
  const savings = displayProducts.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId)
    const original = product ? product.originalPrice : item.pricePerUnit * 1.3
    return acc + ((original - item.pricePerUnit) * item.quantity)
  }, 0)

  if (displayProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-8 sm:py-12 px-4 flex items-center justify-center">
        <div className="container max-w-lg mx-auto text-center bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🛒</div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Your cart is empty!</h1>
          <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8">Add products to cart before checkout.</p>
          <Link 
            href="/shop" 
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-emerald-200 transition-all inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setError('Failed to load payment gateway. Please refresh.')}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-4 sm:py-12 px-3.5 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            
            {/* Payment Section */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Complete Your Order</h1>

                {loading ? (
                  <div className="text-center py-12 sm:py-16 text-gray-500 text-base sm:text-xl">
                    Initializing payment...
                  </div>
                ) : error && error === 'Unauthorized' ? (
                  <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-800 px-4 sm:px-6 py-8 sm:py-10 rounded-2xl text-center">
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Unauthorized</h2>
                    <p className="mb-6 sm:mb-8 text-sm sm:text-lg">Please log in to complete your payment.</p>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl shadow-xl hover:shadow-2xl transition-all"
                    >
                      🔐 Login to Continue
                    </Link>
                  </div>
                ) : error && !processing ? (
                  <div className="mb-4 sm:mb-6">
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 text-sm sm:text-base break-words">
                      {error}
                    </div>
                    <button
                      onClick={handlePayment}
                      disabled={processing || !razorpayLoaded}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-gray-900 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-xl shadow-lg hover:shadow-xl transition-all min-h-[48px]"
                    >
                      {processing ? 'Processing...' : '🔄 Retry Payment'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl flex-shrink-0">
                        🔐
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <h2 className="text-base sm:text-xl font-bold text-gray-800 leading-snug">Secure Checkout via Razorpay</h2>
                        <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                          Pay using UPI, Cards, Net Banking, Wallets — 100% secure & encrypted
                        </p>
                      </div>
                      <div className="w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60 flex sm:block justify-between items-baseline text-left sm:text-right">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-xl sm:text-3xl font-bold text-emerald-700">{formatINR(displayTotal)}</p>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={processing || !razorpayLoaded}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-gray-900 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 min-h-[48px]"
                    >
                      {processing ? (
                        <>⏳ Processing Payment...</>
                      ) : !razorpayLoaded ? (
                        <>⏳ Loading Payment Gateway...</>
                      ) : (
                        <>✅ Pay {formatINR(displayTotal)} Now</>
                      )}
                    </button>

                    {error && processing === false && (
                      <div className="bg-red-100 border border-red-300 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-xs sm:text-base break-words">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 text-[11px] sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1">🔒 SSL Secured</span>
                      <span className="inline text-gray-300">|</span>
                      <span className="flex items-center gap-1">🏛️ RBI Regulated</span>
                      <span className="inline text-gray-300">|</span>
                      <span className="flex items-center gap-1">⚡ Instant</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-8 lg:sticky lg:top-28">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-6">Order Summary</h3>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 lg:max-h-none overflow-y-auto sm:overflow-visible pr-1 sm:pr-0">
                  {displayProducts.map((item, index) => {
                    const product = products.find(p => p.id === item.productId)
                    return (
                      <div key={index} className="flex items-center gap-2.5 sm:gap-4 pb-2.5 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
                          🌱
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-xs sm:text-base truncate">{product?.name || 'Product'}</p>
                          <p className="text-[11px] sm:text-sm text-gray-500">{item.quantity} {item.quantity === 1 ? 'unit' : 'units'}</p>
                        </div>
                        <p className="font-bold text-gray-800 text-xs sm:text-base flex-shrink-0">{formatINR(item.quantity * item.pricePerUnit)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 sm:space-y-3 mb-3.5 sm:mb-8 pt-2 sm:pt-0">
                  <div className="flex justify-between text-gray-700 text-xs sm:text-base">
                    <span>Subtotal ({displayProducts.length} items)</span>
                    <span className="font-semibold">{formatINR(displayTotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 text-xs sm:text-base">
                    <span>Your Savings</span>
                    <span className="font-semibold">- {formatINR(Math.round(savings))}</span>
                  </div>
                  <div className="flex justify-between text-green-600 text-xs sm:text-base">
                    <span>Delivery</span>
                    <span className="font-semibold flex items-center gap-1">🎁 FREE</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-3 sm:pt-4 mb-3 sm:mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-xl font-bold text-gray-800">Total</span>
                    <span className="text-xl sm:text-3xl font-bold text-emerald-700">{formatINR(displayTotal)}</span>
                  </div>
                  <p className="text-green-600 text-[11px] sm:text-xs mt-1 sm:mt-2 flex items-center gap-1">
                    ✅ Free delivery applied on all orders
                  </p>
                </div>

                <Link href="/cart" className="w-full text-center text-gray-600 hover:text-emerald-600 text-sm sm:text-base font-medium transition-colors block py-1.5 sm:py-2">
                  ← Back to Cart
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  )
}