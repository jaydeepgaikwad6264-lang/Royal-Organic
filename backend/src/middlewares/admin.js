export function requireAdmin(req, res, next) {
  const allowList = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  const email = String(req.user?.email || '').toLowerCase()
  if (!email || allowList.length === 0 || !allowList.includes(email)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
