import { Router } from 'express'
import { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook } from '../controllers/razorpayController.js'
import { requireAuth } from '../middlewares/auth.js'

const router = Router()

router.post('/webhook', razorpayWebhook)

router.use(requireAuth)

router.post('/create-order', createRazorpayOrder)
router.post('/verify-payment', verifyRazorpayPayment)

export default router
