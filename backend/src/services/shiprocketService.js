/**
 * Shiprocket API Service
 * Handles authentication (JWT), order creation, AWB generation, tracking,
 * and cancellation. Token is cached in-memory and refreshed on expiry.
 *
 * Official docs: https://apidocs.shiprocket.in/
 */
import dotenv from 'dotenv'

dotenv.config()

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external'
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD

let cachedToken = null
let tokenExpiresAt = 0

async function shiprocketRequest(path, options = {}) {
  const url = `${SHIPROCKET_BASE}${path}`
  const token = await getShiprocketToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const init = {
    method: options.method || 'GET',
    headers,
  }
  if (options.body) init.body = JSON.stringify(options.body)
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    init.signal = AbortSignal.timeout(30000)
  }

  const res = await fetch(url, init)

  let data
  try {
    data = await res.json()
  } catch (_) {
    data = {}
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      `Shiprocket API error (${res.status}) for ${path}`
    console.error('[Shiprocket] Request failed:', path, res.status, data?.message || '')
    const err = new Error(msg)
    err.statusCode = res.status
    err.responseBody = data
    throw err
  }

  return data
}

export async function getShiprocketToken() {
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    console.warn('[Shiprocket] Credentials not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD)')
    return null
  }

  const now = Date.now()
  if (cachedToken && tokenExpiresAt > now + 60_000) {
    return cachedToken
  }

  try {
    const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.token) {
      console.error('[Shiprocket] Auth failed:', data?.message || res.status)
      throw new Error(data?.message || 'Shiprocket authentication failed')
    }
    cachedToken = data.token
    tokenExpiresAt = now + 23 * 60 * 60 * 1000
    return cachedToken
  } catch (err) {
    console.error('[Shiprocket] Auth error:', err.message)
    throw err
  }
}

export function buildShiprocketOrderPayload(order, user, address) {
  const orderItems = order.products.map(item => {
    const isCapsules = /capsule/i.test(item.productId)
    const name = isCapsules ? 'Organic Moringa Capsules' : 'Organic Moringa Powder'
    const sku = isCapsules ? 'MOR-CAP-120' : 'MOR-POW-100G'
    return {
      name,
      sku,
      units: item.quantity,
      selling_price: item.pricePerUnit,
      discount: 0,
      tax: 0,
      hsn: 21069099,
    }
  })

  let totalWeightKg = 0
  let lengthCm = 10
  let breadthCm = 8
  let heightCm = 4
  order.products.forEach(item => {
    const isCapsules = /capsule/i.test(item.productId)
    if (isCapsules) {
      totalWeightKg += 0.25 * item.quantity
      heightCm += 12 * item.quantity
    } else {
      totalWeightKg += 0.12 * item.quantity
      heightCm += 14 * item.quantity
    }
  })
  lengthCm = Math.min(lengthCm, 30)
  breadthCm = Math.min(breadthCm, 25)
  heightCm = Math.min(heightCm, 40)
  totalWeightKg = Math.max(0.1, Math.round(totalWeightKg * 1000) / 1000)

  const fullName = address?.fullName || user?.name || 'Valued Customer'
  const [firstName, ...rest] = (fullName || '').split(' ')
  const lastName = rest.join(' ') || ''

  const rawPhone = String(address?.phone || user?.phone || '0000000000')
  const digits = rawPhone.replace(/\D/g, '')
  const billingPhone = digits.length >= 10 ? digits.slice(-10) : digits.padEnd(10, '0')

  const subTotal = Math.round(order.totalAmount)

  return {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: firstName || 'Customer',
    billing_last_name: lastName || '',
    billing_address: address?.addressLine1 || 'Address line 1',
    billing_address_2: address?.addressLine2 || '',
    billing_city: address?.city || 'City',
    billing_pincode: address?.postalCode || '000000',
    billing_state: address?.state || 'State',
    billing_country:
      address?.country && address.country.toLowerCase() === 'india' ? 'India' : 'India',
    billing_email: user?.email || 'support@royalorganics.in',
    billing_phone: billingPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.razorpayPaymentId || order.paymentIntentId ? 'Prepaid' : 'COD',
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: subTotal,
    length: lengthCm,
    breadth: breadthCm,
    height: heightCm,
    weight: totalWeightKg,
  }
}

