import Feedback from '../models/Feedback.js'
import { isValidEmail, isNonEmptyString } from '../utils/validators.js'

export async function createFeedback(req, res) {
  const { name, email = '', message, rating = 5 } = req.body || {}
  if (!isNonEmptyString(name) || !isNonEmptyString(message)) {
    return res.status(400).json({ error: 'Name and message are required' })
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  const ratingNum = Number(rating)
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5' })
  }
  const doc = await Feedback.create({
    name,
    email: email || undefined,
    message,
    rating: ratingNum,
  })
  res.status(201).json({
    ok: true,
    feedback: {
      _id: doc._id,
      name: doc.name,
      message: doc.message,
      rating: doc.rating,
      createdAt: doc.createdAt,
    },
  })
}

export async function listFeedback(req, res) {
  const feedbacks = await Feedback.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .select('_id name email message rating createdAt')
    .lean()
  res.json({ feedbacks })
}
