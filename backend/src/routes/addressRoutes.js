import { Router } from 'express'
import { createAddress, getAddresses, updateAddress, deleteAddress } from '../controllers/addressController.js'
import { requireAuth } from '../middlewares/auth.js'

const router = Router()

router.use(requireAuth)

router.post('/', createAddress)
router.get('/', getAddresses)
router.put('/:id', updateAddress)
router.delete('/:id', deleteAddress)

export default router
