function adminEmails() {
  return String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email) {
  const normalized = String(email || '').toLowerCase()
  if (!normalized) return false
  return adminEmails().includes(normalized)
}

export function requireAdmin(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
