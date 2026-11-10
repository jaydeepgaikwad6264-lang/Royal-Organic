import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/admin.js'
import { listAllOrders, listAllProducts, createProduct } from '../controllers/adminController.js'

const router = Router()

router.use(requireAuth)
router.use(requireAdmin)

router.get('/orders', listAllOrders)
router.get('/products', listAllProducts)
router.post('/products', createProduct)

export default router
