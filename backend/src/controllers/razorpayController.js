// d:\mywork\Royal Organics\backend\src\services\shiprocketService.js
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

// In-memory token cache with expiry
let cachedToken = null
let tokenExpiresAt = 0 // epoch ms

/**
 * Internal HTTP helper. Do NOT log the Authorization header value.
 */
async function shiprocketRequest(path, options = {}) {
  const url = `${SHIPROCKET_BASE}${path}`
  const token = await getShiprocketToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    // Safety timeout
    signal: AbortSignal.timeout?.(30_000),
  })

  let data
  try {
    data = await res.json()
  } catch (_) {
    data = {}
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.errors?.[0]?.message ||
      `Shiprocket API error (${res.status}) for ${path}`
    console.error('[Shiprocket] Request failed:', path, res.status, data?.message || '')
    const err = new Error(msg)
    err.statusCode = res.status
    err.responseBody = data
    throw err
  }

  return data
}

/**
 * Authenticate with Shiprocket and return a JWT token.
 * Cached for ~23h (Shiprocket tokens are valid for ~24h).
 */
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
    tokenExpiresAt = now + 23 * 60 * 60 * 1000 // 23h safety margin
    return cachedToken
  } catch (err) {
    console.error('[Shiprocket] Auth error:', err.message)
    throw err
  }
}

/**
 * Map internal order data to the Shiprocket adhoc-order request body.
 *
 * Product dimensions/weights: since Royal Organics sells lightweight
 * moringa products, we use sensible defaults that can be tuned per SKU.
 */