export async function createShiprocketOrder(order, user, address) {
  const body = buildShiprocketOrderPayload(order, user, address)
  const data = await shiprocketRequest('/orders/create/adhoc', { method: 'POST', body })
  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id || (Array.isArray(data.shipment_ids) && data.shipment_ids[0]),
    status: data.status,
    statusMessage: data.message,
    awb: data.awb_code || '',
    courierName: data.courier_name || '',
    courierId: data.courier_id,
    weight: body.weight,
    length: body.length,
    breadth: body.breadth,
    height: body.height,
    pickupLocation: body.pickup_location,
    raw: data,
  }
}

export async function assignAWB(shipmentId, courierId) {
  const body = { shipment_id: Number(shipmentId) }
  if (courierId) body.courier_id = Number(courierId)
  const data = await shiprocketRequest('/courier/assign/awb', { method: 'POST', body })
  return {
    awb: data.awb_code || data.awb || '',
    courierName: data.courier_name || '',
    courierId: data.courier_id || courierId,
    raw: data,
  }
}

export async function getTrackingByAWB(awb) {
  if (!awb) throw new Error('AWB required for tracking')
  const data = await shiprocketRequest(`/courier/track/awb/${encodeURIComponent(awb)}`)
  const tracking = data?.tracking_data?.tracking || data?.tracking_data || {}
  const trackData = Array.isArray(tracking) ? tracking[0] : tracking
  const activities =
    (data?.tracking_data?.track_data && Array.isArray(data.tracking_data.track_data.activities))
      ? data.tracking_data.track_data.activities
      : []
  return {
    awb,
    courierName: trackData?.courier_name || data?.courier_name || '',
    currentStatus: trackData?.current_status || data?.current_status || 'UNKNOWN',
    currentStatusId: trackData?.current_status_id || data?.current_status_id,
    shipmentStatus: trackData?.shipment_status || data?.shipment_status || '',
    trackingUrl: data?.tracking_url || trackData?.tracking_url || '',
    activities,
    lastUpdated: trackData?.updated_at || data?.updated_at || new Date().toISOString(),
    raw: data,
  }
}

export async function getTrackingByShipmentId(shipmentId) {
  if (!shipmentId) throw new Error('shipment_id required')
  const data = await shiprocketRequest(`/courier/track/shipment/${encodeURIComponent(shipmentId)}`)
  const track = data?.tracking_data || data?.shipment_track || data
  const acts =
    (track?.track_data && Array.isArray(track.track_data.activities))
      ? track.track_data.activities
      : Array.isArray(track?.activities)
      ? track.activities
      : []
  return {
    shipmentId,
    courierName: track?.courier_name || '',
    currentStatus: track?.current_status || track?.status || 'UNKNOWN',
    currentStatusId: track?.current_status_id,
    awb: track?.awb || track?.awb_code || data?.awb || '',
    trackingUrl: data?.tracking_url || '',
    activities: acts,
    lastUpdated: track?.updated_at || new Date().toISOString(),
    raw: data,
  }
}

export async function cancelShipment(shipmentIds = []) {
  if (!Array.isArray(shipmentIds)) shipmentIds = [shipmentIds]
  const ids = shipmentIds.map(Number).filter(Boolean)
  if (!ids.length) throw new Error('No shipment IDs to cancel')
  const body = { ids }
  return shiprocketRequest('/orders/cancel/shipment', { method: 'POST', body })
}

export async function getServiceability(pickupPincode, deliveryPincode, weightKg, cod = false) {
  const params = new URLSearchParams({
    pickup_postcode: String(pickupPincode),
    delivery_postcode: String(deliveryPincode),
    weight: String(weightKg),
    cod: cod ? 1 : 0,
  })
  return shiprocketRequest(`/courier/serviceability?${params.toString()}`)
}

