'use client'
import { useState } from 'react'
import FormField from '../../components/FormField'
import { api } from '../../lib/api'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      if (!name || !email || !message) {
        throw new Error('Full Name, Email, and Message are required')
      }
      await api.contact(name, email, subject, message)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Submission failed')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-[60vh] bg-royal-beige">
      <div className="container py-12 flex justify-center">
        <form onSubmit={onSubmit} className="w-full max-w-lg rounded-xl border border-royal-sand bg-white p-6 grid gap-4" aria-label="Contact us">
          <h1 className="font-heading text-3xl text-royal-text text-center">Contact Us</h1>
          <FormField id="name" label="Full Name" value={name} onChange={setName} required placeholder="Jane Doe" />
          <FormField id="email" label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@example.com" />
          <FormField id="subject" label="Subject" value={subject} onChange={setSubject} placeholder="Optional" />
          <div className="grid gap-1">
            <label htmlFor="message" className="text-sm text-royal-muted">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="border border-royal-sand rounded-md px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-royal-green/40"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {status === 'success' && (
            <div className="text-sm text-royal-green">
              Thank you for contacting Royal Organics. We’ll get back to you within 24–48 hours.
            </div>
          )}
          <button type="submit" className="btn-primary px-6 py-3" disabled={status === 'loading'} aria-busy={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Submit'}
          </button>
          <div className="text-sm text-royal-muted text-center">
            Support: indicraftroyal@gmail.com • Business hours: 9am–6pm ET
          </div>
        </form>
      </div>
    </main>
  )
}
