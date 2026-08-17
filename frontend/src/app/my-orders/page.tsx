'use client'
import { useEffect, useState, useCallback } from 'react'
import { api, Order, OrderItem, Address, TrackingResponse } from '../../lib/api'
import { formatINR } from '../../lib/format'
import { products } from '../../data/products'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'
import { useRouter } from 'next/navigation'

const SHIPPING_TIMELINE = [
  { key: 'ORDER_PLACED', label: 'Order Placed', icon: '📝' },
  { key: 'SHIPMENT_CREATED', label: 'Shipment Created', icon: '📦' },
  { key: 'PICKED_UP', label: 'Picked Up', icon: '📤' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
  { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
] as const

type ShippingStatusBadge = { badge: string; label: string; icon: string; description: string }

function getShippingStatusConfig(status?: string): ShippingStatusBadge {
  const s = String(status || 'ORDER_PLACED').toUpperCase()
  switch (s) {
    case 'ORDER_PLACED':
      return { badge: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Order Placed', icon: '📝', description: 'Awaiting shipment creation' }
    case 'SHIPPING_PENDING':
      return { badge: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Processing', icon: '⏳', description: 'Shipment scheduling in progress — retry if stuck' }
    case 'SHIPMENT_CREATED':
    case 'AWB_GENERATED':
      return { badge: 'bg-sky-100 text-sky-800 border-sky-300', label: 'Shipment Created', icon: '📦', description: 'Package registered with courier partner' }
    case 'PICKED_UP':
      return { badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', label: 'Picked Up', icon: '📤', description: 'Courier has picked up your package' }
    case 'IN_TRANSIT':
      return { badge: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Transit', icon: '🚚', description: 'Your package is on its way' }
    case 'OUT_FOR_DELIVERY':
      return { badge: 'bg-violet-100 text-violet-800 border-violet-300', label: 'Out for Delivery', icon: '🛵', description: 'Agent heading to your address' }
    case 'DELIVERED':
      return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Delivered', icon: '✅', description: 'Package delivered successfully' }
    case 'CANCELLED':
      return { badge: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Cancelled', icon: '❌', description: 'Shipment was cancelled' }
    case 'UNDELIVERED':
      return { badge: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Undelivered', icon: '⚠️', description: 'Delivery attempted — please contact courier' }
    case 'RTO':
      return { badge: 'bg-red-100 text-red-800 border-red-300', label: 'Return to Origin', icon: '↩️', description: 'Package being returned to seller' }
    case 'DELAYED':
      return { badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Delayed', icon: '⏰', description: 'Shipment is running behind schedule' }
    default:
      return { badge: 'bg-slate-100 text-slate-700 border-slate-300', label: s.replace(/_/g, ' '), icon: '📦', description: '' }
  }
}

function getTimelineIndex(status?: string): number {
  const s = String(status || 'ORDER_PLACED').toUpperCase()
  if (s === 'AWB_GENERATED') return 1
  if (s === 'DELIVERED') return 5
  if (s === 'OUT_FOR_DELIVERY') return 4
  if (s === 'IN_TRANSIT') return 3
  if (s === 'PICKED_UP') return 2
  if (s === 'SHIPMENT_CREATED') return 1
  if (['CANCELLED', 'UNDELIVERED', 'RTO', 'DELAYED', 'SHIPPING_PENDING'].includes(s)) return -1
  return 0
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [editingProducts, setEditingProducts] = useState<OrderItem[]>([])
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null)
  const [tracking, setTracking] = useState<TrackingResponse['tracking'] | null>(null)
  const [loadingTracking, setLoadingTracking] = useState(false)
  const [trackingError, setTrackingError] = useState('')
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null)
  const isClient = useClientOnly()
  const router = useRouter()

  useEffect(() => {
    if (isClient) {
      loadOrders()
    }
  }, [isClient])

  async function loadOrders() {
    try {
      const data = await api.getOrders()
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      await api.deleteOrder(orderId)
      loadOrders()
    } catch (err: any) {
      setError(err.message || 'Failed to delete order')
    }
  }

  async function handleEditSubmit() {
    if (!editingOrderId) return
    try {
      await api.updateOrder(editingOrderId, editingProducts)
      setEditingOrderId(null)
      loadOrders()
    } catch (err: any) {
      setError(err.message || 'Failed to update order')
    }
  }

  async function handleRetryPayment(orderId: string) {
    try {
      const order = await api.getOrderById(orderId)
      if (typeof window !== 'undefined') {
        localStorage.setItem('temp_order_products', JSON.stringify(order.products))
      }
      router.push(`/payment?orderId=${orderId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to retry payment')
    }
  }

  const fetchTracking = useCallback(async (orderId: string) => {
    setTrackingOrderId(orderId)
    setLoadingTracking(true)
    setTrackingError('')
    try {
      const res = await api.getOrderTracking(orderId)
      setTracking(res.tracking)
      // Also refresh the main list so inline cards reflect live data
      const fresh = await api.getOrders()
      setOrders(fresh)
    } catch (err: any) {
      setTrackingError(err.message || 'Failed to load tracking info')
    } finally {
      setLoadingTracking(false)
    }
  }, [])

  async function handleRetryShipment(orderId: string) {
    if (!confirm('Retry shipment creation for this order with Shiprocket?')) return
    setRetryingOrderId(orderId)
    try {
      const res = await api.retryShipment(orderId)
      if (res?.shipping) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, shipping: res.shipping, shippingErrors: res.shippingErrors || o.shippingErrors } : o))
      }
      const cfg = getShippingStatusConfig(res?.shipping?.status)
      alert(`Shipment retry complete. Status: ${cfg.label}`)
    } catch (err: any) {
      alert('Retry failed: ' + (err.message || 'Unknown error'))
    } finally {
      setRetryingOrderId(null)
    }
  }

  function getStatusConfig(status: string) {
    switch (status) {
      case 'pending':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'Pending',
          icon: '⏳',
          step: 1,
          description: 'Waiting for payment confirmation',
        }
      case 'paid':
        return {
          badge: 'bg-green-100 text-green-800 border-green-300',
          label: 'Paid',
          icon: '✅',
          step: 2,
          description: 'Payment confirmed, preparing for dispatch',
        }
      case 'shipped':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Shipped',
          icon: '🚚',
          step: 3,
          description: 'Your package is on its way',
        }
      case 'failed':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300',
          label: 'Payment Failed',
          icon: '❌',
          step: 0,
          description: 'Payment could not be processed',
        }
      case 'refunded':
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
          label: 'Refunded',
          icon: '↩️',
          step: 0,
          description: 'Amount has been refunded',
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
          label: status.toUpperCase(),
          icon: '📦',
          step: 1,
          description: '',
        }
    }
  }

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'paid', label: 'Paid', icon: '💳' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
  ]

  if (!isClient) return null

  const totalSpent = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'refunded')
    .reduce((acc, o) => acc + o.totalAmount, 0)
  const paidOrdersCount = orders.filter(o => o.status === 'paid' || o.status === 'shipped').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Your Orders</h1>
            <p className="text-gray-600 text-sm sm:text-base">Track and manage all your purchases</p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <Link href="/shop" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold transition-colors shadow-sm text-sm sm:text-base">
              Continue Shopping
            </Link>
            <Link href="/address" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold transition-colors shadow-sm text-sm sm:text-base">
              Manage Addresses
            </Link>
          </div>
        </div>

        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1 sm:mb-2">Total Orders</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800">{orders.length}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">including pending & past</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1 sm:mb-2">Completed</p>
              <p className="text-3xl sm:text-4xl font-bold text-emerald-700">{paidOrdersCount}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">paid or shipped orders</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1 sm:mb-2">Total Spent</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800">{formatINR(totalSpent)}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">lifetime purchase value</p>
            </div>
          </div>
        )}

        {error && (
          error === 'Unauthorized' ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-800 px-6 py-8 rounded-2xl mb-6 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-3xl font-bold mb-3">Unauthorized</h2>
              <p className="mb-6 text-lg">Please log in to view and track your orders.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                🔐 Login to Your Account
              </Link>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )
        )}

        {loading ? (
          <div className="text-center py-16 sm:py-20 text-gray-500 text-lg sm:text-xl">
            <div className="animate-pulse mb-3 sm:mb-4 text-4xl sm:text-5xl">📦</div>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 text-center py-12 sm:py-20 px-4">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 inline-block animate-bounce">📦</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">No orders yet!</h2>
            <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
              Start shopping to place your first order and watch the wellness begin.
            </p>
            <Link
              href="/shop"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-emerald-200 transition-all inline-flex items-center gap-2"
            >
              🌿 Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-8">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status)
              const address = order.addressId && typeof order.addressId === 'object'
                ? (order.addressId as Address)
                : null
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-8 py-4 sm:py-5 flex flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 text-white">
                    <div className="min-w-0 flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm opacity-90 font-medium">Order ID</p>
                      <p className="font-bold text-base sm:text-lg md:text-xl font-mono break-all">#{order._id}</p>
                    </div>
                    <div className="text-left sm:text-right min-w-0 flex-1 sm:flex-none">
                      <p className="text-xs sm:text-sm opacity-90 font-medium">Order Date</p>
                      <p className="font-bold text-sm sm:text-base">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm border inline-flex items-center gap-1 sm:gap-2 w-fit order-first sm:order-none ${statusConfig.badge}`}>
                      <span>{statusConfig.icon}</span>
                      {statusConfig.label.toUpperCase()}
                    </span>
                    <div className="text-left sm:text-right min-w-0 flex-1 sm:flex-none w-full sm:w-auto">
                      <p className="text-xs sm:text-sm opacity-90 font-medium">Total Amount</p>
                      <p className="font-bold text-xl sm:text-2xl md:text-3xl">{formatINR(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-8 space-y-5 sm:space-y-8">
                    <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-3 gap-1">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
                          Order Progress
                        </h3>
                        <p className="text-xs text-gray-500">{statusConfig.description}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-5 sm:top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8 sm:mx-12 -z-0"></div>
                        <div className="flex items-center justify-between relative z-10">
                          {steps.map((step, i) => {
                            const currentStep = statusConfig.step
                            const isActive = currentStep > 0 && (i + 1) <= currentStep
                            const isCurrent = (i + 1) === currentStep
                            return (
                              <div key={step.key} className="flex flex-col items-center flex-1">
                                <div
                                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-xl border-2 transition-all ${
                                    isActive
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-110'
                                      : isCurrent
                                      ? 'bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg animate-pulse scale-110'
                                      : 'bg-gray-100 border-gray-200 text-gray-400'
                                  }`}
                                >
                                  {step.icon}
                                </div>
                                <p className={`mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm font-semibold text-center px-1 ${
                                  isActive ? 'text-emerald-700' : isCurrent ? 'text-yellow-700' : 'text-gray-400'
                                }`}>
                                  {step.label}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                        🛒 Items in this Order ({order.quantity} units)
                      </h3>
                      {editingOrderId === order._id ? (
                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                          {editingProducts.map((item, index) => {
                            const product = products.find(p => p.id === item.productId)
                            return (
                              <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                                  🌱
                                </div>
                                <div className="flex-1 min-w-0 order-last sm:order-none w-full sm:w-auto">
                                  <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{product?.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">{formatINR(item.pricePerUnit)} per unit</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full p-1 shadow-sm ml-auto sm:ml-0">
                                  <button
                                    onClick={() => {
                                      if (item.quantity > 1) {
                                        setEditingProducts(prev => {
                                          const newProducts = [...prev]
                                          newProducts[index] = { ...item, quantity: item.quantity - 1 }
                                          return newProducts
                                        })
                                      }
                                    }}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 transition-colors text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 sm:w-10 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => {
                                      setEditingProducts(prev => {
                                        const newProducts = [...prev]
                                        newProducts[index] = { ...item, quantity: item.quantity + 1 }
                                        return newProducts
                                      })
                                    }}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition-colors text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="font-bold text-gray-800 text-sm sm:text-base min-w-[60px] sm:min-w-[70px] text-right">
                                  {formatINR(item.quantity * item.pricePerUnit)}
                                </p>
                              </div>
                            )
                          })}
                          <div className="flex gap-2 sm:gap-3 pt-2 flex-wrap">
                            <button
                              onClick={handleEditSubmit}
                              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                            >
                              💾 Save Changes
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-colors text-sm sm:text-base"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {order.products.map((item, index) => {
                            const product = products.find(p => p.id === item.productId)
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl"
                              >
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0">
                                  🌱
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{product?.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    {item.quantity} units × {formatINR(item.pricePerUnit)}
                                  </p>
                                </div>
                                <p className="font-bold text-emerald-700 text-base sm:text-lg min-w-[60px] sm:min-w-[80px] text-right">
                                  {formatINR(item.quantity * item.pricePerUnit)}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {address && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                          🏠 Delivery Address
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-3 sm:p-5 border border-gray-100">
                          <p className="font-bold text-gray-800 text-sm sm:text-base">{address.fullName}</p>
                          <p className="text-gray-600 text-xs sm:text-sm mt-1">📞 {address.phone}</p>
                          <p className="text-gray-700 mt-2 leading-relaxed text-sm sm:text-base">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                            {', '}
                            {address.city}, {address.state} - {address.postalCode}
                            {', '}
                            {address.country}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.razorpayPaymentId && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          💳
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-600 font-semibold">Payment Reference</p>
                          <p className="font-mono text-xs sm:text-sm font-bold text-gray-800 break-all">
                            Razorpay ID: {order.razorpayPaymentId}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Shipping / Delivery Info Card */}
                    {order.status !== 'pending' && order.status !== 'failed' && (
                      <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-3 sm:p-5">
                        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                              🚚 Delivery & Shipment
                            </h3>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm border inline-flex items-center gap-1.5 ${getShippingStatusConfig(order.shipping?.status).badge}`}>
                            <span>{getShippingStatusConfig(order.shipping?.status).icon}</span>
                            {getShippingStatusConfig(order.shipping?.status).label.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                          {order.shipping?.courierName && (
                            <div className="bg-white/70 rounded-xl p-3 border border-white/80">
                              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold">Courier Partner</p>
                              <p className="font-bold text-gray-800 mt-1">{order.shipping.courierName}</p>
                            </div>
                          )}
                          {order.shipping?.awb && (
                            <div className="bg-white/70 rounded-xl p-3 border border-white/80">
                              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold">AWB Number</p>
                              <p className="font-mono font-bold text-gray-800 mt-1 break-all">{order.shipping.awb}</p>
                            </div>
                          )}
                          {order.shipping?.lastUpdated && (
                            <div className="bg-white/70 rounded-xl p-3 border border-white/80">
                              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-semibold">Last Updated</p>
                              <p className="font-semibold text-gray-800 mt-1">
                                {new Date(order.shipping.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                          )}
                        </div>
                        {order.shipping?.status === 'SHIPPING_PENDING' && (
                          <div className="mt-3 sm:mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-xs sm:text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">⚠️</span>
                              <div>
                                <p className="font-semibold">Shipment processing is temporarily queued.</p>
                                <p className="text-amber-700 mt-0.5">{order.shippingErrors && order.shippingErrors[order.shippingErrors.length - 1]}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!editingOrderId && (
                      <div className="pt-3 sm:pt-4 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3 justify-start">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRetryPayment(order._id)}
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              💰 Retry Payment
                            </button>
                            <button
                              onClick={() => {
                                setEditingOrderId(order._id)
                                setEditingProducts(order.products)
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              ✏️ Edit Order
                            </button>
                          </>
                        )}
                        {order.status === 'failed' && (
                          <button
                            onClick={() => handleRetryPayment(order._id)}
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                          >
                            🔄 Try Again
                          </button>
                        )}
                        {(order.status === 'paid' || order.status === 'shipped' || order.status === 'refunded') && (
                          <>
                            <button
                              onClick={() => fetchTracking(order._id)}
                              disabled={trackingOrderId === order._id && loadingTracking}
                              className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 disabled:opacity-60 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              {trackingOrderId === order._id && loadingTracking ? '⏳ Loading...' : '📍 Track Order'}
                            </button>
                            {(order.shipping?.status === 'SHIPPING_PENDING' || (order.shipping?.status === 'ORDER_PLACED' && !order.shipping?.shiprocketOrderId)) && (
                              <button
                                onClick={() => handleRetryShipment(order._id)}
                                disabled={retryingOrderId === order._id}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                              >
                                {retryingOrderId === order._id ? '⏳ Retrying...' : '🔁 Retry Shipment'}
                              </button>
                            )}
                          </>
                        )}
                        <Link
                          href={`/thank-you?orderId=${order._id}`}
                          className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                        >
                          🔍 View Details
                        </Link>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tracking Modal / Drawer */}
      {trackingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={() => { setTrackingOrderId(null); setTracking(null); setTrackingError('') }}>
          <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-sky-600 to-blue-700 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm opacity-90 font-medium">Shipment Tracking</p>
                <p className="font-bold text-base sm:text-xl md:text-2xl font-mono mt-0.5 break-all">#{trackingOrderId}</p>
              </div>
              <button onClick={() => { setTrackingOrderId(null); setTracking(null); setTrackingError('') }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-xl font-bold flex-shrink-0">
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-6">
              {loadingTracking ? (
                <div className="text-center py-12 sm:py-16 text-gray-500">
                  <div className="animate-spin inline-block w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full mb-4" />
                  <p className="text-lg">Fetching latest tracking information…</p>
                </div>
              ) : trackingError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold">Could not load tracking data</p>
                      <p className="text-sm mt-1">{trackingError}</p>
                    </div>
                  </div>
                </div>
              ) : tracking ? (
                <>
                  {/* Key shipment facts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-sky-600 font-semibold">Current Status</p>
                      <div className="mt-1.5 inline-flex items-center gap-1.5">
                        <span className="text-lg">{getShippingStatusConfig(tracking.status).icon}</span>
                        <p className="font-bold text-gray-800">{getShippingStatusConfig(tracking.status).label}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-600 font-semibold">Courier</p>
                      <p className="font-bold text-gray-800 mt-1">{tracking.courierName || '—'}</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-indigo-600 font-semibold">AWB Number</p>
                      <p className="font-mono font-bold text-gray-800 mt-1 break-all">{tracking.awb || '—'}</p>
                    </div>
                  </div>

                  {tracking.trackingUrl && (
                    <div className="flex justify-end">
                      <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-800 font-semibold text-sm border border-sky-200 hover:border-sky-300 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-colors">
                        🔗 Open on Courier Site
                      </a>
                    </div>
                  )}

                  {/* Shipment Timeline */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2">
                      🛣️ Shipment Journey
                    </h3>
                    <div className="relative">
                      {/* vertical line on md+ */}
                      <div className="hidden sm:block absolute left-[22px] top-3 bottom-3 w-0.5 bg-gray-200"></div>
                      <div className="space-y-3 sm:space-y-1">
                        {SHIPPING_TIMELINE.map((step, i) => {
                          const currentIdx = getTimelineIndex(tracking.status)
                          const isTerminal = tracking.status === 'CANCELLED' || tracking.status === 'UNDELIVERED' || tracking.status === 'RTO' || tracking.status === 'DELAYED'
                          const isDone = currentIdx >= 0 && i < currentIdx
                          const isCurrentStep = currentIdx >= 0 && i === currentIdx
                          const overrideCurrent = isTerminal && i === 0 ? false : false
                          const showAsCurrent = !isTerminal && isCurrentStep
                          return (
                            <div key={step.key} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-colors relative z-10">
                              <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl border-2 flex-shrink-0 transition-all shadow-sm ${isDone ? 'bg-emerald-500 border-emerald-500 text-white scale-100' : showAsCurrent ? 'bg-sky-500 border-sky-500 text-white shadow-lg ring-4 ring-sky-100 scale-110 animate-pulse' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                {isDone && !showAsCurrent ? '✓' : step.icon}
                              </div>
                              <div className="flex-1 pt-1.5 sm:pt-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className={`font-bold text-sm sm:text-base ${isDone || showAsCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {step.label}
                                  </h4>
                                  {showAsCurrent && (
                                    <span className="text-[10px] uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold">
                                      Now
                                    </span>
                                  )}
                                  {isDone && (
                                    <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                      Done
                                    </span>
                                  )}
                                </div>
                                {i === currentIdx && getShippingStatusConfig(tracking.status).description && (
                                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {getShippingStatusConfig(tracking.status).description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        {/* Terminal exception states */}
                        {(['CANCELLED', 'UNDELIVERED', 'RTO', 'DELAYED'] as const).some(s => s === tracking.status.toUpperCase()) && (
                          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-red-50 border-2 border-red-200 relative z-10">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-500 border-2 border-red-500 text-white flex items-center justify-center text-lg sm:text-xl flex-shrink-0 shadow-sm">
                              {getShippingStatusConfig(tracking.status).icon}
                            </div>
                            <div className="flex-1 pt-1.5 sm:pt-1 min-w-0">
                              <h4 className="font-bold text-sm sm:text-base text-red-800 flex items-center gap-2 flex-wrap">
                                {getShippingStatusConfig(tracking.status).label}
                                <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Exception</span>
                              </h4>
                              {getShippingStatusConfig(tracking.status).description && (
                                <p className="text-xs sm:text-sm text-red-700 mt-1">{getShippingStatusConfig(tracking.status).description}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Raw activity log if present */}
                  {tracking.activities && tracking.activities.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                        📋 Scan & Activity Log
                      </h3>
                      <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y divide-gray-200 max-h-72 overflow-y-auto">
                        {tracking.activities.map((act, i) => {
                          const when = act.date || act.activity || ''
                          const where = act.location || ''
                          const what = act.status || act.activity || ''
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 sm:p-4">
                              <span className="text-emerald-500 text-base mt-0.5">●</span>
                              <div className="flex-1 min-w-0">
                                {what && <p className="font-semibold text-gray-800 text-sm sm:text-base">{what}</p>}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs sm:text-sm text-gray-500">
                                  {when && <span>🕒 {when}</span>}
                                  {where && <span>📍 {where}</span>}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-xs sm:text-sm text-gray-500 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span>Last synced: {new Date(tracking.lastUpdated).toLocaleString('en-IN')}</span>
                    <button onClick={() => fetchTracking(trackingOrderId)} disabled={loadingTracking} className="text-sky-700 hover:text-sky-800 font-semibold disabled:opacity-50 inline-flex items-center gap-1">
                      🔄 Refresh
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
