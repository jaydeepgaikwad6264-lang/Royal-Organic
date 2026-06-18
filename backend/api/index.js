import mongoose from 'mongoose'
import app from '../src/app.js'

let connectionPromise = null

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production')
  }

  // Cache the in-flight connection so parallel invocations reuse it.
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,
    })
  }

  await connectionPromise
}

export default async function handler(req, res) {
  // #region debug-point backend-vercel-crash-entry
  try {
    await connectToDatabase()
  } catch (error) {
    return res.status(500).json({
      error: 'Database connection failed',
      debugSession: 'backend-vercel-crash',
      stage: 'connectToDatabase',
      details: error instanceof Error ? error.message : 'Unknown error',
      hasMongoUri: Boolean(process.env.MONGO_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      hasStripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
      hasFrontendUrl: Boolean(process.env.FRONTEND_URL),
      hasCorsOrigin: Boolean(process.env.CORS_ORIGIN),
      mongooseReadyState: mongoose.connection.readyState,
    })
  }

  try {
    return app(req, res)
  } catch (error) {
    return res.status(500).json({
      error: 'App invocation failed',
      debugSession: 'backend-vercel-crash',
      stage: 'appHandler',
      details: error instanceof Error ? error.message : 'Unknown error',
      mongooseReadyState: mongoose.connection.readyState,
      path: req.url,
      method: req.method,
    })
  }
  // #endregion
}
