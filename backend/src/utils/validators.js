export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}
