// d:\mywork\Royal Organics\backend\src\routes\shiprocketRoutes.js
import { Router } from 'express'
import { shiprocketWebhook } from '../controllers/shiprocketController.js'

const router = Router()

// Public webhook — raw body parsed in app.js
router.post('/webhook', shiprocketWebhook)

export default router