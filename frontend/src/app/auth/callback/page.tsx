import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Authenticating...',
  description: 'Completing sign-in for Royal Organics. Please wait while we verify your account and redirect you.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/auth/callback' },
  openGraph: {
    title: 'Authenticating | Royal Organics',
    description: 'Completing sign-in for Royal Organics.',
    url: 'https://royalorganics.in/auth/callback',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary' },
}

'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '../../../lib/cartContext'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchCart } = useCart()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    console.log('Auth callback loaded')
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')
    const error = searchParams.get('error')
    
    console.log('Token:', token)
    console.log('UserStr:', userStr)
    console.log('Error:', error)

    if (error) {
      console.log('Redirecting to login with error')
      setStatus('Error: ' + error)
      router.push('/login?error=' + encodeURIComponent(error))
      return
    }

    if (token && userStr) {
      console.log('Saving to localStorage and redirecting to shop')
      localStorage.setItem('token', token)
      localStorage.setItem('user', userStr)
      setStatus('Success! Redirecting to shop...')
      
      // Fetch cart before redirecting
      fetchCart().then(() => {
        router.push('/shop')
      })
    } else {
      console.log('Missing token or user, redirecting to login')
      setStatus('Missing info, redirecting to login...')
      router.push('/login')
    }
  }, [router, searchParams, fetchCart])

  return (
    <div className="min-h-screen flex items-center justify-center bg-royal-beige">
      <div className="text-center">
        <h2 className="text-2xl font-heading text-royal-text">{status}</h2>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  )
}