export function buildShiprocketOrderPayload(order, user, address) {
  const orderItems = order.products.map(item => {
    // Derive basic SKU + defaults based on the product id
    const isCapsules = /capsule/i.test(item.productId)
    const name = isCapsules ? 'Organic Moringa Capsules' : 'Organic Moringa Powder'
    const sku = isCapsules ? 'MOR-CAP-120' : 'MOR-POW-100G'
    return {
      name,
      sku,
      units: item.quantity,
      selling_price: item.pricePerUnit,
      discount: '',
      tax: '',
      // HSN for herbal/moringa food supplements (India)
      hsn: 21069099,
    }
  })

  // Aggregate dimensions: estimate based on total quantity.
  // Capsules bottle approx 6x6x12 cm, 250 g; Powder pack approx 10x6x14 cm, 120 g.
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
  // Caps to avoid unrealistic dims when stacking
  lengthCm = Math.min(lengthCm, 30)
  breadthCm = Math.min(breadthCm, 25)
  heightCm = Math.min(heightCm, 40)
  totalWeightKg = Math.max(0.1, Math.round(totalWeightKg * 1000) / 1000)

  const fullName = address?.fullName || user?.name || 'Valued Customer'
  const [firstName, ...rest] = (fullName || '').split(' ')
  const lastName = rest.join(' ') || ''

  // Shiprocket expects 10-digit Indian phone; strip +91 and non-digits, keep last 10
  const rawPhone = String(address?.phone || user?.phone || '0000000000')
  const digits = rawPhone.replace(/\D/g, '')
  const billingPhone = digits.length >= 10 ? digits.slice(-10) : digits.padEnd(10, '0')

  const subTotal = Math.round(order.totalAmount)

  return {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19),
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

/**
 * Step 1: Create the Shiprocket adhoc order.
 * Returns { shiprocketOrderId, shipmentId, status, ... }
 */
export async function createShiprocketOrder(order, user, address) {
  const body = buildShiprocketOrderPayload(order, user, address)
  const data = await shiprocketRequest('/orders/create/adhoc', { method: 'POST', body })
  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id || data.shipment_ids?.[0],
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

/**
 * Step 2 (optional): Explicitly request AWB assignment. Some Shiprocket
 * plans auto-assign AWB on order creation, but this guarantees one.
 */
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

/**
 * Fetch tracking info by AWB code.
 */
export async function getTrackingByAWB(awb) {
  if (!awb) throw new Error('AWB required for tracking')
  const data = await shiprocketRequest(`/courier/track/awb/${encodeURIComponent(awb)}`)
  const tracking = data?.tracking_data?.tracking || data?.tracking_data || {}
  const trackData = Array.isArray(tracking) ? tracking[0] : tracking
  const activities = Array.isArray(data?.tracking_data?.track_data?.activities)
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

/**
 * Fetch tracking by Shiprocket shipment ID.
 */
export async function getTrackingByShipmentId(shipmentId) {
  if (!shipmentId) throw new Error('shipment_id required')
  const data = await shiprocketRequest(
    `/courier/track/shipment/${encodeURIComponent(shipmentId)}`,
  )
  const track = data?.tracking_data || data?.shipment_track || data
  return {
    shipmentId,
    courierName: track?.courier_name || '',
    currentStatus: track?.current_status || track?.status || 'UNKNOWN',
    currentStatusId: track?.current_status_id,
    awb: track?.awb || track?.awb_code || data?.awb || '',
    trackingUrl: data?.tracking_url || '',
    activities: Array.isArray(track?.track_data?.activities)
      ? track.track_data.activities
      : Array.isArray(track?.activities)
      ? track.activities
      : [],
    lastUpdated: track?.updated_at || new Date().toISOString(),
    raw: data,
  }
}

/**
 * Cancel a shipment in Shiprocket. Useful if order is cancelled/refunded.
 */
export async function cancelShipment(shipmentIds = []) {
  if (!Array.isArray(shipmentIds)) shipmentIds = [shipmentIds]
  const ids = shipmentIds.map(Number).filter(Boolean)
  if (!ids.length) throw new Error('No shipment IDs to cancel')
  const body = { ids }
  return shiprocketRequest('/orders/cancel/shipment', { method: 'POST', body })
}

/**
 * Check courier serviceability for a pincode + weight.
 * Useful pre-checkout warning for unserviceable areas.
 */
export async function getServiceability(pickupPincode, deliveryPincode, weightKg, cod = false) {
  const params = new URLSearchParams({
    pickup_postcode: String(pickupPincode),
    delivery_postcode: String(deliveryPincode),
    weight: String(weightKg),
    cod: cod ? 1 : 0,
  })
  return shiprocketRequest(`/courier/serviceability?${params.toString()}`)
}

/**
 * Orchestrate the full post-paid shipping flow:
 *   create order → assign AWB → pull tracking → return summary
 *
 * Returns a flat object ready to be saved onto Order.shipping.
 * On partial failure, it returns whatever data was obtained so the
 * order record can be updated with SHIPPING_PENDING + error log.
 */
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

  try {
    // 1. Create Shiprocket order
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
    result.status = created.status && /created|new|ordered/i.test(String(created.status))
      ? 'SHIPMENT_CREATED'
      : 'ORDER_PLACED'

    // 2. Assign AWB if not already present
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

    // 3. Pull latest tracking to get URL + current status
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
        // Tracking not available yet - not critical
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

/**
 * Map Shiprocket's arbitrary status strings to our normalized enum.
 * Supported states:
 *   ORDER_PLACED, SHIPMENT_CREATED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY,
 *   DELIVERED, CANCELLED, UNDELIVERED, RTO, DELAYED, SHIPPING_PENDING
 */
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
  // If none match but we have a string, keep track but fall through to IN_TRANSIT-ish
  return 'ORDER_PLACED'
}// d:\mywork\Royal Organics\backend\src\controllers\shiprocketController.js
/**
 * Shiprocket endpoints:
 *   - Webhook receiver (public, but validates x-api-key header)
 *   - Retry shipment creation (protected, user ownership verified)
 */
import Order from '../models/Order.js'
import User from '../models/User.js'
import Address from '../models/Address.js'
import {
  createFullShipment,
  getTrackingByAWB,
  getTrackingByShipmentId,
  normalizeShiprocketStatus,
} from '../services/shiprocketService.js'

const WEBHOOK_SECRET = process.env.SHIPROCKET_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/shiprocket
 * Receive tracking updates from Shiprocket webhook.
 *
 * Shiprocket sends `x-api-key` header matching the secret you set in their
 * dashboard. The payload contains `awb`, `current_status`, `shipment_id`,
 * `courier_name`, `current_timestamp`, and sometimes `awb` / `order_id`.
 *
 * We look up the matching MongoDB order by awb → shipmentId → (fallback)
 * custom order_id and update the `shipping` subdocument. Processing is
 * idempotent: we only update if the timestamp/changed fields differ.
 */
export async function shiprocketWebhook(req, res) {
  try {
    // 1. Validate webhook secret if configured
    if (WEBHOOK_SECRET) {
      const providedKey = req.headers['x-api-key'] || req.headers['X-API-Key']
      if (!providedKey || providedKey !== WEBHOOK_SECRET) {
        console.warn('[Shiprocket Webhook] Invalid or missing x-api-key')
        return res.status(401).json({ error: 'Unauthorized' })
      }
    }

    const payload = req.body || {}
    const {
      awb,
      current_status,
      shipment_status,
      shipment_id,
      courier_name,
      current_timestamp,
      awb_code,
      order_id,
      tracking_url,
      track_status,
    } = payload

    const effectiveAWB = awb || awb_code || ''
    const effectiveStatus = current_status || shipment_status || track_status || ''
    const effectiveShipmentId = shipment_id || ''
    const effectiveCourier = courier_name || payload.courier || ''
    const effectiveTime = current_timestamp
      ? new Date(current_timestamp)
      : new Date()

    console.log(
      `[Shiprocket Webhook] AWB=${effectiveAWB} status=${effectiveStatus} shipment=${effectiveShipmentId}`,
    )

    if (!effectiveAWB && !effectiveShipmentId && !order_id) {
      return res.status(400).json({ error: 'No identifiers in payload' })
    }

    // 2. Find matching order — try AWB first
    let order = null
    if (effectiveAWB) {
      order = await Order.findOne({ 'shipping.awb': effectiveAWB })
    }
    if (!order && effectiveShipmentId) {
      order = await Order.findOne({
        'shipping.shipmentId': String(effectiveShipmentId),
      })
    }
    // Last resort: match via our own order_id if webhook includes it
    if (!order && order_id && /^[0-9a-f]{24}$/i.test(String(order_id))) {
      order = await Order.findById(order_id)
    }

    if (!order) {
      console.warn(
        `[Shiprocket Webhook] No order found for AWB=${effectiveAWB} shipment=${effectiveShipmentId}`,
      )
      // Return 200 so Shiprocket doesn't keep retrying a bad payload
      return res.status(200).json({ ok: true, matched: false })
    }

    // 3. Idempotency: skip if exact same status+AWB and lastUpdated is newer
    const prevStatus = order.shipping?.status || ''
    const normalized = normalizeShiprocketStatus(effectiveStatus, shipment_status)
    const prevUpdated = order.shipping?.lastUpdated
      ? new Date(order.shipping.lastUpdated).getTime()
      : 0
    const incomingTime = effectiveTime.getTime()
    if (
      prevStatus === normalized &&
      order.shipping?.awb === effectiveAWB &&
      prevUpdated >= incomingTime
    ) {
      return res.status(200).json({ ok: true, skipped: true })
    }

    // 4. Update the shipping subdocument
    order.shipping = order.shipping || {}
    if (effectiveAWB) order.shipping.awb = effectiveAWB
    if (effectiveCourier) order.shipping.courierName = effectiveCourier
    if (effectiveShipmentId) order.shipping.shipmentId = String(effectiveShipmentId)
    if (tracking_url || order.shipping.trackingUrl === '') {
      order.shipping.trackingUrl = tracking_url || order.shipping.trackingUrl || ''
    }
    order.shipping.status = normalized
    order.shipping.statusMessage = effectiveStatus
    order.shipping.lastUpdated = effectiveTime

    // If order reached a delivered/transit terminal state, also bump
    // the top-level order status so the UI badge reflects it correctly.
    if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'AWB_GENERATED'].includes(normalized)) {
      if (order.status === 'paid') order.status = 'shipped'
    }

    await order.save()

    console.log(
      `[Shiprocket Webhook] Updated order ${order._id}: ${prevStatus} → ${normalized}`,
    )
    return res.status(200).json({ ok: true, updated: true, orderId: order._id })
  } catch (err) {
    console.error('[Shiprocket Webhook] Processing error:', err)
    // Always return 200 to avoid Shiprocket replaying repeatedly on
    // transient errors. Errors are logged for admin review.
    return res.status(200).json({ ok: false, error: err.message })
  }
}

/**
 * POST /api/orders/:id/retry-shipping
 * Protected. Re-attempts Shiprocket order/shipment creation for an order
 * that was marked SHIPPING_PENDING due to a transient failure.
 */
export async function retryShipment(req, res) {
  try {
    const userId = req.user.id
    const { id } = req.params

    const order = await Order.findOne({ _id: id, user: userId }).populate('addressId').populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (order.status !== 'paid' && order.status !== 'shipped') {
      return res.status(400).json({ error: 'Order must be paid before creating a shipment' })
    }

    const address = order.addressId
      ? order.addressId
      : null
    const user = order.user || (await User.findById(userId).select('name email'))

    const shipping = await createFullShipment(order, user, address)

    // Persist the new shipping subdocument (replace any previous)
    order.shipping = {
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
    }
    if (shipping.errors && shipping.errors.length) {
      order.shippingErrors = [
        ...(order.shippingErrors || []),
        `[${new Date().toISOString()}] Retry: ${shipping.errors.join('; ')}`,
      ].slice(-10)
    }
    if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'AWB_GENERATED'].includes(shipping.status) && order.status === 'paid') {
      order.status = 'shipped'
    }
    await order.save()

    return res.json({
      success: true,
      shipping: order.shipping,
      shippingErrors: order.shippingErrors,
    })
  } catch (err) {
    console.error('[Shiprocket] retryShipment error:', err.message)
    res.status(500).json({ error: 'Failed to retry shipment creation' })
  }
}

