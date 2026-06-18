// JWT auth middleware to protect routes
import User from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const [type, token] = header.split(' ')
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = { id: user._id.toString(), email: user.email, provider: user.authProvider }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
