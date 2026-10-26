import CatalogProduct from '../models/CatalogProduct.js'

export async function getCatalogProductByProductId(productId) {
  return CatalogProduct.findOne({ productId, active: true }).lean()
}

export async function getCatalogProductBySlug(slug) {
  return CatalogProduct.findOne({ slug, active: true }).lean()
}

export function findVariant(product, variantId) {
  if (!product || !Array.isArray(product.variants)) return null
  return product.variants.find(v => v.id === variantId) || null
}

export function computeProductAvailability(product) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
    return { anyInStock: false, minPrice: null }
  }
  let anyInStock = false
  let minPrice = null
  for (const v of product.variants) {
    if (typeof v.price === 'number') {
      minPrice = minPrice === null ? v.price : Math.min(minPrice, v.price)
    }
    if (typeof v.stockQuantity === 'number' && v.stockQuantity > 0) {
      anyInStock = true
    }
  }
  return { anyInStock, minPrice }
}

export function assertPurchasableVariant(variant, quantity) {
  if (!variant) {
    return { ok: false, error: 'Invalid package selection.' }
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { ok: false, error: 'Quantity must be at least 1.' }
  }
  if (typeof variant.stockQuantity !== 'number') {
    return { ok: false, error: 'Stock is not configured for this package yet.' }
  }
  if (variant.stockQuantity <= 0) {
    return { ok: false, error: 'Selected package is out of stock.' }
  }
  if (quantity > variant.stockQuantity) {
    return { ok: false, error: `Only ${variant.stockQuantity} unit(s) available for the selected package.` }
  }
  return { ok: true, error: null }
}

export async function deductVariantStock(productId, variantId, quantity) {
  const res = await CatalogProduct.updateOne(
    { productId, active: true, variants: { $elemMatch: { id: variantId, stockQuantity: { $gte: quantity } } } },
    { $inc: { 'variants.$.stockQuantity': -quantity } }
  )
  return res.modifiedCount > 0
}

export async function upsertMoringaPowderCatalog() {
  const productId = 'moringa-powder-1'
  const slug = 'moringa-powder'
  const name = 'Moringa Powder'
  const variants = [
    { id: '100g', label: '100 g', grams: 100, price: 149 },
    { id: '250g', label: '250 g', grams: 250, price: 199 },
    { id: '500g', label: '500 g', grams: 500, price: 399 },
    { id: '1kg', label: '1 kg', grams: 1000, price: 699 },
  ]

  const existing = await CatalogProduct.findOne({ productId })
  if (!existing) {
    await CatalogProduct.create({ productId, slug, name, active: true, variants })
    return
  }

  existing.slug = slug
  existing.name = name
  existing.active = true

  const stockById = new Map()
  for (const v of existing.variants || []) {
    if (typeof v.stockQuantity === 'number') {
      stockById.set(v.id, v.stockQuantity)
    }
  }

  existing.variants = variants.map(v => {
    const stockQuantity = stockById.has(v.id) ? stockById.get(v.id) : undefined
    return stockQuantity === undefined ? v : { ...v, stockQuantity }
  })

  await existing.save()
}