/**
 * GET /api/orders/:id/tracking
 * Protected, user-owned only. Returns tracking data — freshened from
 * Shiprocket if we have an AWB/shipment ID — with a normalized response.
 */
export async function getOrderTracking(req, res) {
  try {
    const userId = req.user.id
    const { id } = req.params

    const order = await Order.findOne({ _id: id, user: userId }).populate('addressId')
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const shipping = order.shipping || {}
    let liveStatus = shipping.status || 'ORDER_PLACED'
    let liveCourier = shipping.courierName || ''
    let liveAWB = shipping.awb || ''
    let liveTrackingUrl = shipping.trackingUrl || ''
    let lastUpdated = shipping.lastUpdated || order.updatedAt
    let activities = []

    // Refresh from Shiprocket if possible (best-effort)
    if (shipping.awb || shipping.shipmentId) {
      try {
        const fresh = shipping.awb
          ? await getTrackingByAWB(shipping.awb)
          : await getTrackingByShipmentId(shipping.shipmentId)
        liveStatus = normalizeShiprocketStatus(fresh.currentStatus, fresh.shipmentStatus)
        liveCourier = fresh.courierName || liveCourier
        liveAWB = fresh.awb || liveAWB
        liveTrackingUrl = fresh.trackingUrl || liveTrackingUrl
        lastUpdated = fresh.lastUpdated || lastUpdated
        activities = fresh.activities || []

        // Persist freshened state back to the order for webhook-less drift recovery
        if (
          liveStatus !== shipping.status ||
          liveCourier !== shipping.courierName ||
          liveAWB !== shipping.awb
        ) {
          order.shipping = {
            ...(shipping || {}),
            status: liveStatus,
            courierName: liveCourier,
            awb: liveAWB,
            trackingUrl: liveTrackingUrl,
            lastUpdated: new Date(lastUpdated),
          }
          if (
            ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'AWB_GENERATED'].includes(liveStatus) &&
            order.status === 'paid'
          ) {
            order.status = 'shipped'
          }
          await order.save()
        }
      } catch (err) {
        console.warn('[Shiprocket] Tracking refresh failed:', err.message)
        // Don't fail the request — stale data is better than none
      }
    }

    return res.json({
      success: true,
      tracking: {
        orderId: order._id,
        shiprocketOrderId: shipping.shiprocketOrderId || null,
        shipmentId: shipping.shipmentId || null,
        awb: liveAWB,
        courierName: liveCourier,
        status: liveStatus,
        statusMessage: shipping.statusMessage || liveStatus,
        trackingUrl: liveTrackingUrl,
        lastUpdated,
        activities,
      },
    })
  } catch (err) {
    console.error('[Shiprocket] getOrderTracking error:', err.message)
    res.status(500).json({ error: 'Failed to get tracking information' })
  }
}import Order from '../models/Order.js'
import User from '../models/User.js'
import Address from '../models/Address.js'
import dotenv from 'dotenv'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createFullShipment } from '../services/shiprocketService.js'

