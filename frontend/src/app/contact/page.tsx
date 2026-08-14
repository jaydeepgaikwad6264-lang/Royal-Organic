'use client'
import { useState } from 'react'
import FormField from '../../components/FormField'
import { api } from '../../lib/api'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'

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
    <div className="container py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form onSubmit={onSubmit} className="w-full rounded-xl border border-royal-sand bg-white p-6 grid gap-4" aria-label="Contact us">
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
        <div className="w-full rounded-xl border border-royal-sand bg-white p-6 h-fit">
  <h2 className="font-heading text-2xl text-royal-text mb-4 text-center">
    Contact Information
  </h2>

  <div className="space-y-4">
    <div>
      <h3 className="font-semibold text-royal-text">Email</h3>
      <a
        href="mailto:indicraftroyal@gmail.com"
        className="text-royal-green hover:underline"
      >
        indicraftroyal@gmail.com
      </a>
    </div>

    <div>
      <h3 className="font-semibold text-royal-text">Phone</h3>
      <a
        href="tel:+919217594902"
        className="text-royal-green hover:underline"
      >
        +91 9217594902
      </a>
    </div>

    <div>
      <h3 className="font-semibold text-royal-text mb-2">Location</h3>
      <p className="text-royal-muted mb-3">
        Royal Organics, Floor 3, House No. 29/1, Indra Vikas Colony, New Delhi, India
      </p>

      <div className="overflow-hidden rounded-lg border border-royal-sand">
        <iframe
          src="https://maps.google.com/maps?q=28.7145685,77.2055485&z=17&output=embed"
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Royal Organics Location"
        />
      </div>
      <div className="pt-4 border-t border-royal-sand">
  <h3 className="font-semibold text-royal-text mb-3">
    Follow Us
  </h3>

 <div className="flex items-center gap-5">
  <a
    href="https://www.linkedin.com/in/devesh-rajput-999a601b2"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
    className="text-[#0A66C2] hover:scale-110 transition-transform"
  >
    <FaLinkedin size={32} />
  </a>

  <a
    href="https://www.facebook.com/share/16DKCXnBGiw/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="text-[#1877F2] hover:scale-110 transition-transform"
  >
    <FaFacebook size={32} />
  </a>

  <a
    href="https://www.instagram.com/royalorganics_01"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="text-[#E4405F] hover:scale-110 transition-transform"
  >
    <FaInstagram size={32} />
  </a>
</div>
</div>
    </div>
  </div>
</div>
      </div>
    </main>
  )
}
