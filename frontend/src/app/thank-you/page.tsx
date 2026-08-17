'use client'
import { Suspense, useEffect, useState } from 'react'
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

  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  const verifyFailed = searchParams.get('verifyFailed') === '1'

  useEffect(() => {
    if (!isClient) return
    if (!orderId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = () => {
      api.getOrderById(orderId!)
        .then(data => {
          if (cancelled) return
          setOrder(data)
          setError('')
        })
        .catch(err => !cancelled && setError(err.message || 'Could not load order details'))
        .finally(() => !cancelled && setLoading(false))
    }
    load()
    const interval = setInterval(() => {
      if (order && (order.status === 'paid' || order.status === 'shipped' || order.status === 'refunded')) {
        clearInterval(interval)
        return
      }
      load()
    }, 3000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isClient, orderId])

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="container max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-24 text-gray-500 text-xl">Loading order details...</div>
        ) : !orderId ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="text-7xl mb-6">🛍️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">No Order Found</h1>
            <p className="text-gray-600 mb-8">It looks like you reached this page without an order.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/shop" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                Browse Products
              </Link>
              <Link href="/my-orders" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-xl font-bold transition-all">
                View My Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 px-8 py-10 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-5 text-5xl animate-bounce">
                    ✅
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
                    Thank You!
                  </h1>
                  <p className="text-xl opacity-95 font-medium">
                    Your order has been placed successfully
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2">
                    <span>{order?.razorpayPaymentId || paymentId ? '💳' : '📦'}</span>
                    <span className="font-semibold">Payment {order?.status === 'paid' ? 'Confirmed' : 'Received'}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Order ID</p>
                    <p className="font-mono text-lg font-bold text-gray-800 break-all">#{order?._id || orderId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Order Status</p>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm inline-block mt-1 ${getStatusColor(order?.status || 'pending')}`}>
                      {(order?.status || 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  {paymentId && (
                    <div className="bg-gray-50 rounded-2xl p-5 md:col-span-2">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Payment ID (Razorpay)</p>
                      <p className="font-mono text-sm font-bold text-gray-800 break-all">{paymentId}</p>
                    </div>
                  )}
                  {order?.createdAt && (
                    <div className="bg-gray-50 rounded-2xl p-5 md:col-span-2">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Order Date</p>
                      <p className="font-bold text-gray-800 text-lg">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'full',
                          timeStyle: 'medium',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📦 Your Items ({itemsCount})
                  </h2>
                  <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-4 space-y-3">
                    {orderedItems.map((item, i) => {
                      const product = products.find(p => p.id === item.productId)
                      return (
                        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                            🌱
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate">{product?.name || 'Product'}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {item.quantity} × {formatINR(item.pricePerUnit)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold text-emerald-700">
                              {formatINR(item.quantity * item.pricePerUnit)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                  <div className="flex justify-between items-center text-lg mb-2">
                    <span className="text-gray-700 font-semibold">Items ({itemsCount})</span>
                    <span className="font-bold text-gray-800">{formatINR(order?.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg mb-2">
                    <span className="text-gray-700 font-semibold">Delivery</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">Total Paid</span>
                    <span className="text-3xl font-extrabold text-emerald-700">{formatINR(order?.totalAmount || 0)}</span>
                  </div>
                </div>

                {addressObj && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      🏠 Delivery Address
                    </h2>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <p className="font-bold text-lg text-gray-800 mb-1">{addressObj.fullName}</p>
                      <p className="text-gray-600 mb-1">📞 {addressObj.phone}</p>
                      <p className="text-gray-700 leading-relaxed">
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
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                  </div>
                )}

                {verifyFailed && (
                  <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 px-5 py-4 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Payment received, verifying status…</h3>
                        <p className="text-sm opacity-90">
                          Your payment (ID: <span className="font-mono font-semibold">{paymentId || '-'}</span>) has been debited.
                          The page is auto-refreshing every few seconds until the payment confirmation syncs with our backend.
                          If after a few minutes the order still shows as Pending, please contact support or go to My Orders.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order?.status === 'pending' && !verifyFailed && (
                  <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 px-5 py-4 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl animate-pulse">🔄</span>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Processing your payment…</h3>
                        <p className="text-sm opacity-90">
                          This page updates automatically every 3 seconds.
                          Once payment confirmation is received, your order status will change to <b>PAID</b>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">💬</div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">What happens next?</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• A confirmation email/SMS will be sent to your registered details shortly.</li>
                        <li>• Our team will process your order and dispatch within 1-2 business days.</li>
                        <li>• You can track your order anytime from <Link href="/my-orders" className="text-emerald-700 font-bold underline">My Orders</Link> page.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <Link href="/my-orders" className="sm:col-span-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold text-center shadow-lg hover:shadow-xl transition-all">
                    📋 My Orders
                  </Link>
                  <Link href="/shop" className="sm:col-span-1 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-4 rounded-xl font-bold text-center transition-all">
                    🌿 Continue Shopping
                  </Link>
                  <Link href="/" className="sm:col-span-1 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-4 rounded-xl font-bold text-center transition-all">
                    🏠 Home
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 pb-8">
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
