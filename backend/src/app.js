// Core Express app setup
// - Loads security middleware (helmet, cors)
// - Parses JSON payloads
// - Wires API routes
// - Centralized error handling
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import passport from 'passport'
import './config/passport.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import razorpayRoutes from './routes/razorpayRoutes.js'
import shiprocketRoutes from './routes/shiprocketRoutes.js'
import { notFound, errorHandler } from './middlewares/error.js'

dotenv.config()

const app = express()

// Security and parsing
app.use(helmet())
app.use(cors({ origin: [process.env.CORS_ORIGIN, process.env.FRONTEND_URL].filter(Boolean), credentials: false }))
// Use raw body ONLY for Razorpay webhook (needs exact bytes for HMAC signature check).
// All other endpoints (including Shiprocket webhook which validates via x-api-key header
// and expects req.body as a parsed JSON object) use standard express.json().
app.use((req, res, next) => {
  if (req.originalUrl === '/api/razorpay/webhook') {
    express.raw({ type: 'application/json' })(req, res, next)
  } else {
    express.json({ limit: '1mb' })(req, res, next)
  }
})
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Initialize Passport for Google OAuth
app.use(passport.initialize())

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'royal-organics-api' }))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/razorpay', razorpayRoutes)
app.use('/api/shiprocket', shiprocketRoutes)

// 404 and errors
app.use(notFound)
app.use(errorHandler)

export default app
