'use client'
import { useEffect, useState } from 'react'
import { api, Order, OrderItem } from '../../lib/api'
import { formatUSD } from '../../lib/format'
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
      // Redirect to payment page with the order ID
      const order = await api.getOrderById(orderId)
      // Save the order's products to cart for payment
      if (typeof window !== 'undefined') {
        localStorage.setItem('temp_order_products', JSON.stringify(order.products))
      }
      router.push(`/payment?orderId=${orderId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to retry payment')
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Your Orders</h1>
          <div className="flex gap-3">
            <Link href="/shop" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium transition-colors">
              Continue Shopping
            </Link>
            <Link href="/address" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium transition-colors">
              Manage Addresses
            </Link>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet!</h2>
            <p className="text-gray-600 text-lg mb-8">Start shopping to place your first order.</p>
            <Link href="/shop" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-emerald-200 transition-all inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-white">
                    <p className="text-sm opacity-90">Order ID</p>
                    <p className="font-bold text-lg">{order._id}</p>
                  </div>
                  <div className="text-white text-right">
                    <p className="text-sm opacity-90">Order Date</p>
                    <p className="font-bold">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                  </div>
                  <span className={`px-5 py-2 rounded-full font-semibold ${getStatusBadge(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  <div className="text-white text-right">
                    <p className="text-sm opacity-90">Total Amount</p>
                    <p className="font-bold text-2xl">{formatUSD(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Order Items ({order.quantity} units)</h3>
                  
                  {editingOrderId === order._id ? (
                    <div className="space-y-4 mb-6">
                      {editingProducts.map((item, index) => {
                        const product = products.find(p => p.id === item.productId)
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-2xl">
                              🌱
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{product?.name}</p>
                              <p className="text-sm text-gray-500">{formatUSD(item.pricePerUnit)} per unit</p>
                            </div>
                            <div className="flex items-center gap-3">
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
                                className="w-10 h-10 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="text-lg font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  setEditingProducts(prev => {
                                    const newProducts = [...prev]
                                    newProducts[index] = { ...item, quantity: item.quantity + 1 }
                                    return newProducts
                                  })
                                }}
                                className="w-10 h-10 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <p className="font-bold text-gray-800">{formatUSD(item.quantity * item.pricePerUnit)}</p>
                          </div>
                        )
                      })}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleEditSubmit}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingOrderId(null)}
                          className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {order.products.map((item, index) => {
                        const product = products.find(p => p.id === item.productId)
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center text-2xl">
                              🌱
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{product?.name}</p>
                              <p className="text-sm text-gray-500">{item.quantity} units × {formatUSD(item.pricePerUnit)} per unit</p>
                            </div>
                            <p className="font-bold text-gray-800">{formatUSD(item.quantity * item.pricePerUnit)}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!editingOrderId && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRetryPayment(order._id)}
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                          >
                            Retry Payment
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrderId(order._id)
                              setEditingProducts(order.products)
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                          >
                            Edit Order
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Delete Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
