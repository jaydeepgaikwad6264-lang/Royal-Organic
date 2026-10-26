import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/admin.js'
import { getCatalogProduct, getCatalogProductBySlugHandler, updateVariantStock } from '../controllers/catalogController.js'

const router = Router()

router.get('/products/slug/:slug', getCatalogProductBySlugHandler)
router.get('/products/:productId', getCatalogProduct)

router.use(requireAuth)
router.use(requireAdmin)
router.put('/products/:productId/variants/:variantId/stock', updateVariantStock)

export default router
