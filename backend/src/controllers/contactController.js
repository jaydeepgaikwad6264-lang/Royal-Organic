import Contact from '../models/Contact.js'
import { isValidEmail, isNonEmptyString } from '../utils/validators.js'

export async function createContact(req, res) {
  const { name, email, subject = '', message } = req.body || {}
  if (!isNonEmptyString(name) || !isValidEmail(email) || !isNonEmptyString(message)) {
    return res.status(400).json({ error: 'Invalid contact data' })
  }
  await Contact.create({ name, email, subject, message })
  res.status(201).json({ ok: true })
}
