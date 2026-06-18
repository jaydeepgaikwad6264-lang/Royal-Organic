'use client'
import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateEmail(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }
    // Placeholder submit; integrate with backend/ESP later
    setStatus('success')
    setMessage('Thank you for joining the Royal newsletter!')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl" aria-label="Newsletter signup">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-3">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 border border-royal-sand rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-green/40"
          aria-invalid={status === 'error'}
          aria-describedby="newsletter-help"
        />
        <button type="submit" className="btn-primary px-6 py-3">
          Join
        </button>
      </div>
      <p id="newsletter-help" className={`mt-2 text-sm ${status === 'error' ? 'text-red-600' : 'text-royal-green/70'}`}>
        {message || 'Monthly wellness tips, product news, and subscriber-only offers.'}
      </p>
    </form>
  )
}
