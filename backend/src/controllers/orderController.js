import Order from '../models/Order.js'
import User from '../models/User.js'
import dotenv from 'dotenv'
import Stripe from 'stripe'
import { createFullShipment } from '../services/shiprocketService.js'

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_')

export async function createOrder(req, res) {
  try {
    const { products, addressId } = req.body
    const userId = req.user.id

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No products in order' })
    }

    let totalQuantity = 0
    let totalAmount = 0

    products.forEach(item => {
      totalQuantity += item.quantity
      totalAmount += item.quantity * item.pricePerUnit
    })

    const orderData = {
      user: userId,
      products,
      quantity: totalQuantity,
      totalAmount,
      status: 'pending',
    }
    if (addressId) orderData.addressId = addressId

    const order = await Order.create(orderData)

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params
    const { products, addressId } = req.body
    const userId = req.user.id

    let totalQuantity = 0
    let totalAmount = 0

    products.forEach(item => {
      totalQuantity += item.quantity
      totalAmount += item.quantity * item.pricePerUnit
    })

    const updateData = {
      products,
      quantity: totalQuantity,
      totalAmount,
    }
    if (addressId) updateData.addressId = addressId

    const order = await Order.findOneAndUpdate(
      { _id: id, user: userId, status: 'pending' },
      updateData,
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found or cannot be edited' })
    }

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update order' })
  }
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const order = await Order.findOneAndDelete({ _id: id, user: userId })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete order' })
  }
}

export async function createPaymentIntent(req, res) {
  try {
    const { orderId } = req.body
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe uses cents
      currency: 'inr',
      metadata: { orderId: order._id.toString() },
      automatic_payment_methods: { enabled: true },
    })

    order.paymentIntentId = paymentIntent.id
    await order.save()

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}

export async function confirmPayment(req, res) {
  try {
    const { paymentIntentId } = req.body
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findOneAndUpdate(
        { paymentIntentId },
        { status: 'paid' },
        { new: true }
      )
      if (order) {
        processShiprocketAsync(order).catch(err =>
          console.error('[Stripe Confirm] Shiprocket async error:', err.message),
        )
      }
      return res.json(order)
    }

    res.status(400).json({ error: 'Payment not successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
}

export async function getOrders(req, res) {
  try {
    const userId = req.user.id
    const orders = await Order.find({ user: userId })
      .populate('addressId')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get orders' })
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id
    const order = await Order.findOne({ _id: id, user: userId }).populate('addressId')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get order' })
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