export async function createFullShipment(order, user, address) {
  const result = {
    shiprocketOrderId: null,
    shipmentId: null,
    awb: '',
    courierName: '',
    courierId: null,
    status: 'SHIPPING_PENDING',
    statusMessage: '',
    trackingUrl: '',
    lastUpdated: new Date(),
    weight: 0.1,
    length: 10,
    breadth: 8,
    height: 4,
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    errors: [],
  }

  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    result.errors.unshift('Shiprocket credentials not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD)')
    result.statusMessage = 'Shiprocket credentials missing'
    result.status = 'SHIPPING_PENDING'
    console.warn('[Shiprocket] createFullShipment: credentials not configured')
    return result
  }

  if (!address) {
    result.errors.unshift('No delivery address found for this order')
    result.statusMessage = 'Missing delivery address'
    result.status = 'SHIPPING_PENDING'
    console.warn('[Shiprocket] createFullShipment: no address for order', order?._id)
    return result
  }

  try {
    const created = await createShiprocketOrder(order, user, address)
    result.shiprocketOrderId = created.shiprocketOrderId
    result.shipmentId = String(created.shipmentId || '')
    result.courierId = created.courierId || null
    result.courierName = created.courierName || ''
    result.awb = created.awb || ''
    result.weight = created.weight
    result.length = created.length
    result.breadth = created.breadth
    result.height = created.height
    result.pickupLocation = created.pickupLocation

    if (!created.shiprocketOrderId || !created.shipmentId) {
      const msg =
        created.statusMessage ||
        (created.raw && (created.raw.message || created.raw.error || created.raw.error_message)) ||
        'Shiprocket order creation returned no order/shipment IDs'
      result.errors.unshift(`Order creation: ${msg}`)
      result.statusMessage = String(msg)
      result.status = 'SHIPPING_PENDING'
      console.error('[Shiprocket] createShiprocketOrder returned no IDs:', created.raw || msg)
      return result
    }

    result.status =
      created.status && /created|new|ordered/i.test(String(created.status))
        ? 'SHIPMENT_CREATED'
        : 'ORDER_PLACED'

    if (!result.awb && result.shipmentId) {
      try {
        const awbRes = await assignAWB(result.shipmentId, result.courierId)
        result.awb = awbRes.awb || result.awb
        result.courierName = awbRes.courierName || result.courierName
        result.courierId = awbRes.courierId || result.courierId
      } catch (awbErr) {
        result.errors.push(`AWB assignment: ${awbErr.message}`)
        console.warn('[Shiprocket] AWB assignment warning:', awbErr.message)
      }
    }

    if (result.awb || result.shipmentId) {
      try {
        const trackRes = result.awb
          ? await getTrackingByAWB(result.awb)
          : await getTrackingByShipmentId(result.shipmentId)
        result.trackingUrl = trackRes.trackingUrl || ''
        result.lastUpdated = new Date(trackRes.lastUpdated || Date.now())
        if (trackRes.currentStatus) {
          result.status = normalizeShiprocketStatus(trackRes.currentStatus, trackRes.shipmentStatus)
        }
      } catch (_) {
        // no-op
      }
    }

    if (result.shiprocketOrderId && result.shipmentId) {
      result.status = result.awb ? 'AWB_GENERATED' : 'SHIPMENT_CREATED'
    }
  } catch (err) {
    result.errors.unshift(err.message || 'Unknown Shiprocket error')
    result.status = 'SHIPPING_PENDING'
    result.statusMessage = err.message
    console.error('[Shiprocket] createFullShipment error:', err.message)
  }

  return result
}

export function normalizeShiprocketStatus(srStatus, shipmentStatus = '') {
  const s = String(srStatus || shipmentStatus || '').toLowerCase().trim()
  if (!s) return 'ORDER_PLACED'
  if (/\bdelivered\b/.test(s)) return 'DELIVERED'
  if (/\b(out for delivery)\b/.test(s)) return 'OUT_FOR_DELIVERY'
  if (/\b(picked up|pickup done|dispatched)\b/.test(s) || s.startsWith('pickup')) return 'PICKED_UP'
  if (/\bin transit\b/.test(s) || /\btransit\b/.test(s)) return 'IN_TRANSIT'
  if (/\b(shipped|manifested)\b/.test(s)) return 'IN_TRANSIT'
  if (/\b(rto|return|returned)\b/.test(s)) return 'RTO'
  if (/\b(cancel|cancelled)\b/.test(s)) return 'CANCELLED'
  if (/\b(undelivered|delivery failed|not delivered)\b/.test(s)) return 'UNDELIVERED'
  if (/\b(delay|delayed)\b/.test(s)) return 'DELAYED'
  if (/\b(awb generated|label generated)\b/.test(s)) return 'AWB_GENERATED'
  if (/\b(shipment created|new order|order created)\b/.test(s)) return 'SHIPMENT_CREATED'
  if (/\b(pending|shipping pending)\b/.test(s)) return 'SHIPPING_PENDING'
  return 'ORDER_PLACED'
}

/**
 * Extract tracking activities from various Shiprocket payload shapes
 * (webhook payloads, tracking API responses, etc.)
 */
