import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const shippingSchema = new mongoose.Schema(
  {
    shiprocketOrderId: { type: Number },
    shipmentId: { type: String },
    awb: { type: String },
    courierName: { type: String },
    courierId: { type: Number },
    status: { type: String, default: 'ORDER_PLACED', index: true },
    statusMessage: { type: String },
    trackingUrl: { type: String },
    lastUpdated: { type: Date },
    // Shipment dimensions & weight stored for reference
    weight: { type: Number },
    length: { type: Number },
    breadth: { type: Number },
    height: { type: Number },
    pickupLocation: { type: String, default: 'Primary' },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    products: { type: [orderItemSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 }, // total quantity across items
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'failed', 'refunded'], default: 'pending' },
    paymentIntentId: { type: String }, // Stripe-ready (kept for backwards compat)
    // Razorpay fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    // Shiprocket shipping data
    shipping: { type: shippingSchema, default: () => ({ status: 'ORDER_PLACED' }) },
    // Log of Shiprocket errors for admin retry/debugging
    shippingErrors: [{ type: String, default: [] }],
  },
  { timestamps: { createdAt: true, updatedAt: true } } 
)

export default mongoose.model('Order', orderSchema)
