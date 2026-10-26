import CatalogProduct from '../models/CatalogProduct.js'

export const MORINGA_POWDER_PRODUCT_ID = 'moringa-powder-1'
export const MORINGA_POWDER_SLUG = 'moringa-powder'
export const MORINGA_POWDER_VARIANTS = [
  { id: '100g', label: '100 g', grams: 100, price: 149 },
  { id: '250g', label: '250 g', grams: 250, price: 199 },
  { id: '500g', label: '500 g', grams: 500, price: 399 },
  { id: '1kg', label: '1 kg', grams: 1000, price: 699 },
]

// Products whose pricing is defined in code instead of the database.
const STATIC_VARIANTS_BY_PRODUCT_ID = {
  [MORINGA_POWDER_PRODUCT_ID]: MORINGA_POWDER_VARIANTS,
  'moringa-capsules-1': [{ id: 'default', label: '60 capsules', price: 399 }],
}

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
    // Stock is not tracked for this package, so there is no purchase limit.
    return { ok: true, error: null }
  }
  if (variant.stockQuantity <= 0) {
    return { ok: false, error: 'Selected package is out of stock.' }
  }
  if (quantity > variant.stockQuantity) {
    return { ok: false, error: `Only ${variant.stockQuantity} unit(s) available for the selected package.` }
  }
  return { ok: true, error: null }
}

export function normalizeVariantId(variantId) {
  const s = typeof variantId === 'string' ? variantId.trim() : ''
  return s || undefined
}

function resolveStaticVariant(productId, variantId) {
  const variants = STATIC_VARIANTS_BY_PRODUCT_ID[productId]
  if (!variants || variants.length === 0) {
    return { ok: false, error: 'Invalid product.' }
  }
  const chosen = variants.find(v => v.id === variantId) || (variants.length === 1 ? variants[0] : null)
  if (!chosen) {
    return { ok: false, error: 'Invalid package selection.' }
  }
  return {
    ok: true,
    pricePerUnit: chosen.price,
    variantId: chosen.id,
    variantLabel: chosen.label,
    grams: chosen.grams,
  }
}

// Resolves authoritative pricing and stock for a product/variant pair.
// Falls back to the static catalog when the product is not stored in the database.
export async function resolvePurchasableItem({ productId, variantId, quantity }) {
  const chosenId = normalizeVariantId(variantId)
  const catalog = await getCatalogProductByProductId(productId)

  if (catalog && Array.isArray(catalog.variants) && catalog.variants.length > 0) {
    const variant = findVariant(catalog, chosenId)
    if (variant) {
      const check = assertPurchasableVariant(variant, quantity)
      if (!check.ok) return { ok: false, error: check.error }
      return {
        ok: true,
        pricePerUnit: variant.price,
        variantId: variant.id,
        variantLabel: variant.label,
        grams: variant.grams,
      }
    }
  }

  return resolveStaticVariant(productId, chosenId)
}

export async function deductVariantStock(productId, variantId, quantity) {
  const res = await CatalogProduct.updateOne(
    { productId, active: true, variants: { $elemMatch: { id: variantId, stockQuantity: { $gte: quantity } } } },
    { $inc: { 'variants.$.stockQuantity': -quantity } }
  )
  return res.modifiedCount > 0
}

export async function upsertMoringaPowderCatalog() {
  const productId = MORINGA_POWDER_PRODUCT_ID
  const slug = MORINGA_POWDER_SLUG
  const name = 'Moringa Powder'
  const variants = MORINGA_POWDER_VARIANTS

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