dotenv.config()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
})

export async function createRazorpayOrder(req, res) {
  try {
    const { orderId } = req.body
    const userId = req.user.id

    const order = await Order.findOne({ _id: orderId, user: userId }).populate('user', 'name email').populate('addressId')
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const amountInPaise = Math.round(order.totalAmount * 100)
    const receiptId = `order_${order._id}_${Date.now()}`

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        orderId: order._id.toString(),
        userId: userId.toString(),
        email: user.email || '',
      },
    })

    order.razorpayOrderId = razorpayOrder.id
    await order.save()

    const address = order.addressId
      ? {
          name: order.addressId.fullName,
          contact: order.addressId.phone,
          line1: order.addressId.addressLine1,
          line2: order.addressId.addressLine2 || '',
          city: order.addressId.city,
          state: order.addressId.state,
          postal_code: order.addressId.postalCode,
          country: 'India',
        }
      : undefined

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      user: {
        name: user.name,
        email: user.email,
      },
      address,
      receipt: receiptId,
    })
  } catch (error) {
    console.error('Razorpay create order error:', error)
    res.status(500).json({ error: 'Failed to create Razorpay order' })
  }
}

export async function verifyRazorpayPayment(req, res) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body
    const userId = req.user.id

    const order = await Order.findOne({ _id: orderId, user: userId })
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      order.status = 'failed'
      order.razorpayOrderId = razorpayOrderId
      order.razorpayPaymentId = razorpayPaymentId
      order.razorpaySignature = razorpaySignature
      await order.save()
      return res.status(400).json({ error: 'Invalid payment signature. Payment could not be verified.' })
    }

    order.status = 'paid'
    order.razorpayOrderId = razorpayOrderId
    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    order.paymentIntentId = razorpayPaymentId
    await order.save()

    // Kick off Shiprocket flow in the background — never fail the payment
    // response if shipping integration errors out.
    processShiprocketAsync(order).catch(err =>
      console.error('[Razorpay Verify] Shiprocket async error:', err.message),
    )

    res.json({
      success: true,
      orderId: order._id,
      status: order.status,
      amount: order.totalAmount,
      razorpayPaymentId,
    })
  } catch (error) {
    console.error('Razorpay verify error:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
}

export async function razorpayWebhook(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    const razorpaySignatureHeader = req.headers['x-razorpay-signature']

    if (webhookSecret && razorpaySignatureHeader) {
      const body = JSON.stringify(req.body)
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpaySignatureHeader) {
        return res.status(400).json({ error: 'Invalid webhook signature' })
      }
    }

    const { event, payload } = req.body

    if (!event || !payload) {
      return res.status(400).json({ error: 'Missing event or payload' })
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payment || payload.payment_capture
      const orderId = payment?.notes?.orderId || payment?.order_id
      if (orderId) {
        let order
        if (orderId.startsWith('order_')) {
          order = await Order.findOne({ razorpayOrderId: orderId })
        } else {
          order = await Order.findById(orderId)
        }
        if (order && order.status === 'pending') {
          order.status = 'paid'
          if (payment?.id) order.razorpayPaymentId = payment.id
          await order.save()
          console.log(`[Webhook] Order ${order._id} marked as paid`)
          processShiprocketAsync(order).catch(err =>
            console.error('[Razorpay Webhook] Shiprocket async error:', err.message),
          )
        }
      }
    }

    if (event === 'payment.failed') {
      const payment = payload.payment
      const orderId = payment?.notes?.orderId || payment?.order_id
      if (orderId) {
        let order
        if (orderId.startsWith('order_')) {
          order = await Order.findOne({ razorpayOrderId: orderId })
        } else {
          order = await Order.findById(orderId)
        }
        if (order) {
          order.status = 'failed'
          if (payment?.id) order.razorpayPaymentId = payment.id
          await order.save()
          console.log(`[Webhook] Order ${order?._id} marked as failed`)
        }
      }
    }

    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

/**
 * Fire-and-forget helper: takes a freshly paid order, loads user + address,
 * runs createFullShipment, and persists shipping + errors onto the order.
 * Never throws — any failures are logged + stored in shippingErrors.
 */
async function processShiprocketAsync(order) {
  try {
    // Re-fetch order fresh with populated refs in case state changed
    const fresh = await Order.findById(order._id)
      .populate('addressId')
      .populate('user', 'name email')
    if (!fresh) return

    // Skip if shipping already fully processed (idempotency)
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
        fresh.shipping = { ...(fresh.shipping || {}), status: 'SHIPPING_PENDING', lastUpdated: new Date() }
        fresh.shippingErrors = [
          ...(fresh.shippingErrors || []),
          `[${new Date().toISOString()}] processShiprocketAsync: ${err.message}`,
        ].slice(-10)
        await fresh.save()
      }
    } catch (_) {
      /* nothing more we can do */
    }
  }
}
