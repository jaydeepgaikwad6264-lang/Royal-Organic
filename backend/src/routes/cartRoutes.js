import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../controllers/cartController.js'

const router = Router()

router.use(requireAuth)

router.get('/', getCart)
router.post('/', addToCart)
router.put('/', updateQuantity)
router.delete('/:productId', removeFromCart)
router.delete('/', clearCart)

export default router
