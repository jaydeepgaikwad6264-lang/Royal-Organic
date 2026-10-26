import CatalogProduct from '../models/CatalogProduct.js'
import { getCatalogProductByProductId, getCatalogProductBySlug } from '../services/catalogService.js'

export async function getCatalogProduct(req, res) {
  try {
    const { productId } = req.params
    const product = await getCatalogProductByProductId(productId)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
}

export async function getCatalogProductBySlugHandler(req, res) {
  try {
    const { slug } = req.params
    const product = await getCatalogProductBySlug(slug)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
}

export async function updateVariantStock(req, res) {
  try {
    const { productId, variantId } = req.params
    const { stockQuantity } = req.body

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      return res.status(400).json({ error: 'stockQuantity must be a non-negative number' })
    }

    const updated = await CatalogProduct.findOneAndUpdate(
      { productId, 'variants.id': variantId },
      { $set: { 'variants.$.stockQuantity': stockQuantity } },
      { new: true }
    ).lean()

    if (!updated) return res.status(404).json({ error: 'Product/variant not found' })
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update stock' })
  }
}
