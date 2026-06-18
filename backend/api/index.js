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
  await connectToDatabase()
  return app(req, res)
}
