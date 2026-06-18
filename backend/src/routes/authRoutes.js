import { Router } from 'express'
import { register, login, googleAuth, googleCallback } from '../controllers/authController.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)

// Google OAuth 2.0
router.get('/google', googleAuth)
router.get('/google/callback', googleCallback)

export default router
