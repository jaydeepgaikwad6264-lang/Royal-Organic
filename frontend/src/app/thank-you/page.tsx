import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Order Confirmed — Thank You!',
  description: 'Thank you for your purchase from Royal Organics. Your order confirmation, payment details, delivery address and shipment tracking are available here.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/thank-you' },
  openGraph: {
    title: 'Thank You | Royal Organics',
    description: 'Your Royal Organics order has been placed successfully.',
    url: 'https://royalorganics.in/thank-you',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary' },
}

'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useClientOnly } from '../../lib/useClientOnly'
import { api, Order, Address } from '../../lib/api'
import { products } from '../../data/products'
import { formatINR } from '../../lib/format'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const isClient = useClientOnly()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const orderRef = useRef<Order | null>(null)

  useEffect(() => {
    orderRef.current = order
  }, [order])

  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  const verifyFailed = searchParams.get('verifyFailed') === '1'
  const payFailed = searchParams.get('payFailed') === '1'
  const failMessage = searchParams.get('msg') || ''

  useEffect(() => {
    if (!isClient) return
    if (!orderId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const data = await api.getOrderById(orderId!)
        if (cancelled) return
        setOrder(data)
        orderRef.current = data
        setError('')

        // Proactively try to verify if Razorpay says this payment was captured but
        // our DB order is still stuck in pending/failed. One attempt per cycle,
        // skip if we don't have enough IDs.
        if (
          data &&
          data.razorpayOrderId &&
          (paymentId || data.razorpayPaymentId) &&
          (data.status === 'pending' || data.status === 'failed')
        ) {
          try {
            await api.verifyRazorpayPayment({
              orderId: data._id,
              razorpayOrderId: data.razorpayOrderId,
              razorpayPaymentId: (paymentId || data.razorpayPaymentId) as string,
              razorpaySignature: '',
            })
            const refreshed = await api.getOrderById(orderId!)
            if (!cancelled) {
              setOrder(refreshed)
              orderRef.current = refreshed
            }
          } catch (_verifyErr) {
            // Verification may legitimately fail if signature doesn't match yet;
            // swallow and wait for either the next poll or the webhook.
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load order details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const interval = setInterval(() => {
      const cur = orderRef.current
      if (cur && (cur.status === 'paid' || cur.status === 'shipped' || cur.status === 'refunded')) {
        clearInterval(interval)
        return
      }
      load()
    }, 3000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isClient, orderId, paymentId])

  if (!isClient) return null

  const addressObj = order?.addressId && typeof order.addressId === 'object' ? (order.addressId as Address) : null
  const orderedItems = order?.products || []
  const itemsCount = orderedItems.reduce((acc, it) => acc + it.quantity, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 sm:py-12 px-3 sm:px-4">
      <div className="container max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-16 sm:py-24 text-gray-500 text-lg sm:text-xl">Loading order details...</div>
        ) : !orderId ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 md:p-12 text-center">
            <div className="text-6xl sm:text-7xl mb-5 sm:mb-6">🛍️</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 px-1">No Order Found</h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-1">It looks like you reached this page without an order.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/shop" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto min-h-[3.25rem] inline-flex items-center justify-center">
                Browse Products
              </Link>
              <Link href="/my-orders" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto min-h-[3.25rem] inline-flex items-center justify-center">
                View My Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 px-5 sm:px-8 py-8 sm:py-10 md:py-12 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white rounded-full translate-x-1/4 translate-y-1/4 sm:translate-x-1/3 sm:translate-y-1/3"></div>
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full shadow-2xl mb-4 sm:mb-5 text-3xl sm:text-5xl animate-bounce">
                    ✅
                  </div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-3 tracking-tight px-1">
                    Thank You!
                  </h1>
                  <p className="text-base sm:text-xl opacity-95 font-medium px-1">
                    Your order has been placed successfully
                  </p>
                  <div className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-base">
                    <span>{order?.razorpayPaymentId || paymentId ? '💳' : '📦'}</span>
                    <span className="font-semibold">Payment {order?.status === 'paid' ? 'Confirmed' : 'Received'}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Order ID</p>
                    <p className="font-mono text-base sm:text-lg font-bold text-gray-800 break-all">#{order?._id || orderId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Order Status</p>
                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm inline-block mt-1 ${getStatusColor(order?.status || 'pending')}`}>
                      {(order?.status || 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  {paymentId && (
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 md:col-span-2">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Payment ID (Razorpay)</p>
                      <p className="font-mono text-xs sm:text-sm font-bold text-gray-800 break-all">{paymentId}</p>
                    </div>
                  )}
                  {order?.createdAt && (
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 md:col-span-2">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Order Date</p>
                      <p className="font-bold text-gray-800 text-base sm:text-lg leading-snug">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    📦 Your Items ({itemsCount})
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                    {orderedItems.map((item, i) => {
                      const product = products.find(p => p.id === item.productId)
                      return (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                            🌱
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{product?.name || 'Product'}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                              {item.quantity} × {formatINR(item.pricePerUnit)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg sm:text-xl font-bold text-emerald-700 whitespace-nowrap">
                              {formatINR(item.quantity * item.pricePerUnit)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-4 sm:p-6">
                  <div className="flex justify-between items-center text-base sm:text-lg mb-2 gap-2">
                    <span className="text-gray-700 font-semibold">Items ({itemsCount})</span>
                    <span className="font-bold text-gray-800 whitespace-nowrap">{formatINR(order?.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base sm:text-lg mb-2 gap-2">
                    <span className="text-gray-700 font-semibold">Delivery</span>
                    <span className="font-bold text-green-600 whitespace-nowrap">FREE</span>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-3 sm:pt-4 mt-3 sm:mt-4 flex justify-between items-center gap-2">
                    <span className="text-lg sm:text-2xl font-bold text-gray-800">Total Paid</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-emerald-700 whitespace-nowrap">{formatINR(order?.totalAmount || 0)}</span>
                  </div>
                </div>

                {addressObj && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      🏠 Delivery Address
                    </h2>
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                      <p className="font-bold text-base sm:text-lg text-gray-800 mb-1">{addressObj.fullName}</p>
                      <p className="text-gray-600 mb-1 text-sm sm:text-base">📞 {addressObj.phone}</p>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {addressObj.addressLine1}
                        {addressObj.addressLine2 && `, ${addressObj.addressLine2}`}
                        <br />
                        {addressObj.city}, {addressObj.state} - {addressObj.postalCode}
                        <br />
                        {addressObj.country}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm">
                    ⚠️ {error}
                  </div>
                )}

                {payFailed && (
                  <div className="bg-red-50 border-2 border-red-300 text-red-900 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">❌</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1">Payment was not completed</h3>
                        {failMessage && <p className="text-xs sm:text-sm opacity-90 mb-1">{failMessage}</p>}
                        <p className="text-xs sm:text-sm opacity-90">
                          You have NOT been charged. Please go to My Orders and click &apos;Retry Payment&apos; or try again from the Shop page.
                          {paymentId && <span className="block mt-1">Reference: <span className="font-mono font-semibold break-all">{paymentId}</span></span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {verifyFailed && !payFailed && (
                  <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">⏳</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1">Payment received, verifying status…</h3>
                        <p className="text-xs sm:text-sm opacity-90">
                          Your payment (ID: <span className="font-mono font-semibold break-all">{paymentId || '-'}</span>) has been debited.
                          The page auto-refreshes every few seconds until the payment confirmation syncs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order?.status === 'pending' && !verifyFailed && (
                  <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-xl sm:text-2xl animate-pulse flex-shrink-0">🔄</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg mb-1">Processing your payment…</h3>
                        <p className="text-xs sm:text-sm opacity-90">
                          This page updates automatically every 3 seconds.
                          Once payment confirmation is received, your order status will change to <b>PAID</b>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                    <div className="text-2xl sm:text-3xl flex-shrink-0">💬</div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">What happens next?</h3>
                      <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <li>• Confirmation email/SMS will be sent shortly.</li>
                        <li>• Order processed & dispatched within 1-2 business days.</li>
                        <li>• Track anytime from <Link href="/my-orders" className="text-emerald-700 font-bold underline whitespace-nowrap">My Orders</Link> page.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                  <Link href="/my-orders" className="sm:col-span-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 sm:py-4 rounded-xl font-bold text-center shadow-lg hover:shadow-xl transition-all text-sm sm:text-base min-h-[3.25rem] inline-flex items-center justify-center">
                    📋 My Orders
                  </Link>
                  <Link href="/shop" className="sm:col-span-1 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-3 sm:py-4 rounded-xl font-bold text-center transition-all text-sm sm:text-base min-h-[3.25rem] inline-flex items-center justify-center">
                    🌿 Continue Shopping
                  </Link>
                  <Link href="/" className="sm:col-span-1 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-3 sm:py-4 rounded-xl font-bold text-center transition-all text-sm sm:text-base min-h-[3.25rem] inline-flex items-center justify-center">
                    🏠 Home
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-gray-500 pb-6 sm:pb-8 px-2">
              Have questions about your order? <Link href="/contact" className="text-emerald-700 font-semibold underline">Contact us</Link> anytime.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
        <div className="container max-w-3xl mx-auto text-center py-24 text-gray-500 text-xl">Loading...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
