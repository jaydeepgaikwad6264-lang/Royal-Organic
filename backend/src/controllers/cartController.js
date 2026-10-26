import Cart from '../models/Cart.js'
import { normalizeVariantId, resolvePurchasableItem } from '../services/catalogService.js'

function itemKey(productId, variantId) {
  return `${productId}::${variantId || ''}`
}

export async function getCart(req, res) {
  try {
    const userId = req.user.id
    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] })
    }
    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get cart' })
  }
}

export async function addToCart(req, res) {
  try {
    const userId = req.user.id
    const { productId } = req.body
    const quantity = Number(req.body.quantity)
    const variantId = req.body.variantId

    if (!productId || !Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'productId and quantity are required' })
    }

    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] })
    }

    const normalizedVariantId = normalizeVariantId(variantId)
    const existingItemIndex = cart.items.findIndex(item => itemKey(item.productId, item.variantId) === itemKey(productId, normalizedVariantId))
    const nextQuantity = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity + quantity : quantity

    const resolved = await resolvePurchasableItem({ productId, variantId: normalizedVariantId, quantity: nextQuantity })
    if (!resolved.ok) return res.status(400).json({ error: resolved.error })

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = nextQuantity
      cart.items[existingItemIndex].pricePerUnit = resolved.pricePerUnit
      cart.items[existingItemIndex].variantId = resolved.variantId
      cart.items[existingItemIndex].variantLabel = resolved.variantLabel
      cart.items[existingItemIndex].grams = resolved.grams
    } else {
      cart.items.push({
        productId,
        variantId: resolved.variantId,
        variantLabel: resolved.variantLabel,
        grams: resolved.grams,
        quantity,
        pricePerUnit: resolved.pricePerUnit,
      })
    }

    await cart.save()
    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
}

export async function updateQuantity(req, res) {
  try {
    const userId = req.user.id
    const { productId } = req.body
    const quantity = Number(req.body.quantity)
    const variantId = req.body.variantId

    if (!productId || !Number.isFinite(quantity)) {
      return res.status(400).json({ error: 'productId and quantity are required' })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    const normalizedVariantId = normalizeVariantId(variantId)
    const itemIndex = cart.items.findIndex(item => itemKey(item.productId, item.variantId) === itemKey(productId, normalizedVariantId))
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' })
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      const resolved = await resolvePurchasableItem({ productId, variantId: normalizedVariantId, quantity })
      if (!resolved.ok) return res.status(400).json({ error: resolved.error })
      cart.items[itemIndex].quantity = quantity
      cart.items[itemIndex].pricePerUnit = resolved.pricePerUnit
      cart.items[itemIndex].variantId = resolved.variantId
      cart.items[itemIndex].variantLabel = resolved.variantLabel
      cart.items[itemIndex].grams = resolved.grams
    }

    await cart.save()
    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update quantity' })
  }
}

export async function removeFromCart(req, res) {
  try {
    const userId = req.user.id
    const { productId } = req.params
    const variantId = normalizeVariantId(req.query.variantId)

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    if (variantId) {
      cart.items = cart.items.filter(item => itemKey(item.productId, item.variantId) !== itemKey(productId, variantId))
    } else {
      cart.items = cart.items.filter(item => item.productId !== productId)
    }

    await cart.save()
    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
}

export async function clearCart(req, res) {
  try {
    const userId = req.user.id
    const cart = await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true, upsert: true })
    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
}
