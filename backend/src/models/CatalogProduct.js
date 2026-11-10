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
    // True only for products created from the admin dashboard, which are shown
    // on the storefront. Pricing-only entries (e.g. seeded catalog rows) stay false.
    storefront: { type: Boolean, default: false, index: true },
    category: { type: String, enum: ['powder', 'capsules'], default: 'powder' },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    dosage: { type: String, default: '' },
    ingredients: { type: [String], default: [] },
    badges: { type: [String], default: [] },
    images: { type: [String], default: [] },
    originalPrice: { type: Number, min: 0 },
    subscriptionPrice: { type: Number, min: 0 },
    defaultVariantId: { type: String },
    variants: { type: [catalogVariantSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('CatalogProduct', catalogProductSchema)
