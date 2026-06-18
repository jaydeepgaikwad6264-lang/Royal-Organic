'use client'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import FormField from '../../components/FormField'
import Link from 'next/link'
import { useCart } from '../../lib/cartContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const { fetchCart } = useCart()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const valid = !!token && token !== 'undefined' && token !== 'null'
    setSignedIn(valid)
    if (valid) {
      fetchCart()
    }
  }, [fetchCart])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(email, password)
      localStorage.setItem('token', res.token)
      setSignedIn(true)
      await fetchCart()
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[60vh] bg-royal-beige">
      <div className="container py-12 flex justify-center">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-royal-sand bg-white p-6 grid gap-4" aria-label="Login">
          <h1 className="font-heading text-3xl text-royal-text text-center">Login</h1>
          {signedIn && (
            <div className="rounded-md border border-royal-sand bg-royal-beige p-3 text-sm text-royal-green/80">
              You are already signed in.
              <div className="mt-3 flex gap-3">
                <Link href="/shop" className="btn-primary px-4 py-2">Go to Shop</Link>
                <button
                  type="button"
                  className="btn-outline px-4 py-2"
                  onClick={() => { 
                    localStorage.removeItem('token'); 
                    setSignedIn(false);
                    fetchCart(); // clear cart on logout
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
          <FormField id="email" label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@example.com" />
          <FormField id="password" label="Password" type="password" value={password} onChange={setPassword} required placeholder="••••••••" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="btn-primary px-6 py-3" disabled={loading} aria-busy={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
          <a className="btn-outline px-6 py-3 text-center" href={api.googleUrl()} aria-label="Continue with Google">
            Continue with Google
          </a>
        </form>
      </div>
    </main>
  )
}
