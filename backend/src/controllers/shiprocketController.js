// d:\mywork\Royal Organics\backend\src\controllers\shiprocketController.js
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
}