'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, type AdminOrder, type CreateProductPayload, type StorefrontProductDto } from '../../lib/api'
import { useAllProducts } from '../../lib/useAllProducts'
import { formatINR } from '../../lib/format'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  paid: 'bg-sky-100 text-sky-800 border-sky-300',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  failed: 'bg-red-100 text-red-700 border-red-300',
  refunded: 'bg-gray-100 text-gray-700 border-gray-300',
}

type VariantRow = { label: string; grams: string; price: string; stockQuantity: string }

const emptyVariant = (): VariantRow => ({ label: '', grams: '', price: '', stockQuantity: '' })

const initialForm = {
  name: '',
  slug: '',
  category: 'powder' as 'powder' | 'capsules',
  description: '',
  highlights: '',
  benefits: '',
  dosage: '',
  ingredients: '',
  badges: '',
  images: '',
  originalPrice: '',
  subscriptionPrice: '',
  published: true,
}

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'
const inputClass = `mt-1 ${fieldClass}`
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function AdminPage() {
  const allProducts = useAllProducts()

  const [phase, setPhase] = useState<'checking' | 'denied' | 'ready'>('checking')
  const [adminName, setAdminName] = useState('')
  const [tab, setTab] = useState<'orders' | 'products'>('orders')

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<StorefrontProductDto[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  const [form, setForm] = useState(initialForm)
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Only the emails listed in the backend ADMIN_EMAILS allowlist pass this check.
  useEffect(() => {
    let active = true
    api
      .getSession()
      .then((session) => {
        if (!active) return
        if (!session.isAdmin) {
          setPhase('denied')
          return
        }
        setAdminName(session.name || session.email)
        setPhase('ready')
      })
      .catch(() => {
        if (active) setPhase('denied')
      })
    return () => {
      active = false
    }
  }, [])

  const loadData = useCallback(async () => {
    setLoadingData(true)
    setDataError('')
    try {
      const [orderList, productList] = await Promise.all([
        api.adminGetOrders(),
        api.adminGetProducts(),
      ])
      setOrders(orderList)
      setProducts(productList)
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load dashboard data')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (phase === 'ready') loadData()
  }, [phase, loadData])

  const productName = useCallback(
    (productId: string) => allProducts.find((p) => p.id === productId)?.name || productId,
    [allProducts],
  )

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1
    }
    return counts
  }, [orders])

  function updateForm<K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateVariant(index: number, key: keyof VariantRow, value: string) {
    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.name.trim()) {
      setFormError('Product name is required')
      return
    }

    const cleanedVariants = variants.filter((v) => v.label.trim())
    if (cleanedVariants.length === 0) {
      setFormError('Add at least one package size')
      return
    }
    const badVariant = cleanedVariants.find(
      (v) => !Number.isFinite(Number(v.grams)) || Number(v.grams) <= 0 || !Number.isFinite(Number(v.price)),
    )
    if (badVariant) {
      setFormError(`Package "${badVariant.label}" needs a valid weight in grams and a price`)
      return
    }
    const imageUrls = form.images
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter(Boolean)
    if (imageUrls.length === 0) {
      setFormError('Add at least one image URL starting with http(s)://')
      return
    }
    if (!imageUrls.every((url) => /^https?:\/\//i.test(url))) {
      setFormError('Every image must be a full URL starting with http:// or https://')
      return
    }

    const payload: CreateProductPayload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category,
      description: form.description,
      highlights: form.highlights,
      benefits: form.benefits,
      dosage: form.dosage,
      ingredients: form.ingredients,
      badges: form.badges,
      images: imageUrls.join('\n'),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      subscriptionPrice: form.subscriptionPrice ? Number(form.subscriptionPrice) : undefined,
      published: form.published,
      variants: cleanedVariants.map((v) => ({
        label: v.label.trim(),
        grams: Number(v.grams),
        price: Number(v.price),
        stockQuantity: v.stockQuantity === '' ? undefined : Number(v.stockQuantity),
      })),
    }

    setSaving(true)
    try {
      const created = await api.adminCreateProduct(payload)
      setFormSuccess(`"${created.name}" saved. It is now live on the shop and product pages.`)
      setForm(initialForm)
      setVariants([emptyVariant()])
      const productList = await api.adminGetProducts()
      setProducts(productList)
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  if (phase === 'checking') {
    return (
      <main className="container py-16 text-center text-gray-500">Checking admin access…</main>
    )
  }

  if (phase === 'denied') {
    return (
      <main className="container py-12 sm:py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Admin access only</h1>
          <p className="mt-2 text-sm text-gray-600">
            This dashboard is restricted to Royal Organics administrators. Sign in with an admin
            account to continue.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-6 sm:py-10">
      <div className="container max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Signed in as {adminName}</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loadingData}
            className="self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingData ? 'Refreshing…' : 'Refresh data'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Orders', value: orders.length, tone: 'text-gray-800' },
            { label: 'Pending', value: statusCounts.pending || 0, tone: 'text-amber-600' },
            { label: 'Paid', value: statusCounts.paid || 0, tone: 'text-sky-600' },
            { label: 'Shipped', value: statusCounts.shipped || 0, tone: 'text-indigo-600' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
              <p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2 border-b border-gray-200">
          {(['orders', 'products'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === key
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {key === 'orders' ? `All Orders (${orders.length})` : `Add / View Products (${products.length})`}
            </button>
          ))}
        </div>

        {dataError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {dataError}
          </div>
        )}

        {tab === 'orders' ? (
          <section className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {loadingData ? (
              <p className="p-6 text-center text-sm text-gray-500">Loading orders…</p>
            ) : orders.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[820px] w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Shipping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => {
                      const customer =
                        typeof order.user === 'string' ? null : order.user
                      const address = typeof order.addressId === 'string' ? null : order.addressId
                      return (
                        <tr key={order._id} className="align-top hover:bg-gray-50/70">
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs text-gray-700">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleString('en-IN')}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{customer?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{customer?.email || '—'}</p>
                            {address && (
                              <p className="mt-1 text-xs text-gray-400">
                                {address.city}, {address.state}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <ul className="space-y-0.5 text-xs text-gray-600">
                              {order.products.map((item, index) => (
                                <li key={`${order._id}-${index}`}>
                                  {productName(item.productId)}
                                  {item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {formatINR(order.totalAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                                STATUS_STYLES[order.status] || 'border-gray-300 bg-gray-100 text-gray-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {order.shipping?.status ? (
                              <>
                                <p className="font-medium text-gray-700">{order.shipping.status}</p>
                                {order.shipping.awb && <p className="text-gray-400">AWB: {order.shipping.awb}</p>}
                                {order.shipping.courierName && (
                                  <p className="text-gray-400">{order.shipping.courierName}</p>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">Not shipped</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="mt-5 grid gap-6 lg:grid-cols-5">
            <form
              onSubmit={handleCreateProduct}
              className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6"
            >
              <h2 className="text-lg font-bold text-gray-800">Add Product</h2>
              <p className="mt-1 text-xs text-gray-500">
                Saved to MongoDB and published instantly on the shop and product pages.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="product-name">Product name *</label>
                  <input
                    id="product-name"
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="Organic Moringa Powder"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-slug">URL slug (optional)</label>
                  <input
                    id="product-slug"
                    className={inputClass}
                    value={form.slug}
                    onChange={(e) => updateForm('slug', e.target.value)}
                    placeholder="moringa-powder"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Leave empty to build it from the product name.
                  </p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-category">Category</label>
                  <select
                    id="product-category"
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value as 'powder' | 'capsules')}
                  >
                    <option value="powder">Powder</option>
                    <option value="capsules">Capsules</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="product-description">Description</label>
                  <textarea
                    id="product-description"
                    className={inputClass}
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-highlights">Highlights (one per line)</label>
                  <textarea
                    id="product-highlights"
                    className={inputClass}
                    rows={3}
                    value={form.highlights}
                    onChange={(e) => updateForm('highlights', e.target.value)}
                    placeholder={'USDA Organic\nFine Grind'}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-benefits">Benefits (one per line)</label>
                  <textarea
                    id="product-benefits"
                    className={inputClass}
                    rows={3}
                    value={form.benefits}
                    onChange={(e) => updateForm('benefits', e.target.value)}
                    placeholder={'Immunity\nEnergy'}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-ingredients">Ingredients (one per line)</label>
                  <textarea
                    id="product-ingredients"
                    className={inputClass}
                    rows={2}
                    value={form.ingredients}
                    onChange={(e) => updateForm('ingredients', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-badges">Badges (one per line)</label>
                  <textarea
                    id="product-badges"
                    className={inputClass}
                    rows={2}
                    value={form.badges}
                    onChange={(e) => updateForm('badges', e.target.value)}
                    placeholder={'Non-GMO\nVegan'}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-dosage">Dosage</label>
                  <input
                    id="product-dosage"
                    className={inputClass}
                    value={form.dosage}
                    onChange={(e) => updateForm('dosage', e.target.value)}
                    placeholder="Take 1 tsp daily."
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-original-price">MRP / original price (₹)</label>
                  <input
                    id="product-original-price"
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.originalPrice}
                    onChange={(e) => updateForm('originalPrice', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-subscription-price">Subscription price (₹)</label>
                  <input
                    id="product-subscription-price"
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.subscriptionPrice}
                    onChange={(e) => updateForm('subscriptionPrice', e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="product-images">
                    Image URLs (one per line, must start with https://) *
                  </label>
                  <textarea
                    id="product-images"
                    className={inputClass}
                    rows={3}
                    value={form.images}
                    onChange={(e) => updateForm('images', e.target.value)}
                    placeholder={'https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg'}
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Package sizes *</span>
                  <button
                    type="button"
                    onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    + Add size
                  </button>
                </div>
                <div className="mt-2 space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50/60 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                    >
                      <input
                        className={fieldClass}
                        placeholder="Label (e.g. 500 g)"
                        value={variant.label}
                        onChange={(e) => updateVariant(index, 'label', e.target.value)}
                      />
                      <input
                        className={fieldClass}
                        type="number"
                        min={1}
                        placeholder="Grams"
                        value={variant.grams}
                        onChange={(e) => updateVariant(index, 'grams', e.target.value)}
                      />
                      <input
                        className={fieldClass}
                        type="number"
                        min={0}
                        placeholder="Price ₹"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      />
                      <input
                        className={fieldClass}
                        type="number"
                        min={0}
                        placeholder="Stock (optional)"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, 'stockQuantity', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((prev) =>
                            prev.length === 1 ? [emptyVariant()] : prev.filter((_, i) => i !== index),
                          )
                        }
                        className="justify-self-end rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  Leave stock empty to sell this size without a stock limit.
                </p>
              </div>

              <label className="mt-5 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => updateForm('published', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Publish immediately
              </label>

              {formError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-5 w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Product'}
              </button>
            </form>

            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-800">Products in MongoDB</h2>
              <p className="mt-1 text-xs text-gray-500">{products.length} product(s) found</p>

              <div className="mt-4 space-y-3">
                {loadingData ? (
                  <p className="text-sm text-gray-500">Loading products…</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-gray-500">No products created yet.</p>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-800">{product.name}</p>
                          <p className="truncate font-mono text-[11px] text-gray-400">/{product.slug}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            product.active
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-gray-300 bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.active ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {product.category} • {product.variants?.length || 0} size(s) •{' '}
                        {product.images?.length || 0} image(s)
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {(product.variants || [])
                          .map((v) => `${v.label} — ${formatINR(v.price)}`)
                          .join(' | ')}
                      </p>
                      {product.storefront && product.active && (
                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-2 inline-block text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          View on store →
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
