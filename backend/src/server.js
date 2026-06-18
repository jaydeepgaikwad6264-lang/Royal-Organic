// Server entrypoint
// - Connects to MongoDB
// - Starts Express server
import http from 'http'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app.js'
import { MongoMemoryServer } from 'mongodb-memory-server'

dotenv.config()

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI

async function start() {
  try {
    let uri = MONGO_URI
    if (!uri) {
      console.warn('MONGO_URI not set, starting in-memory MongoDB for development')
      const mongod = await MongoMemoryServer.create()
      uri = mongod.getUri()
    }
    await mongoose.connect(uri, { autoIndex: true })
    console.log('MongoDB connected')
    const server = http.createServer(app)
    server.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

start()
