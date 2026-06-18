import Cart from '../models/Cart.js'

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
    const { productId, quantity, pricePerUnit } = req.body

    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId === productId)
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({ productId, quantity, pricePerUnit })
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
    const { productId, quantity } = req.body

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId)
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' })
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
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

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    cart.items = cart.items.filter(item => item.productId !== productId)
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
