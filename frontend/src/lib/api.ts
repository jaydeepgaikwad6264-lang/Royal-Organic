export type AuthUser = { id: string; name: string; email: string; provider: 'manual' | 'google'; avatar?: string }
export type AuthResponse = { token: string; user: AuthUser }
export type ApiError = { error: string }

export type Address = {
  _id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type OrderItem = {
  productId: string
  quantity: number
  pricePerUnit: number
}

export type Order = {
  _id: string
  user: string
  products: OrderItem[]
  quantity: number
  totalAmount: number
  status: 'pending' | 'paid' | 'shipped'
  paymentIntentId?: string
  createdAt: string
  updatedAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options: RequestInit & { json?: any } = {}): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...getAuthHeaders(), ...(options.headers || {}) }
  const body = options.json ? JSON.stringify(options.json) : options.body
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, body, credentials: 'omit' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as ApiError)?.error || 'Request failed')
  return data as T
}

export type CartItem = {
  productId: string
  quantity: number
  pricePerUnit: number
}

export type Cart = {
  _id: string
  user: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export const api = {
  login: (email: string, password: string) => request<AuthResponse>('/api/auth/login', { method: 'POST', json: { email, password } }),
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', json: { name, email, password } }),
  googleUrl: () => `${API_BASE}/api/auth/google`,
  contact: (name: string, email: string, subject: string, message: string) =>
    request<{ ok: true }>('/api/contact', { method: 'POST', json: { name, email, subject, message } }),

  // Addresses
  getAddresses: () => request<Address[]>('/api/addresses'),
  createAddress: (address: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>) =>
    request<Address>('/api/addresses', { method: 'POST', json: address }),
  updateAddress: (id: string, address: Partial<Omit<Address, '_id' | 'createdAt' | 'updatedAt'>>) =>
    request<Address>(`/api/addresses/${id}`, { method: 'PUT', json: address }),
  deleteAddress: (id: string) => request<void>(`/api/addresses/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request<Cart>('/api/cart'),
  addToCart: (productId: string, quantity: number, pricePerUnit: number) =>
    request<Cart>('/api/cart', { method: 'POST', json: { productId, quantity, pricePerUnit } }),
  updateQuantity: (productId: string, quantity: number) =>
    request<Cart>('/api/cart', { method: 'PUT', json: { productId, quantity } }),
  removeFromCart: (productId: string) => request<Cart>(`/api/cart/${productId}`, { method: 'DELETE' }),
  clearCart: () => request<Cart>('/api/cart', { method: 'DELETE' }),

  // Orders
  createOrder: (products: OrderItem[]) => request<Order>('/api/orders', { method: 'POST', json: { products } }),
  updateOrder: (id: string, products: OrderItem[]) => request<Order>(`/api/orders/${id}`, { method: 'PUT', json: { products } }),
  deleteOrder: (id: string) => request<void>(`/api/orders/${id}`, { method: 'DELETE' }),
  createPaymentIntent: (orderId: string) =>
    request<{ clientSecret: string; orderId: string }>('/api/orders/create-payment-intent', { method: 'POST', json: { orderId } }),
  confirmPayment: (paymentIntentId: string) => request<Order>('/api/orders/confirm-payment', { method: 'POST', json: { paymentIntentId } }),
  getOrders: () => request<Order[]>('/api/orders'),
  getOrderById: (id: string) => request<Order>(`/api/orders/${id}`),
}
