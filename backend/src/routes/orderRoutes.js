import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { createOrder, updateOrder, deleteOrder, createPaymentIntent, confirmPayment, getOrders, getOrderById } from '../controllers/orderController.js'

const router = Router()

router.use(requireAuth)

router.post('/', createOrder)
router.put('/:id', updateOrder)
router.delete('/:id', deleteOrder)
router.post('/create-payment-intent', createPaymentIntent)
router.post('/confirm-payment', confirmPayment)
router.get('/', getOrders)
router.get('/:id', getOrderById)

export default router
