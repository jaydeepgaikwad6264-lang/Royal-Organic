// Configure Passport Google OAuth 2.0 strategy
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback'

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim()
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })
          if (!user) {
            user = await User.create({
              name,
              email,
              googleId: profile.id,
              authProvider: 'google',
              avatar: profile.photos?.[0]?.value,
            })
          } else if (!user.googleId) {
            user.googleId = profile.id
            user.authProvider = 'google'
            user.avatar = user.avatar || profile.photos?.[0]?.value
            await user.save()
          }
          return done(null, user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
} else {
  console.warn('Google OAuth env not configured. Google login will be disabled.')
}
