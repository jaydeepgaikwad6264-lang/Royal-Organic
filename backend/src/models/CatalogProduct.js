import mongoose from 'mongoose'

const catalogVariantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    grams: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, min: 0 },
  },
  { _id: false }
)

const catalogProductSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: true },
    variants: { type: [catalogVariantSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('CatalogProduct', catalogProductSchema)
