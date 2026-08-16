'use client'
import { useEffect, useState } from 'react'
import { api, Order, OrderItem, Address } from '../../lib/api'
import { formatINR } from '../../lib/format'
import { products } from '../../data/products'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'
import { useRouter } from 'next/navigation'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [editingProducts, setEditingProducts] = useState<OrderItem[]>([])
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Orders</h1>
            <p className="text-gray-600">Track and manage all your purchases</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/shop" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
              Continue Shopping
            </Link>
            <Link href="/address" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
              Manage Addresses
            </Link>
          </div>
        </div>

        {!loading && orders.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Total Orders</p>
              <p className="text-4xl font-bold text-gray-800">{orders.length}</p>
              <p className="text-xs text-gray-400 mt-2">including pending & past</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Completed</p>
              <p className="text-4xl font-bold text-emerald-700">{paidOrdersCount}</p>
              <p className="text-xs text-gray-400 mt-2">paid or shipped orders</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Total Spent</p>
              <p className="text-4xl font-bold text-gray-800">{formatINR(totalSpent)}</p>
              <p className="text-xs text-gray-400 mt-2">lifetime purchase value</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">
            <div className="animate-pulse mb-4">📦</div>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 text-center py-20">
            <div className="text-8xl mb-6 inline-block animate-bounce">📦</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">No orders yet!</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              Start shopping to place your first order and watch the wellness begin.
            </p>
            <Link
              href="/shop"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-emerald-200 transition-all inline-flex items-center gap-2"
            >
              🌿 Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status)
              const address = order.addressId && typeof order.addressId === 'object'
                ? (order.addressId as Address)
                : null
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-white">
                    <div className="min-w-0">
                      <p className="text-sm opacity-90 font-medium">Order ID</p>
                      <p className="font-bold text-lg md:text-xl font-mono break-all">#{order._id}</p>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-sm opacity-90 font-medium">Order Date</p>
                      <p className="font-bold">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          dateStyle: 'long',
                        })}
                      </p>
                    </div>
                    <span className={`px-5 py-2 rounded-full font-bold text-sm border inline-flex items-center gap-2 ${statusConfig.badge}`}>
                      <span>{statusConfig.icon}</span>
                      {statusConfig.label.toUpperCase()}
                    </span>
                    <div className="text-right min-w-0">
                      <p className="text-sm opacity-90 font-medium">Total Amount</p>
                      <p className="font-bold text-2xl md:text-3xl">{formatINR(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                          Order Progress
                        </h3>
                        <p className="text-xs text-gray-500">{statusConfig.description}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-12 -z-0"></div>
                        <div className="flex items-center justify-between relative z-10">
                          {steps.map((step, i) => {
                            const currentStep = statusConfig.step
                            const isActive = currentStep > 0 && (i + 1) <= currentStep
                            const isCurrent = (i + 1) === currentStep
                            return (
                              <div key={step.key} className="flex flex-col items-center flex-1">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                                    isActive
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-110'
                                      : isCurrent
                                      ? 'bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg animate-pulse scale-110'
                                      : 'bg-gray-100 border-gray-200 text-gray-400'
                                  }`}
                                >
                                  {step.icon}
                                </div>
                                <p className={`mt-2 text-xs md:text-sm font-semibold text-center ${
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
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🛒 Items in this Order ({order.quantity} units)
                      </h3>
                      {editingOrderId === order._id ? (
                        <div className="space-y-4 mb-6">
                          {editingProducts.map((item, index) => {
                            const product = products.find(p => p.id === item.productId)
                            return (
                              <div key={index} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center text-2xl">
                                  🌱
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 truncate">{product?.name}</p>
                                  <p className="text-sm text-gray-500">{formatINR(item.pricePerUnit)} per unit</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm">
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
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                                  <button
                                    onClick={() => {
                                      setEditingProducts(prev => {
                                        const newProducts = [...prev]
                                        newProducts[index] = { ...item, quantity: item.quantity + 1 }
                                        return newProducts
                                      })
                                    }}
                                    className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="font-bold text-gray-800 min-w-[70px] text-right">
                                  {formatINR(item.quantity * item.pricePerUnit)}
                                </p>
                              </div>
                            )
                          })}
                          <div className="flex gap-3 pt-2 flex-wrap">
                            <button
                              onClick={handleEditSubmit}
                              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                              💾 Save Changes
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {order.products.map((item, index) => {
                            const product = products.find(p => p.id === item.productId)
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl"
                              >
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                  🌱
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-800 truncate">{product?.name}</p>
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {item.quantity} units × {formatINR(item.pricePerUnit)}
                                  </p>
                                </div>
                                <p className="font-bold text-emerald-700 text-lg min-w-[80px] text-right">
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
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                          🏠 Delivery Address
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                          <p className="font-bold text-gray-800">{address.fullName}</p>
                          <p className="text-gray-600 text-sm mt-1">📞 {address.phone}</p>
                          <p className="text-gray-700 mt-2 leading-relaxed">
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
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                          💳
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Payment Reference</p>
                          <p className="font-mono text-sm font-bold text-gray-800 break-all">
                            Razorpay ID: {order.razorpayPaymentId}
                          </p>
                        </div>
                      </div>
                    )}

                    {!editingOrderId && (
                      <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-start">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRetryPayment(order._id)}
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              💰 Retry Payment
                            </button>
                            <button
                              onClick={() => {
                                setEditingOrderId(order._id)
                                setEditingProducts(order.products)
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                            >
                              ✏️ Edit Order
                            </button>
                          </>
                        )}
                        {order.status === 'failed' && (
                          <button
                            onClick={() => handleRetryPayment(order._id)}
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                          >
                            🔄 Try Again
                          </button>
                        )}
                        <Link
                          href={`/thank-you?orderId=${order._id}`}
                          className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                        >
                          🔍 View Details
                        </Link>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
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
    </div>
  )
}
