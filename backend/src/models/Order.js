import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    products: { type: [orderItemSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 }, // total quantity across items
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'shipped'], default: 'pending' },
    paymentIntentId: { type: String }, // Stripe-ready
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

export default mongoose.model('Order', orderSchema)
