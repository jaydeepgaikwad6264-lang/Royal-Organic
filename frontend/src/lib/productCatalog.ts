import type { Product } from '../types/product'
import { products as staticProducts } from '../data/products'
import { api, type StorefrontProductDto } from './api'

/** Converts an admin-created MongoDB product into the storefront `Product` shape. */
export function dtoToProduct(dto: StorefrontProductDto): Product {
  const images = (dto.images || []).filter(Boolean)
  const variants = (dto.variants || []).map((v) => ({
    id: v.id,
    label: v.label,
    grams: v.grams,
    price: v.price,
  }))
  const defaultVariantId = dto.defaultVariantId || variants[0]?.id
  const defaultVariant = variants.find((v) => v.id === defaultVariantId) || variants[0]
  const price = defaultVariant?.price ?? 0
  const originalPrice =
    dto.originalPrice && dto.originalPrice > price ? dto.originalPrice : price
  const inStock = (dto.variants || []).some(
    (v) => v.stockQuantity === undefined || v.stockQuantity > 0,
  )

  return {
    id: dto.productId,
    slug: dto.slug,
    name: dto.name,
    category: dto.category,
    description: dto.description || '',
    highlights: dto.highlights || [],
    benefits: dto.benefits || [],
    dosage: dto.dosage || '',
    ingredients: dto.ingredients || [],
    badges: (dto.badges || []) as Product['badges'],
    image: images[0],
    images,
    price,
    originalPrice,
    subscriptionPrice: dto.subscriptionPrice ?? price,
    subscriptionInterval: 'monthly',
    inStock,
    variants: variants.length > 0 ? variants : undefined,
    defaultVariantId,
  }
}

/** Built-in products first, then admin-created ones that don't clash by id or slug. */
export function mergeProducts(extra: Product[]): Product[] {
  const ids = new Set(staticProducts.map((p) => p.id))
  const slugs = new Set(staticProducts.map((p) => p.slug))
  const merged = [...staticProducts]

  for (const product of extra) {
    if (!product.image || ids.has(product.id) || slugs.has(product.slug)) continue
    merged.push(product)
  }

  return merged
}

/** Built-in products merged with the ones admins created in MongoDB. */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const dtos = await api.getStorefrontProducts()
    return mergeProducts(dtos.map(dtoToProduct))
  } catch {
    return staticProducts
  }
}
