'use client'
import { useState, useEffect } from 'react'
import { api, Address } from '../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClientOnly } from '../../lib/useClientOnly'
import { useCart } from '../../lib/cartContext'

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Address>>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const isClient = useClientOnly()
  const { totalPrice } = useCart()

  useEffect(() => {
    if (isClient) {
      loadAddresses()
    }
  }, [isClient])

  async function loadAddresses() {
    try {
      const data = await api.getAddresses()
      setAddresses(data)
    } catch (err) {
      setError('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await api.updateAddress(editingId, formData as any)
      } else {
        await api.createAddress(formData as any)
      }
      setIsAdding(false)
      setEditingId(null)
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      })
      loadAddresses()
    } catch (err: any) {
      setError(err.message || 'Failed to save address')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      await api.deleteAddress(id)
      loadAddresses()
    } catch (err: any) {
      setError(err.message || 'Failed to delete address')
    }
  }

  function handleEdit(address: Address) {
    setEditingId(address._id)
    setFormData(address)
    setIsAdding(true)
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Your Addresses</h1>
          <div className="flex gap-3">
            <Link href="/shop" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium transition-colors">
              Back to Shop
            </Link>
            <Link href="/my-orders" className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium transition-colors">
              My Orders
            </Link>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-xl">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {addresses.map(address => (
              <div key={address._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                {address.isDefault && <span className="inline-block bg-emerald-600 text-white text-xs px-3 py-1 rounded-full mb-4 font-semibold">Default</span>}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{address.fullName}</h3>
                <p className="text-gray-600 mb-1">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-gray-600 mb-1">{address.addressLine2}</p>}
                <p className="text-gray-600 mb-1">{address.city}, {address.state} {address.postalCode}</p>
                <p className="text-gray-600 mb-1">{address.country}</p>
                <p className="text-gray-600 mb-6">Phone: {address.phone}</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleEdit(address)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(address._id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    Delete
                  </button>
                  <Link href={`/payment?address=${address._id}`} className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-4 py-2 rounded-lg font-semibold text-center transition-all">
                    Deliver to this Address
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-emerald-200 transition-all"
        >
          {addresses.length === 0 ? '+ Add Your First Address' : '+ Add New Address'}
        </button>

        {isAdding && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Enter postal code"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.addressLine1}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="House number, street name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.addressLine2}
                  onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Landmark, area, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                </label>
              </div>
              <div className="md:col-span-2 flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
