import Order from '../models/Order.js'
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

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('user', 'name email')
      .populate('addressId')
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
      return res
        .status(400)
        .json({ error: 'Invalid payment signature. Payment could not be verified.' })
    }

    order.status = 'paid'
    order.razorpayOrderId = razorpayOrderId
    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    order.paymentIntentId = razorpayPaymentId
    await order.save()

    try {
      await processShiprocketAsync(order)
    } catch (err) {
      console.error('[Razorpay Verify] Shiprocket async error:', err.message)
    }

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
        if (typeof orderId === 'string' && orderId.startsWith('order_')) {
          order = await Order.findOne({ razorpayOrderId: orderId })
        } else {
          order = await Order.findById(orderId)
        }
        if (order && order.status === 'pending') {
          order.status = 'paid'
          if (payment?.id) order.razorpayPaymentId = payment.id
          await order.save()
          console.log(`[Webhook] Order ${order._id} marked as paid`)
          try {
            await processShiprocketAsync(order)
          } catch (err) {
            console.error('[Razorpay Webhook] Shiprocket async error:', err.message)
          }
        }
      }
    }

    if (event === 'payment.failed') {
      const payment = payload.payment
      const orderId = payment?.notes?.orderId || payment?.order_id
      if (orderId) {
        let order
        if (typeof orderId === 'string' && orderId.startsWith('order_')) {
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

async function processShiprocketAsync(order) {
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
        fresh.shipping = {
          ...(fresh.shipping || {}),
          status: 'SHIPPING_PENDING',
          lastUpdated: new Date(),
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
