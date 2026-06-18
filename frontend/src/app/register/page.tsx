'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import FormField from '../../components/FormField'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) router.replace('/')
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await api.register(name, email, password)
      localStorage.setItem('token', res.token)
      router.push('/shop')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[60vh] bg-royal-beige">
      <div className="container py-12 flex justify-center">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-royal-sand bg-white p-6 grid gap-4" aria-label="Register">
          <h1 className="font-heading text-3xl text-royal-text text-center">Create Account</h1>
          <FormField id="name" label="Full Name" value={name} onChange={setName} required placeholder="Jane Doe" />
          <FormField id="email" label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@example.com" />
          <FormField id="password" label="Password" type="password" value={password} onChange={setPassword} required placeholder="At least 8 characters" />
          <FormField id="confirm" label="Confirm Password" type="password" value={confirm} onChange={setConfirm} required placeholder="Repeat password" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="btn-primary px-6 py-3" disabled={loading} aria-busy={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
          <a className="btn-outline px-6 py-3 text-center" href={api.googleUrl()} aria-label="Sign up with Google">
            Sign up with Google
          </a>
        </form>
      </div>
    </main>
  )
}