export function extractActivitiesFromPayload(payload = {}) {
  // Try known paths where Shiprocket puts activity arrays
  const candidates = [
    payload.activities,
    payload.track_activities,
    payload.tracking_data?.activities,
    payload.tracking_data?.track_data?.activities,
    payload.shipment_track?.track_data?.activities,
    payload.shipment_track?.activities,
    payload.scan,
  ]

  let rawList = []
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      rawList = c
      break
    }
  }

  if (rawList.length === 0 && (payload.current_status || payload.status || payload.current_timestamp)) {
    // Build a single activity from the current webhook event
    rawList = [{
      date: payload.current_timestamp || payload.updated_at || payload.date || new Date().toISOString(),
      location: payload.location || payload.city || '',
      status: payload.current_status || payload.shipment_status || payload.track_status || payload.status || '',
      activity: payload.status_message || payload.message || payload.activity || '',
    }]
  }

  return rawList.map(a => ({
    date: String(a.date || a.timestamp || a.created_at || a.time || '').slice(0, 50),
    time: String(a.time || a.timestamp_value || '').slice(0, 50),
    location: String(a.location || a.city || a.place || a.source || '').slice(0, 200),
    status: String(a.status || a.current_status || a.track_status || '').slice(0, 200),
    activity: String(a.activity || a.activity_type || a.message || a.remark || a.status_message || '').slice(0, 500),
  })).filter(a => a.date || a.location || a.status || a.activity)
}

import Order from '../models/Order.js'
import User from '../models/User.js'

/**
 * Unified Shiprocket shipment creation + persistence.
 * Used by: Razorpay verify, Stripe confirm, Razorpay webhook, track-triggered retry.
 * Idempotent: skips if valid shiprocketOrderId + awb already exist.
 * Always saves `activities` array to order.shipping.
 */
export async function processShiprocketAsync(order) {
  try {
    const fresh = await Order.findById(order._id)
      .populate('addressId')
      .populate('user', 'name email')
    if (!fresh) return

    if (
      fresh.shipping?.shiprocketOrderId &&
      fresh.shipping?.awb &&
      fresh.shipping?.status !== 'SHIPPING_PENDING'
    ) {
      return
    }

    const user = fresh.user || (await User.findById(fresh.user).select('name email'))
    const address = fresh.addressId || null

    const shipping = await createFullShipment(fresh, user, address)

    let activities = []
    if (shipping.awb || shipping.shipmentId) {
      try {
        const trackRes = shipping.awb
          ? await getTrackingByAWB(shipping.awb)
          : await getTrackingByShipmentId(shipping.shipmentId)
        activities = Array.isArray(trackRes.activities) ? trackRes.activities : []
      } catch (_) {
        /* no-op */
      }
    }

    fresh.shipping = {
      shiprocketOrderId: shipping.shiprocketOrderId,
      shipmentId: shipping.shipmentId,
      awb: shipping.awb,
      courierName: shipping.courierName,
      courierId: shipping.courierId,
      status: shipping.status,
      statusMessage: shipping.statusMessage,
      trackingUrl: shipping.trackingUrl,
      lastUpdated: shipping.lastUpdated,
      weight: shipping.weight,
      length: shipping.length,
      breadth: shipping.breadth,
      height: shipping.height,
      pickupLocation: shipping.pickupLocation,
      activities,
    }
    if (shipping.errors && shipping.errors.length) {
      fresh.shippingErrors = [
        ...(fresh.shippingErrors || []),
        `[${new Date().toISOString()}] ${shipping.errors.join('; ')}`,
      ].slice(-10)
    }
    if (
      ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'AWB_GENERATED', 'SHIPMENT_CREATED'].includes(
        shipping.status,
      ) &&
      fresh.status === 'paid'
    ) {
      fresh.status = 'shipped'
    }
    await fresh.save()
    console.log(
      `[Shiprocket] Order ${fresh._id} shipping status: ${shipping.status}` +
        (shipping.awb ? `  AWB=${shipping.awb}` : ''),
    )
  } catch (err) {
    console.error('[Shiprocket] processShiprocketAsync fatal:', err.message)
    try {
      const fresh = await Order.findById(order._id)
      if (fresh) {
        fresh.shipping = {
          ...(fresh.shipping || {}),
          status: 'SHIPPING_PENDING',
          lastUpdated: new Date(),
          activities: fresh.shipping?.activities || [],
        }
        fresh.shippingErrors = [
          ...(fresh.shippingErrors || []),
          `[${new Date().toISOString()}] processShiprocketAsync: ${err.message}`,
        ].slice(-10)
        await fresh.save()
      }
    } catch (_) {
      /* no-op */
    }
  }
}
