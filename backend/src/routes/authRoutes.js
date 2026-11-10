import { Router } from 'express'
import { register, login, me, googleAuth, googleCallback } from '../controllers/authController.js'
import { requireAuth } from '../middlewares/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, me)

// Google OAuth 2.0
router.get('/google', googleAuth)
router.get('/google/callback', googleCallback)

export default router
