import Order from '../models/Order.js'
import CatalogProduct from '../models/CatalogProduct.js'

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Accepts an array or a newline/comma separated string and returns clean strings.
function toStringArray(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[\n,]/)
  return raw.map(item => String(item).trim()).filter(Boolean)
}

function toOptionalNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

export async function listAllOrders(req, res) {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('addressId')
      .sort({ createdAt: -1 })
      .lean()
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

export async function listAllProducts(req, res) {
  try {
    const products = await CatalogProduct.find({}).sort({ createdAt: -1 }).lean()
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}

export async function createProduct(req, res) {
  try {
    const body = req.body || {}

    const name = String(body.name || '').trim()
    if (!name) return res.status(400).json({ error: 'Product name is required' })

    const slug = slugify(body.slug || name)
    if (!slug) return res.status(400).json({ error: 'A valid product slug is required' })

    const category = body.category === 'capsules' ? 'capsules' : 'powder'

    const rawVariants = Array.isArray(body.variants) ? body.variants : []
    if (rawVariants.length === 0) {
      return res.status(400).json({ error: 'Add at least one package size' })
    }

    const variants = []
    for (const raw of rawVariants) {
      const label = String(raw?.label || '').trim()
      const grams = Number(raw?.grams)
      const price = Number(raw?.price)

      if (!label) return res.status(400).json({ error: 'Every package size needs a label' })
      if (!Number.isFinite(grams) || grams <= 0) {
        return res.status(400).json({ error: `Package "${label}" needs a weight in grams` })
      }
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ error: `Package "${label}" needs a valid price` })
      }

      const id = slugify(raw?.id || label) || `size-${variants.length + 1}`
      if (variants.some(v => v.id === id)) {
        return res.status(400).json({ error: `Duplicate package id "${id}"` })
      }

      const stockQuantity = toOptionalNumber(raw?.stockQuantity)
      variants.push(stockQuantity === undefined ? { id, label, grams, price } : { id, label, grams, price, stockQuantity })
    }

    const images = toStringArray(body.images).filter(url => /^https?:\/\//i.test(url))
    if (images.length === 0) {
      return res.status(400).json({ error: 'Add at least one image URL starting with http(s)://' })
    }

    const existing = await CatalogProduct.findOne({ $or: [{ slug }, { productId: slug }] }).lean()
    if (existing) {
      return res.status(409).json({ error: `A product with the slug "${slug}" already exists` })
    }

    const defaultVariantId = variants.some(v => v.id === body.defaultVariantId)
      ? body.defaultVariantId
      : variants[0].id

    const product = await CatalogProduct.create({
      productId: slug,
      slug,
      name,
      active: body.published === false ? false : true,
      storefront: true,
      category,
      description: String(body.description || '').trim(),
      highlights: toStringArray(body.highlights),
      benefits: toStringArray(body.benefits),
      dosage: String(body.dosage || '').trim(),
      ingredients: toStringArray(body.ingredients),
      badges: toStringArray(body.badges),
      images,
      originalPrice: toOptionalNumber(body.originalPrice),
      subscriptionPrice: toOptionalNumber(body.subscriptionPrice),
      defaultVariantId,
      variants,
    })

    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create product' })
  }
}
