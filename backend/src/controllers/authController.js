// Authentication controller:
// - Manual registration and login
// - Google OAuth callback issuing JWT
import bcrypt from 'bcrypt'
import passport from 'passport'
import dotenv from 'dotenv'
import User from '../models/User.js'
import { isValidEmail, isNonEmptyString } from '../utils/validators.js'
import { signToken } from '../utils/jwt.js'

dotenv.config()

const SALT_ROUNDS = 12
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001'

export async function register(req, res) {
  const { name, email, password } = req.body || {}
  if (!isNonEmptyString(name)) return res.status(400).json({ error: 'Name is required' })
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' })
  if (!isNonEmptyString(password) || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already registered' })
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await User.create({ name, email, password: hash, authProvider: 'manual' })
  const token = signToken({ id: user._id.toString(), email: user.email, provider: user.authProvider })
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, provider: user.authProvider } })
}

export async function login(req, res) {
  const { email, password } = req.body || {}
  if (!isValidEmail(email) || !isNonEmptyString(password)) return res.status(400).json({ error: 'Invalid credentials' })
  const user = await User.findOne({ email }).select('+password')
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  if (user.authProvider !== 'manual') return res.status(400).json({ error: 'Use Google login for this account' })
  const ok = await bcrypt.compare(password, user.password || '')
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = signToken({ id: user._id.toString(), email: user.email, provider: user.authProvider })
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, provider: user.authProvider } })
}

// Initiate Google OAuth
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], session: false })

// Google OAuth callback -> redirect to frontend with token
export function googleCallback(req, res, next) {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${FRONTEND_URL}/login?error=Google authentication failed`)
    }
    const token = signToken({ id: user._id.toString(), email: user.email, provider: user.authProvider })
    const userData = encodeURIComponent(JSON.stringify({ id: user._id, name: user.name, email: user.email, provider: user.authProvider, avatar: user.avatar }))
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`)
  })(req, res, next)
}
