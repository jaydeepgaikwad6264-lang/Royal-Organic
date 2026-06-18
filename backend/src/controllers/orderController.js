import Order from '../models/Order.js'
import dotenv from 'dotenv'
import Stripe from 'stripe'

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

    const order = await Order.create({
      user: userId,
      products,
      quantity: totalQuantity,
      totalAmount,
      status: 'pending',
    })

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params
    const { products } = req.body
    const userId = req.user.id

    let totalQuantity = 0
    let totalAmount = 0

    products.forEach(item => {
      totalQuantity += item.quantity
      totalAmount += item.quantity * item.pricePerUnit
    })

    const order = await Order.findOneAndUpdate(
      { _id: id, user: userId, status: 'pending' },
      { products, quantity: totalQuantity, totalAmount },
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
      currency: 'usd',
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
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })
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
    const order = await Order.findOne({ _id: id, user: userId })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get order' })
  }
}
